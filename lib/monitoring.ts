/**
 * TECH-MONITORING — AI Observability via Langfuse
 * Instruments every AI call with trace/span metadata for:
 *   - Latency per call (RAG vs background pipeline)
 *   - Token usage tracking
 *   - Prompt version attribution
 *   - Error rate by feature
 *
 * Design: zero-dependency on Langfuse SDK being present —
 * all calls are no-ops when LANGFUSE_PUBLIC_KEY is absent.
 * This lets the module be imported unconditionally without
 * breaking local dev or environments without monitoring configured.
 *
 * To enable: set LANGFUSE_PUBLIC_KEY + LANGFUSE_SECRET_KEY env vars.
 * See docs/deployment-runbook.md §8 for setup instructions.
 */

export interface AITrace {
  traceId: string
  feature: string       // e.g. 'rag', 'audio:deep_dive', 'artifact:mind_map'
  userId?: string       // undefined for background pipeline calls
  model: string
  startedAt: number
}

export interface AITraceResult {
  inputTokens?: number
  outputTokens?: number
  latencyMs: number
  error?: string
  cached?: boolean
}

// Lazy Langfuse client — initialised only when env vars are present
let _langfuse: unknown = null

async function getLangfuse() {
  if (!process.env.LANGFUSE_PUBLIC_KEY || !process.env.LANGFUSE_SECRET_KEY) {
    return null
  }
  if (_langfuse) return _langfuse
  try {
    const { Langfuse } = await import('langfuse')
    _langfuse = new Langfuse({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      flushAt: 10,
      flushInterval: 5000,
    })
    return _langfuse
  } catch {
    // langfuse package not installed — monitoring silently disabled
    return null
  }
}

export function startAITrace(feature: string, model: string, userId?: string): AITrace {
  return {
    traceId: crypto.randomUUID(),
    feature,
    userId,
    model,
    startedAt: Date.now(),
  }
}

export async function endAITrace(trace: AITrace, result: Omit<AITraceResult, 'latencyMs'> & { latencyMs?: number }) {
  const latencyMs = result.latencyMs ?? (Date.now() - trace.startedAt)

  // Console telemetry — always present, useful even without Langfuse
  if (process.env.NODE_ENV !== 'production') {
    const status = result.error ? '❌' : result.cached ? '⚡ cached' : '✅'
    console.log(`[AI] ${status} ${trace.feature} ${latencyMs}ms${result.inputTokens ? ` in:${result.inputTokens} out:${result.outputTokens}` : ''}`)
  }

  const lf = await getLangfuse()
  if (!lf) return

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = lf as any
    const t = client.trace({
      id: trace.traceId,
      name: trace.feature,
      userId: trace.userId,
      metadata: { model: trace.model, cached: result.cached },
    })
    t.generation({
      name: `${trace.feature}:completion`,
      model: trace.model,
      startTime: new Date(trace.startedAt),
      endTime: new Date(trace.startedAt + latencyMs),
      usage: result.inputTokens ? {
        input: result.inputTokens,
        output: result.outputTokens,
      } : undefined,
      statusMessage: result.error,
      level: result.error ? 'ERROR' : 'DEFAULT',
    })
  } catch {
    // Non-critical — never throw from monitoring
  }
}

/**
 * Sentry integration helpers — imported by instrumentation.ts
 * when SENTRY_DSN is set. Provides error boundary + API route wrapping.
 */
export function initSentry() {
  if (!process.env.SENTRY_DSN) return
  // @sentry/nextjs is lazily imported — no build error if not installed
  import('@sentry/nextjs').then(({ init, captureException: _ }) => {
    init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      // Only capture errors, not performance traces by default
      integrations: [],
    })
  }).catch(() => {
    // @sentry/nextjs not installed — monitoring silently disabled
  })
}

export async function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) return
  try {
    const { captureException, withScope } = await import('@sentry/nextjs')
    withScope(scope => {
      if (context) scope.setExtras(context)
      captureException(error)
    })
  } catch {
    // Non-critical
  }
}
