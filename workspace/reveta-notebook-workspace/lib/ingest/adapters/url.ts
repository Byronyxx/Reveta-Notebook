import { SourceAdapter, IngestInput, ExtractionResult } from './index'
import * as cheerio from 'cheerio'

export class UrlAdapter implements SourceAdapter {
    canHandle(input: IngestInput): boolean {
        if (!input.url) return false;
        try {
            const url = new URL(input.url);
            return ['http:', 'https:'].includes(url.protocol) && !url.hostname.includes('youtube.com') && !url.hostname.includes('youtu.be');
        } catch {
            return false;
        }
    }

    async extract(input: IngestInput): Promise<ExtractionResult> {
        if (!input.url) throw new Error('No URL provided');

        const urlObj = new URL(input.url);
        if (['localhost', '127.0.0.1', '169.254.169.254'].includes(urlObj.hostname) || urlObj.hostname.endsWith('.internal')) {
            throw new Error('SSRF Protection: Internal URLs are not permitted.');
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(input.url, {
                signal: controller.signal,
                headers: { 'User-Agent': 'RevetaNotebook/1.0 (Integration)' }
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`HTTP fetch failed with status ${response.status}`);
            }

            const html = await response.text();
            const $ = cheerio.load(html);

            // Remove structural bloat
            $('script, style, noscript, nav, header, footer, iframe, svg, img').remove();

            // Basic extraction of readable text
            const text = $('body').text().replace(/\s+/g, ' ').trim();
            const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
            const title = $('title').text() || 'Extracted URL';

            return {
                text,
                wordCount,
                metadata: { title, url: input.url, format: 'url' }
            };

        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('URL fetch timed out after 15 seconds.');
            }
            throw error;
        }
    }
}
