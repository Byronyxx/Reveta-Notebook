import { SourceAdapter, IngestInput, ExtractionResult } from './index'
const WHISPER_MAX_BYTES = 25 * 1024 * 1024
export class AudioAdapter implements SourceAdapter {
    canHandle(input: IngestInput): boolean {
        return (!!input.filename && ['.mp3','.wav','.m4a','.webm','.ogg'].some(ext => input.filename!.endsWith(ext))) ||
            (!!input.mimetype && input.mimetype.startsWith('audio/'))
    }
    async extract(input: IngestInput): Promise<ExtractionResult> {
        if (!input.buffer) throw new Error('No audio buffer provided for transcription.')
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) throw new Error('OPENAI_API_KEY is required for audio transcription (Whisper).')
        if (input.buffer.byteLength > WHISPER_MAX_BYTES) throw new Error(`Audio file exceeds Whisper's 25MB limit.`)
        const blob = new Blob([input.buffer], { type: input.mimetype || 'audio/mpeg' })
        const formData = new FormData()
        formData.append('file', blob, input.filename || 'audio.mp3')
        formData.append('model', 'whisper-1')
        formData.append('response_format', 'text')
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}` }, body: formData })
        if (!response.ok) throw new Error(`Whisper transcription failed: ${await response.text()}`)
        const text = await response.text()
        return { text, wordCount: text.trim().split(/\s+/).length, metadata: { format: 'audio', transcription_model: 'whisper-1', original_filename: input.filename } }
    }
}
