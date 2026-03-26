import { SourceAdapter, IngestInput, ExtractionResult } from './index'
import mammoth from 'mammoth'
export class DocxAdapter implements SourceAdapter {
    canHandle(input: IngestInput): boolean {
        return !!input.filename && input.filename.endsWith('.docx') ||
            input.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    }
    async extract(input: IngestInput): Promise<ExtractionResult> {
        if (!input.buffer) throw new Error('No buffer provided for DOCX extraction')
        const { value: text } = await mammoth.extractRawText({ buffer: input.buffer })
        const cleanText = text.replace(/\s+/g, ' ').trim()
        return { text: cleanText, wordCount: cleanText.split(/\s+/).filter(w => w.length > 0).length, metadata: { format: 'docx' } }
    }
}
