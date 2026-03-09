import { createClient } from '@/lib/supabase/server'
import { IngestInput, SourceAdapter } from './adapters'
import { PdfAdapter } from './adapters/pdf'
import { DocxAdapter } from './adapters/docx'
import { TxtAdapter } from './adapters/txt'
import { UrlAdapter } from './adapters/url'
import { YoutubeAdapter } from './adapters/youtube'
import { AudioAdapter } from './adapters/audio'
import { chunkText } from './chunker'
import { generateEmbedding } from './embeddings'

const adapters: SourceAdapter[] = [
    new PdfAdapter(),
    new DocxAdapter(),
    new TxtAdapter(),
    new UrlAdapter(),
    new YoutubeAdapter(),
    new AudioAdapter()
];

export async function processIngestJob(sourceId: string, input: IngestInput) {
    const supabase = await createClient();

    try {
        const adapter = adapters.find(a => a.canHandle(input));
        if (!adapter) {
            throw new Error('No compatible ingestion adapter found for this source.');
        }

        const extraction = await adapter.extract(input);

        // FR-04 Limits
        if (extraction.wordCount > 500000) {
            throw new Error(`Source word count exceeds 500k limit. Detected: ${extraction.wordCount}`);
        }

        const chunks = chunkText(extraction.text);
        const insertOperations = [];

        for (const chunk of chunks) {
            const embedding = await generateEmbedding(chunk.content);
            insertOperations.push({
                source_id: sourceId,
                notebook_id: input.notebookId,
                content: chunk.content,
                chunk_index: chunk.chunkIndex,
                embedding: embedding
            });
        }

        // Insert chunks in batches of 50 for stability (preventing Edge timeout / PG payload issues)
        const BATCH_SIZE = 50;
        for (let i = 0; i < insertOperations.length; i += BATCH_SIZE) {
            const batch = insertOperations.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('source_chunks').insert(batch);
            if (error) throw new Error(`Failed to insert source chunks: ${error.message}`);
        }

        const { error: finalizeError } = await supabase
            .from('sources')
            .update({
                status: 'ready',
                word_count: extraction.wordCount,
                metadata: extraction.metadata
            })
            .eq('id', sourceId);

        if (finalizeError) throw finalizeError;

    } catch (err: unknown) {
        const errorMsg = (err instanceof Error) ? err.message : String(err);
        await supabase.from('sources').update({ status: 'error', error: errorMsg }).eq('id', sourceId);
        console.error('Ingest Pipeline Error:', errorMsg);
    }
}
