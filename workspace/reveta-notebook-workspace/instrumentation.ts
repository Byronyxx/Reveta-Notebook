/**
 * Next.js Instrumentation Hook — runs once on server startup
 * Initialises Sentry error tracking when SENTRY_DSN is configured.
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * This file must be at the project root (next to package.json).
 * It is automatically picked up by Next.js — no config required.
 */

export async function register() {
  // Sentry init — no-op when SENTRY_DSN absent
  if (process.env.SENTRY_DSN) {
    const { initSentry } = await import('./lib/monitoring')
    initSentry()
  }
}
