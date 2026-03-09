import Anthropic from '@anthropic-ai/sdk'
import { getCachedResponse, setCachedResponse } from './cache'
import { aiRateLimit } from './rate-limit'

export const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * FR-14 COMPLIANCE — NO MODEL TRAINING
 *
 * User data processed through this function is governed by:
 * - Supabase RLS: all notebook/source data is user-scoped (see TECH-DB)
 * - Anthropic API: inference-only, no training on API-submitted content
 * - Zero data export endpoints without authentication (see api-security-audit.md)
 *
 * Any modification that introduces a pathway from user data to a
 * training pipeline is a P0 security violation requiring immediate revert.
 * Re-audit docs/api-security-audit.md after any route changes.
 */
export async function generateClaudeResponse(
    userId: string,
    messages: Anthropic.MessageParam[],
    systemPrompt?: string,
    model: string = 'claude-3-7-sonnet-20250219',
    temperature: number = 0.7
): Promise<string> {
    const { success } = await aiRateLimit.limit(userId);
    if (!success) {
        throw new Error('Rate limit exceeded. Please try again later.');
    }

    const payloadString = JSON.stringify({ model, messages, systemPrompt, temperature });
    const cacheKey = `ai_resp_${userId}_${Buffer.from(payloadString).toString('base64').substring(0, 64)}`;

    const cached = await getCachedResponse(cacheKey);
    if (cached) {
        return cached;
    }

    const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages,
        temperature
    });

    const contentBlock = response.content[0];
    const content = contentBlock.type === 'text' ? contentBlock.text : '';

    if (content) {
        await setCachedResponse(cacheKey, content, 3600);
    }

    return content;
}
