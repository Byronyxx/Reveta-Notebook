// @ts-nocheck
import { SourceAdapter, IngestInput, ExtractionResult } from './index'
import pdfParse from 'pdf-parse'

export class PdfAdapter implements SourceAdapter {
    canHandle(input: IngestInput): boolean {
        return !!input.filename && input.filename.endsWith('.pdf') || input.mimetype === 'application/pdf';
    }

    async extract(input: IngestInput): Promise<ExtractionResult> {
        if (!input.buffer) throw new Error('No buffer provided for PDF extraction');

        // Using pdf-parse natively to extract text streams
        const data = await pdfParse(input.buffer);
        const text = data.text.replace(/\s+/g, ' ').trim();
        const wordCount = text.split(/\s+/).filter((w: string) => w.length > 0).length;

        return {
            text,
            wordCount,
            metadata: {
                format: 'pdf',
                pages: data.numpages,
                author: data.info?.Author,
                title: data.info?.Title
            }
        };
    }
}
