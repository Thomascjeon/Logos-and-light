/**
 * Newsletter.tsx
 * Newsletter Builder: creates Daily or Weekly digests from generated content with copy/export actions.
 */

import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { Separator } from '../components/ui/separator'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { CalendarDays, Copy, Mail, RefreshCw } from 'lucide-react'
import { humanizeTheme } from '../lib/contentEngine'
import { buildDailyDigest, buildWeeklyDigest, buildEmailHtml, buildEmailText } from '../lib/newsletterDigest'

/**
 * formatISO
 * Formats a Date as YYYY-MM-DD for the UI label.
 */
function formatISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * DigestMode
 * Supported digest modes for newsletter generation.
 */
type DigestMode = 'daily' | 'weekly'

/**
 * NewsletterPage
 * Main UI for building and exporting newsletters.
 */
export default function NewsletterPage() {
  const [mode, setMode] = useState<DigestMode>('daily')
  const [baseDate, setBaseDate] = useState<Date>(() => new Date())

  // Recompute digest based on mode and base date
  const digest = useMemo(() => {
    return mode === 'daily' ? buildDailyDigest(baseDate) : buildWeeklyDigest(baseDate)
  }, [mode, baseDate])

  const { subject, reflection, articles } = digest

  /**
   * copyToClipboard
   * Copies provided text to clipboard with simple visual feedback handled by button label.
   */
  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
  }

  /**
   * openMailDraft
   * Opens the user's mail client with a pre-filled subject and body (plain text).
   */
  function openMailDraft() {
    const body = buildEmailText(subject, reflection as any, articles.map(a => ({ title: a.title, path: a.path })))
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = url
  }

  /** Go to previous/next period depending on selected mode. */
  function shiftPeriod(delta: number) {
    const d = new Date(baseDate)
    d.setDate(baseDate.getDate() + (mode === 'daily' ? delta : delta * 7))
    setBaseDate(d)
  }

  // Prepare derived text/html for export
  const textExport = useMemo(
    () => buildEmailText(subject, reflection as any, articles.map(a => ({ title: a.title, path: a.path }))),
    [subject, reflection, articles]
  )
  const htmlExport = useMemo(
    () => buildEmailHtml(subject, reflection as any, articles.map(a => ({ title: a.title, path: a.path }))),
    [subject, reflection, articles]
  )

  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-5 text-primary" />
          <h1 className="text-2xl md:text-3xl font-semibold">Newsletter Builder</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Compose a Daily or Weekly digest from your self-generating content. Copy HTML/text or open a pre-filled email draft.
        </p>

        <Separator className="my-6" />

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={mode === 'daily' ? 'default' : 'outline'}
            className={mode === 'daily' ? '' : 'bg-transparent'}
            onClick={() => setMode('daily')}
          >
            Daily
          </Button>
          <Button
            variant={mode === 'weekly' ? 'default' : 'outline'}
            className={mode === 'weekly' ? '' : 'bg-transparent'}
            onClick={() => setMode('weekly')}
          >
            Weekly
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" className="bg-transparent" onClick={() => shiftPeriod(-1)}>
              Prev {mode === 'daily' ? 'day' : 'week'}
            </Button>
            <div className="text-sm text-muted-foreground">
              Base date: <span className="font-medium text-foreground">{formatISO(baseDate)}</span>
            </div>
            <Button variant="outline" className="bg-transparent" onClick={() => shiftPeriod(1)}>
              Next {mode === 'daily' ? 'day' : 'week'}
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{subject}</CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              Reflection: {reflection.title} • {reflection.dateISO} • {humanizeTheme(reflection.theme)}
            </div>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-7">
            <div>
              <p className="font-medium">Scripture</p>
              <p className="text-muted-foreground">“{reflection.scripture.text}” — {reflection.scripture.ref}</p>
            </div>

            <div>
              <p className="font-medium">Quote</p>
              <p className="text-muted-foreground">“{reflection.quote.text}” — {reflection.quote.author}</p>
            </div>

            {reflection.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <div>
              <p className="font-medium">Articles in this {mode}</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {articles.map(a => (
                  <li key={a.path}>
                    <a
                      className="text-foreground/80 hover:text-foreground underline-offset-4 hover:underline"
                      href={`/#${a.path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {a.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <Button className="gap-2" onClick={() => copyToClipboard(textExport)}>
                <Copy className="size-4" /> Copy Text
              </Button>
              <Button className="gap-2" onClick={() => copyToClipboard(htmlExport)}>
                <Copy className="size-4" /> Copy HTML
              </Button>
              <Button variant="outline" className="bg-transparent gap-2" onClick={openMailDraft}>
                <Mail className="size-4" /> Open email draft
              </Button>
              <Button variant="outline" className="bg-transparent gap-2" onClick={() => setBaseDate(new Date())}>
                <RefreshCw className="size-4" /> Today
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  )
}
