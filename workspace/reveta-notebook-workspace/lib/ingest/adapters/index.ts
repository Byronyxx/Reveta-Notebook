export interface IngestInput {
    notebookId: string;
    sourceId: string;
    url?: string;
    buffer?: Buffer;
    mimetype?: string;
    filename?: string;
}

export interface ExtractionResult {
    text: string;
    wordCount: number;
    metadata?: Record<string, unknown>;
}

export interface SourceAdapter {
    canHandle(input: IngestInput): boolean;
    extract(input: IngestInput): Promise<ExtractionResult>;
}
