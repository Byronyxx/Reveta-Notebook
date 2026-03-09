import { SourceAdapter, IngestInput, ExtractionResult } from './index'

export class AudioAdapter implements SourceAdapter {
    canHandle(input: IngestInput): boolean {
        return !!input.filename && (input.filename.endsWith('.mp3') || input.filename.endsWith('.wav')) ||
            !!input.mimetype && input.mimetype.startsWith('audio/');
    }

    async extract(input: IngestInput): Promise<ExtractionResult> {
        if (!input.buffer) throw new Error('No buffer provided for Audio extraction');

        // Stub implementation for Audio ingest
        // In higher tiers, we'd hook up to Whisper STT here.
        return {
            text: "[Audio transcription stubbed. Requires API routing to Whisper STT.]",
            wordCount: 10,
            metadata: { format: 'audio' }
        };
    }
}
