import { SourceAdapter, IngestInput, ExtractionResult } from './index'
import { YoutubeTranscript } from 'youtube-transcript'
export class YoutubeAdapter implements SourceAdapter {
    canHandle(input: IngestInput): boolean {
        if (!input.url) return false
        try { const url = new URL(input.url); return url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be') } catch { return false }
    }
    async extract(input: IngestInput): Promise<ExtractionResult> {
        if (!input.url) throw new Error('No URL provided for YouTube extraction')
        const urlObj = new URL(input.url)
        let videoId = urlObj.hostname.includes('youtu.be') ? urlObj.pathname.slice(1) : urlObj.searchParams.get('v') || ''
        if (!videoId) throw new Error('Invalid YouTube URL: Video ID missing')
        const transcriptLines = await YoutubeTranscript.fetchTranscript(videoId)
        const text = transcriptLines.map(t => t.text).join(' ')
        return { text, wordCount: text.split(/\s+/).filter(w => w.length > 0).length, metadata: { format: 'youtube', videoId } }
    }
}
