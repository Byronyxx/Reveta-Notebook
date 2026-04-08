import { env } from '@/lib/env';
import Anthropic from '@anthropic-ai/sdk'
import { getCachedResponse, setCachedResponse } from './cache'
import { aiRateLimit } from './rate-limit'
import { startAITrace, endAITrace } from '../monitoring'

export const anthropic = new Anthropic({
    apiKey: env.ANTHROPIC_API_KEY,
})

const PINNED_MODEL = 'claude-sonnet-4-20250514'

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

// ── USER-SCOPED INFERENCE (chat, RAG) ─────────────────────────────────────────
// Requires userId for per-user rate limiting. Uses sliding window (30 req/min).
export async function generateClaudeResponse(
    userId: string,
    messages: Anthropic.MessageParam[],
    systemPrompt?: string,
    model: string = PINNED_MODEL,
    temperature: number = 0.7
): Promise<string> {
    const { success } = await aiRateLimit.limit(userId)
    if (!success) {
        throw new Error('Rate limit exceeded. Please try again later.')
    }

    const trace = startAITrace('rag', model, userId)
    const payloadString = JSON.stringify({ model, messages, systemPrompt, temperature })
    const cacheKey = `ai_resp_${userId}_${Buffer.from(payloadString).toString('base64').substring(0, 64)}`

    const cached = await getCachedResponse(cacheKey)
    if (cached) {
        await endAITrace(trace, { cached: true })
        return cached
    }

    const response = await anthropic.messages.create({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages,
        temperature,
    })

    const contentBlock = response.content[0]
    const content = contentBlock.type === 'text' ? contentBlock.text : ''

    await endAITrace(trace, {
        inputTokens: response.usage?.input_tokens,
        outputTokens: response.usage?.output_tokens,
    })

    if (content) {
        await setCachedResponse(cacheKey, content, 3600)
    }

    return content
}

// ── BACKGROUND PIPELINE INFERENCE (audio, artifacts) ─────────────────────────
// DEBT-003 RESOLUTION: Migrates audio-overview.ts + artifact-generator.ts off
// direct `new Anthropic()`. Background jobs lack a userId — they rate-limit
// against a service-level key ('background-pipeline') instead.
// No caching (large generation outputs are not cache candidates).
export interface BackgroundCompletionOptions {
    system: string
    messages: Anthropic.MessageParam[]
    maxTokens?: number
    temperature?: number
}

export async function generateClaudeCompletion(
    opts: BackgroundCompletionOptions
): Promise<string> {
    // Service-level rate limiting — shared bucket for all background jobs
    const { success } = await aiRateLimit.limit('background-pipeline')
    if (!success) {
        throw new Error('Background pipeline rate limit exceeded. Retry after 60 seconds.')
    }

    const trace = startAITrace('background-pipeline', PINNED_MODEL)

    try {
        const response = await anthropic.messages.create({
            model: PINNED_MODEL,
            max_tokens: opts.maxTokens ?? 8192,
            system: opts.system,
            messages: opts.messages,
            temperature: opts.temperature ?? 0.7,
        })

        const block = response.content[0]
        if (block.type !== 'text') throw new Error('Unexpected non-text response from Claude')

        await endAITrace(trace, {
            inputTokens: response.usage?.input_tokens,
            outputTokens: response.usage?.output_tokens,
        })

        return block.text
    } catch (err) {
        await endAITrace(trace, { error: String(err) })
        throw err
    }
}

