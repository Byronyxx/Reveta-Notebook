export interface Chunk { content: string; chunkIndex: number }

export function chunkText(text: string, maxTokens: number = 800, overlap: number = 100): Chunk[] {
    const words = text.split(/\s+/);
    const chunks: Chunk[] = [];
    if (words.length === 0) return chunks;
    let currentChunk: string[] = [];
    let chunkIndex = 0;
    for (let i = 0; i < words.length; i++) {
        currentChunk.push(words[i]);
        if (currentChunk.length >= maxTokens) {
            chunks.push({ content: currentChunk.join(' '), chunkIndex });
            chunkIndex++;
            i -= overlap;
            currentChunk = [];
        }
    }
    if (currentChunk.length > 0) chunks.push({ content: currentChunk.join(' '), chunkIndex });
    return chunks;
}
