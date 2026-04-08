import { env } from '@/lib/env';
import { generateClaudeCompletion } from './claude'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getArtifactPrompt, ArtifactFormat } from './prompts'

// ── SOURCE CONTEXT (shared with audio-overview, intentionally duplicated for module isolation) ──

const MAX_CONTEXT_CHARS = 80_000

export async function buildArtifactSourceContext(
  notebookId: string,
  filterSourceIds?: string[] // FR-17: optional source subset (null = all)
): Promise<{
  contextText: string
  sourceCount: number
}> {
  const serviceClient = createServiceClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  )

  let sourceQuery = serviceClient
    .from('sources')
    .select('id, title')
    .eq('notebook_id', notebookId)
    .eq('status', 'ready')

  // FR-17: Scope to selected sources when provided
  if (filterSourceIds && filterSourceIds.length > 0) {
    sourceQuery = sourceQuery.in('id', filterSourceIds)
  }

  const { data: sources } = await sourceQuery

  if (!sources || sources.length === 0) {
    throw new Error('No ready sources found. Upload and process at least one source first.')
  }

  const sourceIds = sources.map(s => s.id)
  const { data: chunks } = await serviceClient
    .from('source_chunks')
    .select('source_id, content, chunk_index')
    .in('source_id', sourceIds)
    .order('source_id')
    .order('chunk_index')

  if (!chunks || chunks.length === 0) {
    throw new Error('No source chunks found. Sources may still be processing.')
  }

  const sourceMap = new Map<string, string[]>()
  for (const chunk of chunks) {
    if (!sourceMap.has(chunk.source_id)) sourceMap.set(chunk.source_id, [])
    sourceMap.get(chunk.source_id)!.push(chunk.content)
  }

  let contextText = ''
  let totalChars = 0

  for (const source of sources) {
    const sourceChunks = sourceMap.get(source.id) || []
    const section = `\n### ${source.title}\n${sourceChunks.join('\n')}\n`
    if (totalChars + section.length > MAX_CONTEXT_CHARS) {
      contextText += '\n[Additional sources truncated — context limit reached]'
      break
    }
    contextText += section
    totalChars += section.length
  }

  return { contextText, sourceCount: sources.length }
}

// ── GENERATION ────────────────────────────────────────────────────────────────

export async function generateArtifact(
  format: ArtifactFormat,
  sourceContext: string
): Promise<{ content: string; wordCount: number }> {
  const prompt = getArtifactPrompt(format)

  // DEBT-003 RESOLVED: migrated off direct new Anthropic() to claude.ts wrapper
  const content = await generateClaudeCompletion({
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.userTemplate(sourceContext) }],
    maxTokens: 8192,
  })
  const wordCount = content.trim().split(/\s+/).length

  return { content, wordCount }
}

// ── BACKGROUND PIPELINE ───────────────────────────────────────────────────────

export async function processArtifactJob(
  artifactId: string,
  notebookId: string,
  format: ArtifactFormat,
  filterSourceIds?: string[] // FR-17: optional source subset (mind map scoping)
) {
  const serviceClient = createServiceClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  )

  const updateStatus = async (status: string, extra?: Record<string, unknown>) => {
    await serviceClient
      .from('artifacts')
      .update({ status, updated_at: new Date().toISOString(), ...extra })
      .eq('id', artifactId)
  }

  try {
    await updateStatus('generating')

    const { contextText, sourceCount } = await buildArtifactSourceContext(notebookId, filterSourceIds)
    const { content, wordCount } = await generateArtifact(format, contextText)

    await updateStatus('ready', {
      content,
      word_count: wordCount,
      metadata: { source_count: sourceCount, format },
    })

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`Artifact Pipeline Error [${artifactId}]:`, errorMsg)
    await updateStatus('error', { error: errorMsg })
  }
}
