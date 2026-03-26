import { generateClaudeCompletion } from './claude'
import { getAudioPrompt, AudioFormat } from './prompts'
import { synthesizeScript, SpeakerLine } from './tts'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese',
  it: 'Italian', nl: 'Dutch', pl: 'Polish', ru: 'Russian', ja: 'Japanese',
  zh: 'Chinese (Simplified)', ko: 'Korean', ar: 'Arabic', hi: 'Hindi',
  tr: 'Turkish', sv: 'Swedish', da: 'Danish', no: 'Norwegian', fi: 'Finnish',
}

export interface ParsedLine { speaker: 'ALEX' | 'SAM' | 'HOST'; text: string }

export function parseScript(rawScript: string): ParsedLine[] {
  const lines = rawScript.split('\n').map(l => l.trim()).filter(Boolean)
  const parsed: ParsedLine[] = []
  let current: ParsedLine | null = null
  for (const line of lines) {
    const match = line.match(/^\[(ALEX|SAM|HOST)\]:\s*(.+)/)
    if (match) { if (current) parsed.push(current); current = { speaker: match[1] as 'ALEX' | 'SAM' | 'HOST', text: match[2].trim() } }
    else if (current) current.text += ' ' + line
  }
  if (current) parsed.push(current)
  return parsed.filter(p => p.text.length > 0)
}

const MAX_CONTEXT_CHARS = 80_000

export async function buildSourceContext(notebookId: string) {
  const serviceClient = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const { data: sources } = await serviceClient.from('sources').select('id, title').eq('notebook_id', notebookId).eq('status', 'ready')
  if (!sources || sources.length === 0) throw new Error('No ready sources found.')

  const { data: chunks } = await serviceClient.from('source_chunks').select('source_id, content, chunk_index').in('source_id', sources.map(s => s.id)).order('source_id').order('chunk_index')
  if (!chunks || chunks.length === 0) throw new Error('No source chunks found.')

  const sourceMap = new Map<string, string[]>()
  for (const chunk of chunks) {
    if (!sourceMap.has(chunk.source_id)) sourceMap.set(chunk.source_id, [])
    sourceMap.get(chunk.source_id)!.push(chunk.content)
  }

  let contextText = '', totalChars = 0
  for (const source of sources) {
    const section = `\n### ${source.title}\n${(sourceMap.get(source.id) || []).join('\n')}\n`
    if (totalChars + section.length > MAX_CONTEXT_CHARS) { contextText += '\n[Sources truncated]'; break }
    contextText += section; totalChars += section.length
  }

  return { contextText, sourceCount: sources.length, wordCount: contextText.trim().split(/\s+/).length }
}

export async function generateAudioScript(format: AudioFormat, sourceContext: string, notebookId: string, language = 'en') {
  const prompt = getAudioPrompt(format)
  const langName = LANGUAGE_NAMES[language] || language
  const languageInstruction = language !== 'en'
    ? `\n\nLANGUAGE DIRECTIVE: Generate this entire script in ${langName}. Speaker tags remain in English: [ALEX]:, [SAM]:, [HOST]:.`
    : ''
  return generateClaudeCompletion({ system: prompt.system + languageInstruction, messages: [{ role: 'user', content: prompt.userTemplate(sourceContext) }], maxTokens: 8192 })
}

export async function processAudioOverviewJob(overviewId: string, notebookId: string, format: AudioFormat, language = 'en') {
  const serviceClient = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const updateStatus = async (status: string, extra?: Record<string, unknown>) =>
    serviceClient.from('audio_overviews').update({ status, ...extra }).eq('id', overviewId)

  try {
    await updateStatus('generating_script')
    const { contextText, sourceCount, wordCount } = await buildSourceContext(notebookId)
    const rawScript = await generateAudioScript(format, contextText, notebookId, language)
    await serviceClient.from('audio_overviews').update({ script: rawScript, metadata: { source_count: sourceCount, script_word_count: wordCount, format } }).eq('id', overviewId)

    await updateStatus('synthesizing')
    const parsedLines = parseScript(rawScript)
    if (parsedLines.length === 0) throw new Error('Script parsing produced no speaker lines.')

    const speakerLines: SpeakerLine[] = parsedLines.map(line => ({ speaker: line.speaker, text: line.text, format }))
    const audioBuffer = await synthesizeScript(speakerLines)

    const storagePath = `${notebookId}/${overviewId}/${format}.mp3`
    const { error: uploadError } = await serviceClient.storage.from('audio-overviews').upload(storagePath, audioBuffer, { contentType: 'audio/mpeg', upsert: true })
    if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

    const estimatedDurationSeconds = Math.round((rawScript.trim().split(/\s+/).length / 150) * 60)
    await updateStatus('ready', { storage_path: storagePath, duration_seconds: estimatedDurationSeconds })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`Audio Overview Pipeline Error [${overviewId}]:`, errorMsg)
    await updateStatus('error', { error: errorMsg })
  }
}
