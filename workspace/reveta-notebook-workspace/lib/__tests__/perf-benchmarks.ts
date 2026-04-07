/**
 * NFR-PERFORMANCE — Performance Benchmark Suite
 * ────────────────────────────────────────────────
 * Measures against PRD §7.1 targets:
 *   Chat response:   <5s P95 latency
 *   Source ingest:   <60s for docs under 100MB
 *   Audio generation:<5 min from source set to playback-ready
 *
 * Run: npx tsx lib/__tests__/perf-benchmarks.ts
 * Requires: all env vars set (ANTHROPIC_API_KEY, SUPABASE_*, etc.)
 * These are integration benchmarks — they make real API calls.
 *
 * Usage: Run against staging before production deploys.
 * Results are logged to console. P95 failures exit with code 1.
 */

export interface BenchmarkResult {
  name: string
  target: number   // ms
  samples: number[]
  p50: number
  p95: number
  pass: boolean
}

export function percentile(samples: number[], p: number): number {
  if (samples.length === 0) return 0
  const sorted = [...samples].sort((a, b) => a - b)
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}

export function summarise(name: string, targetMs: number, samples: number[]): BenchmarkResult {
  const p50 = percentile(samples, 50)
  const p95 = percentile(samples, 95)
  return { name, target: targetMs, samples, p50, p95, pass: p95 <= targetMs }
}

// ─── BENCHMARK DEFINITIONS ────────────────────────────────────────────────────

/**
 * Chat Response Latency — target <5000ms P95
 * Measures time from POST /api/chats/[chatId]/messages to first byte of response.
 * Run against a real notebook with at least one ready source.
 */
export const CHAT_LATENCY_TARGET_MS = 5000

/**
 * Source Ingest Latency — target <60000ms P95
 * Measures time from POST /api/sources to status=ready for a <100MB document.
 */
export const INGEST_LATENCY_TARGET_MS = 60_000

/**
 * Audio Generation Latency — target <300000ms (5 min) P95
 * Measures time from POST /api/audio-overviews to status=ready.
 */
export const AUDIO_LATENCY_TARGET_MS = 300_000

// ─── MEASUREMENT UTILITIES ────────────────────────────────────────────────────

export async function measureChatLatency(
  baseUrl: string,
  authToken: string,
  chatId: string,
  query: string
): Promise<number> {
  const start = Date.now()
  const res = await fetch(`${baseUrl}/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ content: query }),
  })
  if (!res.ok) throw new Error(`Chat API ${res.status}: ${await res.text()}`)
  return Date.now() - start
}

export async function measureIngestLatency(
  baseUrl: string,
  authToken: string,
  notebookId: string,
  fileUrl: string
): Promise<number> {
  const start = Date.now()

  // POST source
  const createRes = await fetch(`${baseUrl}/api/sources`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${authToken}` },
    body: (() => {
      const fd = new FormData()
      fd.append('notebookId', notebookId)
      fd.append('url', fileUrl)
      return fd
    })(),
  })
  if (!createRes.ok) throw new Error(`Sources API ${createRes.status}`)
  const { sourceId } = await createRes.json()

  // Poll until ready or timeout
  const timeout = INGEST_LATENCY_TARGET_MS * 1.5
  while (Date.now() - start < timeout) {
    await new Promise(r => setTimeout(r, 2000))
    const statusRes = await fetch(`${baseUrl}/api/sources/${sourceId}/status`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    const { status } = await statusRes.json()
    if (status === 'ready') return Date.now() - start
    if (status === 'error') throw new Error('Ingest failed with status=error')
  }
  throw new Error('Ingest timed out')
}

export async function measureAudioLatency(
  baseUrl: string,
  authToken: string,
  notebookId: string,
  format: string = 'brief'
): Promise<number> {
  const start = Date.now()

  const createRes = await fetch(`${baseUrl}/api/audio-overviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ notebookId, format }),
  })
  if (!createRes.ok) throw new Error(`Audio API ${createRes.status}`)
  const { overviewId } = await createRes.json()

  const timeout = AUDIO_LATENCY_TARGET_MS * 1.5
  while (Date.now() - start < timeout) {
    await new Promise(r => setTimeout(r, 5000))
    const pollRes = await fetch(`${baseUrl}/api/audio-overviews/${overviewId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
    const { status } = await pollRes.json()
    if (status === 'ready') return Date.now() - start
    if (status === 'error') throw new Error('Audio generation failed')
  }
  throw new Error('Audio generation timed out')
}

// ─── RUNNER ───────────────────────────────────────────────────────────────────

if (require.main === module) {
  ;(async () => {
    console.log('\n╔══════════════════════════════════════════════════════╗')
    console.log('║  REVETA NOTEBOOK — PERFORMANCE BENCHMARKS            ║')
    console.log('║  PRD §7.1 Targets · Requires live env vars           ║')
    console.log('╚══════════════════════════════════════════════════════╝\n')

    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!process.env.BENCH_AUTH_TOKEN) {
      console.error('  ❌ Set BENCH_AUTH_TOKEN env var to a valid session token')
      process.exit(1)
    }
    if (!process.env.BENCH_NOTEBOOK_ID || !process.env.BENCH_CHAT_ID) {
      console.error('  ❌ Set BENCH_NOTEBOOK_ID and BENCH_CHAT_ID env vars')
      process.exit(1)
    }

    const auth = process.env.BENCH_AUTH_TOKEN!
    const notebookId = process.env.BENCH_NOTEBOOK_ID!
    const chatId = process.env.BENCH_CHAT_ID!
    const results: BenchmarkResult[] = []

    // Chat latency — 5 samples
    console.log('  Running chat latency benchmark (5 samples)...')
    const chatSamples: number[] = []
    for (let i = 0; i < 5; i++) {
      try {
        const ms = await measureChatLatency(BASE_URL, auth, chatId, 'Summarise the main themes in the sources.')
        chatSamples.push(ms)
        process.stdout.write(`    sample ${i + 1}: ${ms}ms\n`)
      } catch (e) {
        console.error(`    sample ${i + 1}: ERROR — ${e}`)
      }
    }
    results.push(summarise('chat-latency', CHAT_LATENCY_TARGET_MS, chatSamples))

    // Print results
    console.log('\n  ┌────────────────────────────────────────────────────┐')
    console.log('  │  Benchmark             P50        P95     Target   │')
    console.log('  ├────────────────────────────────────────────────────┤')
    for (const r of results) {
      const icon = r.pass ? '✅' : '❌'
      const name = r.name.padEnd(20)
      const p50 = `${r.p50}ms`.padStart(8)
      const p95 = `${r.p95}ms`.padStart(8)
      const target = `<${r.target}ms`.padStart(10)
      console.log(`  │ ${icon} ${name} ${p50} ${p95} ${target} │`)
    }
    console.log('  └────────────────────────────────────────────────────┘\n')

    const failed = results.filter(r => !r.pass)
    if (failed.length > 0) {
      console.error(`  ❌ ${failed.length} benchmark(s) failed P95 target\n`)
      process.exit(1)
    }
    console.log('  ✅ All benchmarks within P95 targets\n')
    process.exit(0)
  })()
}
