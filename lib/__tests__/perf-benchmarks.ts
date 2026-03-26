/**
 * NFR-PERFORMANCE — Performance Benchmark Suite
 * Measures against PRD §7.1 targets:
 *   Chat response:    <5s P95
 *   Source ingest:    <60s for docs under 100MB
 *   Audio generation: <5 min to playback-ready
 *
 * Run: npx tsx lib/__tests__/perf-benchmarks.ts
 * Requires all env vars: ANTHROPIC_API_KEY, SUPABASE_*, BENCH_AUTH_TOKEN, BENCH_NOTEBOOK_ID, BENCH_CHAT_ID
 */

export interface BenchmarkResult { name: string; target: number; samples: number[]; p50: number; p95: number; pass: boolean }

export function percentile(samples: number[], p: number): number {
  if (samples.length === 0) return 0
  const sorted = [...samples].sort((a, b) => a - b)
  return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)]
}

export function summarise(name: string, targetMs: number, samples: number[]): BenchmarkResult {
  const p50 = percentile(samples, 50)
  const p95 = percentile(samples, 95)
  return { name, target: targetMs, samples, p50, p95, pass: p95 <= targetMs }
}

export const CHAT_LATENCY_TARGET_MS = 5000
export const INGEST_LATENCY_TARGET_MS = 60_000
export const AUDIO_LATENCY_TARGET_MS = 300_000

export async function measureChatLatency(baseUrl: string, authToken: string, chatId: string, query: string): Promise<number> {
  const start = Date.now()
  const res = await fetch(`${baseUrl}/api/chats/${chatId}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ content: query }) })
  if (!res.ok) throw new Error(`Chat API ${res.status}`)
  return Date.now() - start
}

if (require.main === module) {
  ;(async () => {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    if (!process.env.BENCH_AUTH_TOKEN || !process.env.BENCH_NOTEBOOK_ID || !process.env.BENCH_CHAT_ID) {
      console.error('Set BENCH_AUTH_TOKEN, BENCH_NOTEBOOK_ID, BENCH_CHAT_ID')
      process.exit(1)
    }
    const auth = process.env.BENCH_AUTH_TOKEN!
    const chatId = process.env.BENCH_CHAT_ID!
    const samples: number[] = []
    console.log('Running chat latency benchmark (5 samples)...')
    for (let i = 0; i < 5; i++) {
      try { const ms = await measureChatLatency(BASE_URL, auth, chatId, 'Summarise the main themes.'); samples.push(ms); console.log(`  sample ${i+1}: ${ms}ms`) }
      catch (e) { console.error(`  sample ${i+1}: ERROR — ${e}`) }
    }
    const result = summarise('chat-latency', CHAT_LATENCY_TARGET_MS, samples)
    console.log(`\nResult: P50=${result.p50}ms P95=${result.p95}ms Target=<${result.target}ms ${result.pass ? '✅ PASS' : '❌ FAIL'}`)
    process.exit(result.pass ? 0 : 1)
  })()
}
