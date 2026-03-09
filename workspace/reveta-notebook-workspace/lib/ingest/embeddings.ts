export async function generateEmbedding(text: string): Promise<number[]> {
    // Generate embeddings using OpenAI text-embedding-3-small as the baseline for 1536d pgvector.
    // Can be swapped to Voyage or Supabase gte-small via configuration.
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for embeddings');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: text
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Embedding generation failed: ${err}`);
    }

    const result = await response.json();
    return result.data[0].embedding;
}
