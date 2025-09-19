/**
 * Daily.tsx
 * Daily Reflection page that generates contemplative content deterministically by date and theme.
 * Now includes a top hero banner using the provided Daily Wisdom image (shown only if images are enabled).
 */

import { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { Separator } from '../components/ui/separator'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Link, useLocation, useNavigate } from 'react-router'
import { CalendarDays, Copy, RefreshCw } from 'lucide-react'
import { getReflectionForDate, themes, humanizeTheme, type ReflectionTheme } from '../lib/contentEngine'
import DailyHero from '../components/DailyHero'
import { useUIPrefs } from '../contexts/UIPrefsContext'

/**
 * parseQuery
 * Parses the hash-based search string to extract theme parameter.
 */
function parseQuery(search: string) {
  const params = new URLSearchParams(search.replace(/^\?/, ''))
  return {
    t: (params.get('t') as ReflectionTheme | null) ?? null,
  }
}

/**
 * ThemePill
 * Small button-like pill to switch themes.
 */
function ThemePill({ theme, active, onClick }: { theme: ReflectionTheme; active: boolean; onClick: () => void }) {
  return (
    <button
      className={[
        'px-3 py-1 rounded-full text-xs transition-colors border',
        active ? 'bg-primary text-primary-foreground border-transparent' : 'bg-background hover:bg-accent text-foreground/80',
      ].join(' ')}
      onClick={onClick}
      aria-pressed={active}
    >
      {humanizeTheme(theme)}
    </button>
  )
}

/**
 * DailyPage
 * Shows today's generated reflection and allows theme switching and copy.
 */
export default function DailyPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { prefs } = useUIPrefs()
  const { t } = useMemo(() => parseQuery(location.search), [location.search])

  const theme: ReflectionTheme = (t && themes.includes(t) ? t : 'mindfulness')
  const today = useMemo(() => new Date(), [])
  const reflection = useMemo(() => getReflectionForDate(today, theme), [today, theme])

  const [copied, setCopied] = useState(false)

  /** Copies the reflection content to the clipboard for sharing. */
  async function copyToClipboard() {
    const text = [
      `${reflection.title} — ${reflection.dateISO}`,
      `Theme: ${humanizeTheme(reflection.theme)}`,
      `Scripture: "${reflection.scripture.text}" (${reflection.scripture.ref})`,
      `Quote: "${reflection.quote.text}" — ${reflection.quote.author}`,
      '',
      ...reflection.body,
      '',
      `Questions:`,
      ...reflection.questions.map(q => `• ${q}`),
      '',
      `Prayer: ${reflection.prayer}`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  /** Cycles to the next theme in the list by updating the query param. */
  function nextTheme() {
    const idx = themes.indexOf(theme)
    const next = themes[(idx + 1) % themes.length]
    const params = new URLSearchParams(location.search.replace(/^\?/, ''))
    params.set('t', next)
    navigate({ pathname: '/daily', search: `?${params.toString()}` })
  }

  return (
    <Layout>
      {/* Daily Wisdom hero (respects UI images preference) */}
      {prefs.images === 'on' && (
        <DailyHero
          src="https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/b6f6f76d-3ece-4003-b2c2-7db2f74bfe02.png"
          alt="Daily Wisdom"
          title="Daily Wisdom"
          caption="Begin in stillness; let the light of Christ guide your attention today."
        />
      )}

      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-5 text-primary" />
          <h1 className="text-2xl md:text-3xl font-semibold">Daily Reflection</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          A contemplative, Christ-centered practice generated fresh each day. Choose a theme and begin.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {themes.map(th => (
            <ThemePill key={th} theme={th} active={th === theme} onClick={() => navigate(`/daily?t=${th}`)} />
          ))}
        </div>

        <Separator className="my-6" />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{reflection.title}</CardTitle>
            <div className="mt-1 text-xs text-muted-foreground">
              {reflection.dateISO} • {humanizeTheme(reflection.theme)}
            </div>
          </CardHeader>
          <CardContent className="space-y-5 text-sm leading-7">
            <div>
              <p className="font-medium">Scripture</p>
              <p className="text-muted-foreground">“{reflection.scripture.text}” — {reflection.scripture.ref}</p>
            </div>

            <div>
              <p className="font-medium">Companion Quote</p>
              <p className="text-muted-foreground">“{reflection.quote.text}” — {reflection.quote.author}</p>
            </div>

            {reflection.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}

            <div>
              <p className="font-medium">Questions for Reflection</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {reflection.questions.map((q, i) => (
                  <li key={i} className="text-muted-foreground">{q}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-medium">Prayer</p>
              <p className="text-muted-foreground">{reflection.prayer}</p>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              {reflection.tags.map(tag => (
                <span key={tag} className="text-xs rounded-full border px-2 py-0.5 text-foreground/80">{tag}</span>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap gap-2">
              <Button onClick={copyToClipboard} className="gap-2">
                <Copy className="size-4" />
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="outline" className="bg-transparent gap-2" onClick={nextTheme}>
                <RefreshCw className="size-4" />
                Next theme
              </Button>
              <Link to="/mindfulness">
                <Button variant="outline" className="bg-transparent">Mindfulness &amp; Prayer Guide</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </Layout>
  )
}
