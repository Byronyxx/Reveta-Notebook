import { SourceAdapter, IngestInput, ExtractionResult } from './index'

const WHISPER_MAX_BYTES = 25 * 1024 * 1024; // 25MB OpenAI hard limit

export class AudioAdapter implements SourceAdapter {
    canHandle(input: IngestInput): boolean {
        return (
            (!!input.filename && (
                input.filename.endsWith('.mp3') ||
                input.filename.endsWith('.wav') ||
                input.filename.endsWith('.m4a') ||
                input.filename.endsWith('.webm') ||
                input.filename.endsWith('.ogg')
            )) ||
            (!!input.mimetype && input.mimetype.startsWith('audio/'))
        );
    }

    async extract(input: IngestInput): Promise<ExtractionResult> {
        if (!input.buffer) throw new Error('No audio buffer provided for transcription.');

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error('OPENAI_API_KEY is required for audio transcription (Whisper).');

        if (input.buffer.byteLength > WHISPER_MAX_BYTES) {
            throw new Error(`Audio file exceeds Whisper's 25MB limit (${(input.buffer.byteLength / 1048576).toFixed(1)}MB received). Please compress or split the file.`);
        }

        // Build multipart form for Whisper API
        const blob = new Blob([new Uint8Array(input.buffer)], { type: input.mimetype || 'audio/mpeg' });
        const formData = new FormData();
        formData.append('file', blob, input.filename || 'audio.mp3');
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'text');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}` },
            body: formData,
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Whisper transcription failed: ${err}`);
        }

        const text = await response.text();
        const wordCount = text.trim().split(/\s+/).length;

        return {
            text,
            wordCount,
            metadata: {
                format: 'audio',
                transcription_model: 'whisper-1',
                original_filename: input.filename,
            },
        };
    }
}
