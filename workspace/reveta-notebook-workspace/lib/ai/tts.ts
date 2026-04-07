import { AudioFormat } from './prompts'

// ── VOICE MAP ─────────────────────────────────────────────────────────────────
// OpenAI TTS voices selected for distinct character contrast:
//   ALEX — 'alloy':  Clear, measured, authoritative. The analytical anchor.
//   SAM  — 'echo':   Warmer, more questioning. The curious challenger.
//   HOST — 'nova':   Polished broadcast voice for single-host formats.

type OpenAIVoice = 'alloy' | 'echo' | 'nova' | 'onyx' | 'fable' | 'shimmer'

const VOICE_MAP: Record<'ALEX' | 'SAM' | 'HOST', OpenAIVoice> = {
  ALEX: 'alloy',
  SAM:  'echo',
  HOST: 'nova',
}

// Formats that use dual hosts
const DUAL_HOST_FORMATS: AudioFormat[] = ['deep_dive', 'critique', 'debate']

export interface SpeakerLine {
  speaker: 'ALEX' | 'SAM' | 'HOST'
  text: string
  format: AudioFormat
}

// ── TTS REQUEST ───────────────────────────────────────────────────────────────

/**
 * Synthesize a single line of text to MP3 audio buffer using OpenAI TTS.
 * Returns a Buffer containing the MP3 audio data.
 */
async function synthesizeLine(text: string, voice: OpenAIVoice): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY is required for TTS synthesis.')

  // Clean up text for TTS (remove any stray speaker tags, etc.)
  const cleanText = text
    .replace(/\[(ALEX|SAM|HOST)\]:\s*/g, '')
    .replace(/\[Source: [a-f0-9-]+\]/g, '')
    .trim()

  if (!cleanText) return Buffer.alloc(0)

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',         // tts-1 for speed; tts-1-hd for quality
      input: cleanText,
      voice,
      response_format: 'mp3',
      speed: 1.0,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI TTS synthesis failed for voice "${voice}": ${err}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// ── BATCH SYNTHESIS WITH CONCURRENCY CONTROL ──────────────────────────────────

const MAX_CONCURRENT_TTS = 3  // OpenAI TTS rate limit headroom

async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(processor))
    results.push(...batchResults)
  }

  return results
}

// ── MAIN SYNTHESIS ORCHESTRATOR ───────────────────────────────────────────────

/**
 * Synthesize a full parsed script to a single concatenated MP3 buffer.
 * Processes lines in batches to respect OpenAI TTS rate limits.
 *
 * MP3 concatenation: OpenAI TTS outputs standard MP3 frames, and raw
 * buffer concatenation produces a valid (though variable-bitrate) MP3 file
 * suitable for playback. Production upgrade: use ffmpeg for proper muxing.
 */
export async function synthesizeScript(lines: SpeakerLine[]): Promise<Buffer> {
  if (lines.length === 0) throw new Error('No speaker lines to synthesize.')

  // Filter out lines that are too short to synthesize meaningfully
  const validLines = lines.filter(l => l.text.trim().length > 2)

  const audioBuffers = await processBatch(
    validLines,
    async (line) => {
      const voice = VOICE_MAP[line.speaker]
      return synthesizeLine(line.text, voice)
    },
    MAX_CONCURRENT_TTS
  )

  // Concatenate all MP3 buffers into a single file
  const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.length, 0)
  const combined = Buffer.alloc(totalLength)
  let offset = 0

  for (const buf of audioBuffers) {
    buf.copy(combined, offset)
    offset += buf.length
  }

  return combined
}

// ── PREVIEW SYNTHESIS (for UI "sample" feature — first ~30 seconds) ──────────

/**
 * Synthesize only the first N lines of a script for a quick preview.
 * Used by the UI to generate a sample before committing to full synthesis.
 */
export async function synthesizePreview(
  lines: SpeakerLine[],
  maxLines: number = 5
): Promise<Buffer> {
  const previewLines = lines.slice(0, maxLines)
  return synthesizeScript(previewLines)
}
