import { SourceAdapter, IngestInput, ExtractionResult } from './index'
export class TxtAdapter implements SourceAdapter {
    canHandle(input: IngestInput): boolean {
        return !!input.filename && (input.filename.endsWith('.txt') || input.filename.endsWith('.md')) ||
            input.mimetype === 'text/plain' || input.mimetype === 'text/markdown'
    }
    async extract(input: IngestInput): Promise<ExtractionResult> {
        if (!input.buffer) throw new Error('No buffer provided for TXT extraction')
        const text = input.buffer.toString('utf-8')
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length
        return { text, wordCount, metadata: { format: input.filename?.endsWith('.md') ? 'markdown' : 'plaintext' } }
    }
}
