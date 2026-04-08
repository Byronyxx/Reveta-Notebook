import { SourceAdapter, IngestInput, ExtractionResult } from './index'

export class PdfAdapter implements SourceAdapter {
    canHandle(input: IngestInput): boolean {
        return !!input.filename && input.filename.endsWith('.pdf') || input.mimetype === 'application/pdf';
    }

    async extract(input: IngestInput): Promise<ExtractionResult> {
        if (!input.buffer) throw new Error('No buffer provided for PDF extraction');

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');

        // Using pdf-parse natively to extract text streams
        const data = await pdfParse(input.buffer);
        
        const text = String(data.text || '').replace(/\s+/g, ' ').trim();
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
