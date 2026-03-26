import { generateClaudeCompletion } from './claude'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getArtifactPrompt, ArtifactFormat } from './prompts'

const MAX_CONTEXT_CHARS = 80_000

export async function buildArtifactSourceContext(notebookId: string, filterSourceIds?: string[]) {
  const serviceClient = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  let sourceQuery = serviceClient.from('sources').select('id, title').eq('notebook_id', notebookId).eq('status', 'ready')
  if (filterSourceIds && filterSourceIds.length > 0) sourceQuery = sourceQuery.in('id', filterSourceIds)

  const { data: sources } = await sourceQuery
  if (!sources || sources.length === 0) throw new Error('No ready sources found.')

  const sourceIds = sources.map(s => s.id)
  const { data: chunks } = await serviceClient.from('source_chunks').select('source_id, content, chunk_index').in('source_id', sourceIds).order('source_id').order('chunk_index')
  if (!chunks || chunks.length === 0) throw new Error('No source chunks found.')

  const sourceMap = new Map<string, string[]>()
  for (const chunk of chunks) {
    if (!sourceMap.has(chunk.source_id)) sourceMap.set(chunk.source_id, [])
    sourceMap.get(chunk.source_id)!.push(chunk.content)
  }

  let contextText = ''
  let totalChars = 0
  for (const source of sources) {
    const section = `\n### ${source.title}\n${(sourceMap.get(source.id) || []).join('\n')}\n`
    if (totalChars + section.length > MAX_CONTEXT_CHARS) { contextText += '\n[Additional sources truncated]'; break }
    contextText += section
    totalChars += section.length
  }

  return { contextText, sourceCount: sources.length }
}

export async function generateArtifact(format: ArtifactFormat, sourceContext: string) {
  const prompt = getArtifactPrompt(format)
  const content = await generateClaudeCompletion({ system: prompt.system, messages: [{ role: 'user', content: prompt.userTemplate(sourceContext) }], maxTokens: 8192 })
  return { content, wordCount: content.trim().split(/\s+/).length }
}

export async function processArtifactJob(artifactId: string, notebookId: string, format: ArtifactFormat, filterSourceIds?: string[]) {
  const serviceClient = createServiceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const updateStatus = async (status: string, extra?: Record<string, unknown>) =>
    serviceClient.from('artifacts').update({ status, updated_at: new Date().toISOString(), ...extra }).eq('id', artifactId)

  try {
    await updateStatus('generating')
    const { contextText, sourceCount } = await buildArtifactSourceContext(notebookId, filterSourceIds)
    const { content, wordCount } = await generateArtifact(format, contextText)
    await updateStatus('ready', { content, word_count: wordCount, metadata: { source_count: sourceCount, format } })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`Artifact Pipeline Error [${artifactId}]:`, errorMsg)
    await updateStatus('error', { error: errorMsg })
  }
}
