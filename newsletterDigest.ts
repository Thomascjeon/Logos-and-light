/**
 * newsletterDigest.ts
 * Shared digest builders and email export helpers for Daily/Weekly newsletters.
 * Reused by the in-app builder and any scheduled sending scripts.
 */

import { listArticlesForDate } from './articleEngine'
import { getReflectionForDate, humanizeTheme } from './contentEngine'

/**
 * formatISO
 * Formats a Date as YYYY-MM-DD.
 */
function formatISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * formatHumanDate
 * Formats a Date to a human-friendly label (e.g., Aug 10, 2025).
 */
function formatHumanDate(d: Date): string {
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * previousDays
 * Builds an array of dates going backward from a base date (inclusive).
 */
function previousDays(base: Date, count: number): Date[] {
  const out: Date[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() - i)
    out.push(d)
  }
  return out
}

/**
 * buildDailyDigest
 * Generates a daily digest with a reflection and a handful of articles.
 */
export function buildDailyDigest(date: Date) {
  const reflection = getReflectionForDate(date, 'mindfulness')
  const articles = listArticlesForDate(date, 1).slice(0, 3) // pick first 3 for brevity
  const subject = `Daily • ${formatHumanDate(date)}`
  return { subject, reflection, articles }
}

/**
 * buildWeeklyDigest
 * Generates a weekly digest by sampling recent days' articles and one reflection.
 */
export function buildWeeklyDigest(endDate: Date) {
  const days = previousDays(endDate, 7)
  // One reflection from the end date to anchor the week
  const reflection = getReflectionForDate(endDate, 'faith-reason')
  // Collect one highlight article from each day (first of the generated list)
  const articles = days
    .map(d => listArticlesForDate(d, 1)[0])
    .filter(Boolean)
    .slice(0, 7)
  const weekRange = `${formatHumanDate(days[days.length - 1])} – ${formatHumanDate(days[0])}`
  const subject = `Weekly Digest • ${weekRange}`
  return { subject, reflection, articles }
}

/**
 * getOrigin
 * Resolve a base origin for building absolute links. Supports browser and Node.
 */
function getOrigin(baseUrl?: string): string {
  if (baseUrl && baseUrl.trim()) return baseUrl.replace(/\/+$/, '')
  if (typeof window !== 'undefined' && window?.location?.origin) return window.location.origin
  return ''
}

/**
 * buildEmailText
 * Assembles a plain-text email from digest parts.
 * Accepts optional baseUrl to generate absolute links when running in Node.
 */
export function buildEmailText(
  subject: string,
  reflection: ReturnType<typeof getReflectionForDate>,
  articles: Array<{ title: string; path: string }>,
  baseUrl?: string
): string {
  const origin = getOrigin(baseUrl)
  const lines: string[] = []
  lines.push(subject)
  lines.push('')
  lines.push(`Reflection: ${reflection.title}`)
  lines.push(`Date: ${reflection.dateISO} • Theme: ${humanizeTheme(reflection.theme)}`)
  lines.push(`Scripture: "${reflection.scripture.text}" (${reflection.scripture.ref})`)
  lines.push(`Quote: "${reflection.quote.text}" — ${reflection.quote.author}`)
  lines.push('')
  reflection.body.forEach(p => lines.push(p))
  lines.push('')
  lines.push('Articles:')
  articles.forEach(a => {
    const href = origin ? `${origin}/#${a.path}` : `/#${a.path}`
    lines.push(`• ${a.title} — ${href}`)
  })
  lines.push('')
  lines.push(`Prayer: ${reflection.prayer}`)
  return lines.join('\n')
}

/**
 * buildEmailHtml
 * Assembles a simple, email-friendly HTML version with inline styles.
 * Accepts optional baseUrl to generate absolute links when running in Node.
 */
export function buildEmailHtml(
  subject: string,
  reflection: ReturnType<typeof getReflectionForDate>,
  articles: Array<{ title: string; path: string }>,
  baseUrl?: string
): string {
  const origin = getOrigin(baseUrl)
  const articleLinks = articles
    .map(a => {
      const href = origin ? `${origin}/#${a.path}` : `/#${a.path}`
      return `<li style="margin:6px 0;"><a href="${href}" style="color:#2563eb;text-decoration:none;">${a.title}</a></li>`
    })
    .join('')

  const bodyParas = reflection.body
    .map(p => `<p style="margin:0 0 12px 0;line-height:1.6;color:#334155;">${p}</p>`)
    .join('')

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial;">
            <tr><td>
              <h1 style="margin:0 0 4px 0;font-size:20px;color:#0f172a;">${subject}</h1>
              <div style="margin:0 0 16px 0;font-size:12px;color:#64748b;">${reflection.dateISO} • ${humanizeTheme(reflection.theme)}</div>

              <h2 style="margin:0 0 8px 0;font-size:16px;color:#0f172a;">Reflection</h2>
              <p style="margin:0 0 6px 0;font-weight:600;color:#0f172a;">${reflection.title}</p>
              <p style="margin:0 0 6px 0;color:#334155;">“${reflection.scripture.text}” — ${reflection.scripture.ref}</p>
              <p style="margin:0 0 12px 0;color:#334155;">“${reflection.quote.text}” — ${reflection.quote.author}</p>
              ${bodyParas}
              <p style="margin:12px 0 0 0;color:#334155;"><strong>Prayer:</strong> ${reflection.prayer}</p>

              <h2 style="margin:20px 0 8px 0;font-size:16px;color:#0f172a;">Articles</h2>
              <ul style="padding-left:18px;margin:0;list-style:disc;color:#0f172a;">
                ${articleLinks}
              </ul>

              <p style="margin:24px 0 0 0;font-size:12px;color:#94a3b8;">Sent by Logos &amp; Light</p>
            </td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}
