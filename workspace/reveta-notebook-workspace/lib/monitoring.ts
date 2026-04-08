import { env } from '@/lib/env';

export interface AITrace {
  traceId: string
  feature: string       
  userId?: string       
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

let _langfuse: unknown = null

async function getLangfuse() {
  if (!env.LANGFUSE_PUBLIC_KEY || !env.LANGFUSE_SECRET_KEY) {
    return null
  }
  if (_langfuse) return _langfuse
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const importLangfuse = new Function('return import("langfuse")') as () => Promise<any>;
     
    const { Langfuse } = await importLangfuse()
     
    _langfuse = new Langfuse({
      publicKey: env.LANGFUSE_PUBLIC_KEY,
      secretKey: env.LANGFUSE_SECRET_KEY,
      flushAt: 10,
      flushInterval: 5000,
    })
    return _langfuse
  } catch {
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

  if (env.NODE_ENV !== 'production') {
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
  }
}

export function initSentry() {
  if (!env.SENTRY_DSN) return
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const importSentry = new Function('return import("@sentry/nextjs")') as () => Promise<any>;
    importSentry().then(({ init }) => {
      init({
        dsn: env.SENTRY_DSN,
        environment: env.NODE_ENV,
        tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [],
      })
    }).catch(() => {
    })
  } catch {
  }
}

export async function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!env.SENTRY_DSN) return
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const importSentry = new Function('return import("@sentry/nextjs")') as () => Promise<any>;
    const { captureException, withScope } = await importSentry();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    withScope((scope: any) => {
      if (context) scope.setExtras(context)
      captureException(error)
    })
  } catch {
  }
}
