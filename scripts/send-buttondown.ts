/**
 * send-buttondown.ts
 * Schedules and sends a self-generated newsletter email via Buttondown.
 * - Bundled and executed in GitHub Actions with esbuild (no extra deps).
 * - Uses the same digest builders as the in-app Newsletter page.
 *
 * Required environment variables:
 * - BUTTONDOWN_API_KEY: Buttondown API token (GitHub Secret).
 * Optional:
 * - MODE: 'daily' | 'weekly' (default: 'daily')
 * - BASE_URL: absolute site origin for article links, e.g., https://yourdomain.com
 * - BASE_DATE: YYYY-MM-DD to override the base date (mostly for testing).
 * - DRY_RUN: '1' to print payload without sending.
 */

import { buildDailyDigest, buildWeeklyDigest, buildEmailHtml, buildEmailText } from '../src/lib/newsletterDigest'

/** Read an env var with default. */
function env(name: string, fallback?: string): string | undefined {
  const v = process.env[name]
  return v === undefined || v === '' ? fallback : v
}

/** Parse date from YYYY-MM-DD or return new Date() if missing/invalid. */
function parseBaseDate(s?: string): Date {
  if (!s) return new Date()
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return new Date()
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12, 0, 0))
  if (isNaN(d.getTime())) return new Date()
  return d
}

/** Main entry: builds digest and calls Buttondown API to send immediately. */
async function main() {
  const apiKey = env('BUTTONDOWN_API_KEY')
  if (!apiKey) {
    console.error('ERROR: BUTTONDOWN_API_KEY is not set.')
    process.exit(1)
  }

  const mode = (env('MODE', 'daily') as 'daily' | 'weekly')
  const baseDate = parseBaseDate(env('BASE_DATE'))
  const baseUrl = env('BASE_URL', '') // empty is OK; links fallback to hash routes

  const digest = mode === 'weekly' ? buildWeeklyDigest(baseDate) : buildDailyDigest(baseDate)
  const { subject, reflection, articles } = digest

  const text = buildEmailText(subject, reflection as any, articles.map(a => ({ title: a.title, path: a.path })), baseUrl)
  const html = buildEmailHtml(subject, reflection as any, articles.map(a => ({ title: a.title, path: a.path })), baseUrl)

  const payload = {
    subject,
    body: html,
    body_text: text,
    // You can add "tags" here to label the campaign in Buttondown if desired.
    // tags: ['automated', mode],
  }

  if (env('DRY_RUN') === '1') {
    console.log('DRY_RUN=1 — would send payload:')
    console.log(JSON.stringify(payload, null, 2))
    return
  }

  const res = await fetch('https://api.buttondown.email/v1/emails', {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error(`Buttondown API error: ${res.status} ${res.statusText}\n${errText}`)
    process.exit(1)
  }

  const out = await res.json().catch(() => ({}))
  // Most accounts will send immediately on POST; if your account drafts first,
  // you can add a follow-up publish call here.
  console.log(`[${new Date().toISOString()}] Sent ${mode} newsletter:`, out?.id || '(no id)')
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
