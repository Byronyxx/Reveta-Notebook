import { generateClaudeCompletion } from './claude'
import { getAudioPrompt, AudioFormat } from './prompts'
import { synthesizeScript, SpeakerLine } from './tts'

// ── LANGUAGE SUPPORT (FR-06) ─────────────────────────────────────────────────

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  pt: 'Portuguese', it: 'Italian', nl: 'Dutch', pl: 'Polish',
  ru: 'Russian', ja: 'Japanese', zh: 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)', ko: 'Korean', ar: 'Arabic',
  hi: 'Hindi', tr: 'Turkish', sv: 'Swedish', da: 'Danish',
  no: 'Norwegian', fi: 'Finnish', he: 'Hebrew', id: 'Indonesian',
  ms: 'Malay', th: 'Thai', uk: 'Ukrainian', cs: 'Czech',
  ro: 'Romanian', hu: 'Hungarian', vi: 'Vietnamese', el: 'Greek',
}

function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] || code
}


import { createClient as createServiceClient } from '@supabase/supabase-js'

// ── SCRIPT PARSING ────────────────────────────────────────────────────────────

const SPEAKER_REGEX = /^\[(ALEX|SAM|HOST)\]:\s*/

export interface ParsedLine {
  speaker: 'ALEX' | 'SAM' | 'HOST'
  text: string
}

/**
 * Parse raw script text into structured speaker lines.
 * Handles both single-line and multi-line utterances.
 */
export function parseScript(rawScript: string): ParsedLine[] {
  const lines = rawScript.split('\n').map(l => l.trim()).filter(Boolean)
  const parsed: ParsedLine[] = []
  let current: ParsedLine | null = null

  for (const line of lines) {
    const match = line.match(/^\[(ALEX|SAM|HOST)\]:\s*(.+)/)
    if (match) {
      if (current) parsed.push(current)
      current = { speaker: match[1] as 'ALEX' | 'SAM' | 'HOST', text: match[2].trim() }
    } else if (current) {
      // Continuation line — append to current speaker's text
      current.text += ' ' + line
    }
  }
  if (current) parsed.push(current)

  return parsed.filter(p => p.text.length > 0)
}

// ── SOURCE CONTEXT BUILDER ────────────────────────────────────────────────────

const MAX_CONTEXT_CHARS = 80_000 // ~20k tokens — leaves room for the large script

/**
 * Pull all ready source chunks for a notebook and assemble into a context block.
 * Uses a service client to bypass RLS in the background pipeline.
 */
export async function buildSourceContext(notebookId: string): Promise<{
  contextText: string
  sourceCount: number
  wordCount: number
}> {
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch all ready source titles for this notebook
  const { data: sources } = await serviceClient
    .from('sources')
    .select('id, title')
    .eq('notebook_id', notebookId)
    .eq('status', 'ready')

  if (!sources || sources.length === 0) {
    throw new Error('No ready sources found in this notebook. Upload and process at least one source first.')
  }

  // Fetch chunks for all ready sources
  const sourceIds = sources.map(s => s.id)
  const { data: chunks } = await serviceClient
    .from('source_chunks')
    .select('source_id, content, chunk_index')
    .in('source_id', sourceIds)
    .order('source_id')
    .order('chunk_index')

  if (!chunks || chunks.length === 0) {
    throw new Error('No source chunks found. The sources may still be processing.')
  }

  // Group chunks by source and assemble, respecting context limit
  const sourceMap = new Map<string, string[]>()
  for (const chunk of chunks) {
    if (!sourceMap.has(chunk.source_id)) sourceMap.set(chunk.source_id, [])
    sourceMap.get(chunk.source_id)!.push(chunk.content)
  }

  let contextText = ''
  let totalChars = 0

  for (const source of sources) {
    const sourceChunks = sourceMap.get(source.id) || []
    const sourceText = sourceChunks.join('\n')
    const section = `\n### ${source.title}\n${sourceText}\n`

    if (totalChars + section.length > MAX_CONTEXT_CHARS) {
      // Add a truncation notice and stop
      contextText += `\n[Note: Additional sources truncated due to context limits — ${sources.length - sourceMap.size} source(s) not included]`
      break
    }

    contextText += section
    totalChars += section.length
  }

  const wordCount = contextText.trim().split(/\s+/).length

  return { contextText, sourceCount: sources.length, wordCount }
}

// ── SCRIPT GENERATION ─────────────────────────────────────────────────────────

/**
 * Generate the script for a given audio format using Claude.
 * Uses the versioned prompt system from lib/ai/prompts.ts.
 */
export async function generateAudioScript(
  format: AudioFormat,
  sourceContext: string,
  notebookId: string,
  language: string = 'en'
): Promise<string> {
  const prompt = getAudioPrompt(format)
  // FR-06: Language injection — instruct Claude to produce the script in the target language
  const languageInstruction = language !== 'en'
    ? `\n\nLANGUAGE DIRECTIVE: Generate this entire script in ${getLanguageName(language)}. All dialogue, narration, and explanations must be in ${getLanguageName(language)}. Speaker tags remain in English: [ALEX]:, [SAM]:, [HOST]:.`
    : ''

  const systemWithLanguage = prompt.system + languageInstruction

  // DEBT-003 RESOLVED: migrated off direct new Anthropic() to claude.ts wrapper
  return generateClaudeCompletion({
    system: systemWithLanguage,
    messages: [{ role: 'user', content: prompt.userTemplate(sourceContext) }],
    maxTokens: 8192,
  })
}

// ── BACKGROUND PIPELINE ───────────────────────────────────────────────────────

/**
 * Full audio overview generation pipeline.
 * Runs as a fire-and-forget background job (mirrors processIngestJob pattern).
 * Updates status in DB at each stage.
 */
export async function processAudioOverviewJob(overviewId: string, notebookId: string, format: AudioFormat, language: string = 'en') {
  // Use service client for all DB writes in background context
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const updateStatus = async (
    status: string,
    extra?: Record<string, unknown>
  ) => {
    await serviceClient
      .from('audio_overviews')
      .update({ status, ...extra })
      .eq('id', overviewId)
  }

  try {
    // ── STAGE 1: Build source context ────────────────────────────────────────
    await updateStatus('generating_script')
    const { contextText, sourceCount, wordCount } = await buildSourceContext(notebookId)

    // ── STAGE 2: Generate script ──────────────────────────────────────────────
    const rawScript = await generateAudioScript(format, contextText, notebookId, language)

    // Save the script to DB (useful for debugging and future features)
    await serviceClient
      .from('audio_overviews')
      .update({
        script: rawScript,
        metadata: { source_count: sourceCount, script_word_count: wordCount, format },
      })
      .eq('id', overviewId)

    // ── STAGE 3: Synthesize audio ─────────────────────────────────────────────
    await updateStatus('synthesizing')

    const parsedLines = parseScript(rawScript)
    if (parsedLines.length === 0) {
      throw new Error('Script parsing produced no speaker lines. Check prompt output format.')
    }

    const speakerLines: SpeakerLine[] = parsedLines.map(line => ({
      speaker: line.speaker,
      text: line.text,
      format,
    }))

    const audioBuffer = await synthesizeScript(speakerLines)

    // ── STAGE 4: Upload to Supabase Storage ───────────────────────────────────
    const storagePath = `${notebookId}/${overviewId}/${format}.mp3`

    const { error: uploadError } = await serviceClient.storage
      .from('audio-overviews')
      .upload(storagePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })

    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    // ── STAGE 5: Estimate duration (~150 words per minute average TTS rate) ──
    const scriptWords = rawScript.trim().split(/\s+/).length
    const estimatedDurationSeconds = Math.round((scriptWords / 150) * 60)

    await updateStatus('ready', {
      storage_path: storagePath,
      duration_seconds: estimatedDurationSeconds,
    })

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`Audio Overview Pipeline Error [${overviewId}]:`, errorMsg)
    await updateStatus('error', { error: errorMsg })
  }
}
