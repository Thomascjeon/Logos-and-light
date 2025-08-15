/**
 * Resources.tsx
 * Curated resources page with category filters, search, and responsive cards.
 * Includes a robust "Suggest a resource" section with mailto + copy fallback.
 */

import React, { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { BookOpen, GraduationCap, Headphones, Globe, ScrollText, ExternalLink, Mail, Copy } from 'lucide-react'
import ResourceCard from '../components/ResourceCard'
import { getContactMailto, siteConfig } from '../config/site'

/**
 * Resource
 * Descriptor for a single external resource item.
 */
export interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: ResourceCategory
  /** Optional: source or owner, displayed as subtle caption */
  source?: string
  /** Optional: icon to represent the resource */
  icon?: React.ReactNode
}

/**
 * ResourceCategory
 * Categories used to group resources and filter.
 */
export type ResourceCategory = 'Beginner' | 'Reference' | 'Reading' | 'Tools' | 'Media'

/**
 * categories
 * Ordered list for the filter controls.
 */
const categories: ResourceCategory[] = ['Beginner', 'Reference', 'Reading', 'Tools', 'Media']

/**
 * allResources
 * Curated list of useful external links across philosophy and Christian thought.
 * Note: The "Faith & Reason: A Gentle Introduction" now links to an in-site primer for full content.
 */
const allResources: Resource[] = [
  {
    id: 'intro-faith-reason',
    title: 'Faith & Reason: A Gentle Introduction',
    description:
      'A short primer on how classical philosophy and Christian theology converse. Read an on-site overview with Scripture and a simple practice.',
    // Link internally to the generated primer (full content), not to an image file.
    url: '/articles/faith-and-reason-primer',
    category: 'Beginner',
    source: 'Primer',
    icon: <BookOpen className="size-5" />,
  },
  {
    id: 'sep',
    title: 'Stanford Encyclopedia of Philosophy',
    description: 'Authoritative, peer-reviewed reference entries on philosophers and topics.',
    url: 'https://plato.stanford.edu/',
    category: 'Reference',
    source: 'Stanford',
    icon: <GraduationCap className="size-5" />,
  },
  {
    id: 'newadvent-catholic-encyclopedia',
    title: 'Catholic Encyclopedia',
    description: 'Classic reference work covering Catholic doctrine, history, and theology.',
    url: 'https://www.newadvent.org/cathen/',
    category: 'Reference',
    source: 'New Advent',
    icon: <Globe className="size-5" />,
  },
  {
    id: 'bible-gateway',
    title: 'Bible Gateway',
    description: 'Multiple translations with powerful search—ideal for quick references.',
    url: 'https://www.biblegateway.com/',
    category: 'Tools',
    source: 'Bible Gateway',
    icon: <Globe className="size-5" />,
  },
  {
    id: 'step-bible',
    title: 'STEP Bible',
    description: 'Study tool with original language helps, lexicons, and cross references.',
    url: 'https://www.stepbible.org/',
    category: 'Tools',
    source: 'STEP',
    icon: <Globe className="size-5" />,
  },
  {
    id: 'early-christian-writings',
    title: 'Early Christian Writings',
    description: 'The New Testament and early patristic texts with introductions and links.',
    url: 'http://www.earlychristianwritings.com/',
    category: 'Reading',
    source: 'ECW',
    icon: <ScrollText className="size-5" />,
  },
  {
    id: 'aquinas-summa',
    title: 'Aquinas: Summa Theologiae',
    description: 'Accessible HTML edition of Aquinas’s Summa with indexed articles.',
    url: 'https://www.newadvent.org/summa/',
    category: 'Reading',
    source: 'New Advent',
    icon: <ScrollText className="size-5" />,
  },
  {
    id: 'augustine-confessions',
    title: 'Augustine: Confessions',
    description: 'Full text editions online; a cornerstone of Christian philosophical reflection.',
    url: 'https://www.ccel.org/ccel/augustine/confess.html',
    category: 'Reading',
    source: 'CCEL',
    icon: <ScrollText className="size-5" />,
  },
  {
    id: 'bibleproject',
    title: 'The Bible Project',
    description: 'Animated videos and study notes connecting biblical themes across Scripture.',
    url: 'https://bibleproject.com/',
    category: 'Media',
    source: 'BibleProject',
    icon: <Headphones className="size-5" />,
  },
  {
    id: 'pints-with-aquinas',
    title: 'Pints With Aquinas',
    description: 'Long-form conversations on theology, philosophy, and culture.',
    url: 'https://pintswithaquinas.com/',
    category: 'Media',
    source: 'Podcast',
    icon: <Headphones className="size-5" />,
  },
  {
    id: 'philosophy-bites',
    title: 'Philosophy Bites',
    description: 'Short interviews with leading philosophers—great for quick overviews.',
    url: 'https://philosophybites.com/',
    category: 'Media',
    source: 'Podcast',
    icon: <Headphones className="size-5" />,
  },
]

/**
 * ResourcesPage
 * Displays filters, search, and a responsive grid of resource cards.
 * Adds a robust "Suggest a resource" panel that works even when mailto is blocked.
 */
export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'All'>('All')
  const [query, setQuery] = useState('')

  // Suggest panel state
  const [showSuggest, setShowSuggest] = useState(false)
  const [sTitle, setSTitle] = useState('')
  const [sUrl, setSUrl] = useState('')
  const [sNotes, setSNotes] = useState('')
  const [copied, setCopied] = useState<'email' | 'draft' | null>(null)

  /**
   * buildDraft
   * Builds the email body content for the suggestion.
   */
  function buildDraft(): string {
    const lines: string[] = []
    lines.push('Resource Suggestion')
    lines.push('')
    if (sTitle.trim()) lines.push(`Title: ${sTitle.trim()}`)
    if (sUrl.trim()) lines.push(`URL: ${sUrl.trim()}`)
    if (sNotes.trim()) {
      lines.push('')
      lines.push('Notes:')
      lines.push(sNotes.trim())
    }
    lines.push('')
    lines.push('— Sent from the Resources page')
    return lines.join('\n')
  }

  /**
   * openMailDraft
   * Attempts to open the user’s default email app with prefilled subject/body.
   * Falls back to alert if mailto is blocked by the environment.
   */
  function openMailDraft() {
    const subject = sTitle.trim()
      ? `Resource Suggestion: ${sTitle.trim()}`
      : 'Resource Suggestion'
    const base = getContactMailto(subject)
    const body = buildDraft()
    const glue = base.includes('?') ? '&' : '?'
    const href = `${base}${glue}body=${encodeURIComponent(body)}`
    try {
      window.location.href = href
    } catch {
      alert('Could not open your mail app. You can copy the draft instead.')
    }
  }

  /**
   * copyDraft
   * Copies the draft body to clipboard for manual pasting into any email client.
   */
  async function copyDraft() {
    const body = buildDraft()
    await navigator.clipboard.writeText(body)
    setCopied('draft')
    setTimeout(() => setCopied(null), 1500)
  }

  /**
   * copyEmail
   * Copies the contact email address to the clipboard.
   */
  async function copyEmail() {
    await navigator.clipboard.writeText(siteConfig.contactEmail)
    setCopied('email')
    setTimeout(() => setCopied(null), 1500)
  }

  /** Compute filtered list based on category and query. */
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return allResources.filter((r) => {
      const matchesCategory = activeCategory === 'All' ? true : r.category === activeCategory
      if (!matchesCategory) return false
      if (!normalized) return true
      const hay = `${r.title} ${r.description} ${r.source ?? ''} ${r.category}`.toLowerCase()
      return hay.includes(normalized)
    })
  }, [activeCategory, query])

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Resources</h1>
            <p className="mt-2 text-muted-foreground">
              Curated references, tools, and media for exploring philosophy and Christian thought.
            </p>
          </div>

          {/* Search input */}
          <div className="w-full md:w-80">
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              aria-label="Search resources"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Try “Aquinas”, “Bible”, or “ethics”"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => setActiveCategory('All')}
            aria-pressed={activeCategory === 'All'}
          >
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              variant="outline"
              className={`bg-transparent ${activeCategory === c ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : ''}`}
              onClick={() => setActiveCategory(c)}
              aria-pressed={activeCategory === c}
            >
              {c}
            </Button>
          ))}
        </div>

        {/* Results */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="mt-12 rounded-lg border p-8 text-center text-sm text-muted-foreground">
            No resources found. Try a different search term or switch categories.
          </div>
        )}

        {/* Suggest a resource */}
        <div className="mt-12 rounded-lg border p-6">
          <div className="flex items-start gap-3">
            <BookOpen className="size-5 text-indigo-500" />
            <div className="w-full">
              <p className="font-medium">Have a great resource to add?</p>
              <p className="text-sm text-muted-foreground">
                Use the form below to draft an email, or copy our address to send from your preferred app.
              </p>

              {/* Contact row */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <a
                  className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                  href={getContactMailto('Resource Suggestion')}
                >
                  <Mail className="size-4" />
                  Open mail app
                </a>
                <span className="text-muted-foreground">•</span>
                <span className="rounded-md border bg-background px-2 py-1">{siteConfig.contactEmail}</span>
                <Button
                  variant="outline"
                  className="bg-transparent h-8 gap-1 px-2 text-xs"
                  onClick={copyEmail}
                >
                  <Copy className="size-3.5" />
                  {copied === 'email' ? 'Copied' : 'Copy email'}
                </Button>
              </div>

              {/* Toggle suggest panel */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => setShowSuggest((v) => !v)}
                  aria-expanded={showSuggest}
                >
                  {showSuggest ? 'Hide suggestion form' : 'Suggest a resource'}
                </Button>
              </div>

              {/* Suggestion form */}
              {showSuggest && (
                <div className="mt-4 rounded-lg border bg-card p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">Title</label>
                      <input
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Aquinas: Summa Theologiae"
                        value={sTitle}
                        onChange={(e) => setSTitle(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium">URL</label>
                      <input
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://example.com/resource"
                        value={sUrl}
                        onChange={(e) => setSUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-xs font-medium">Notes (optional)</label>
                    <textarea
                      className="mt-1 w-full min-h-[96px] rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="What makes this resource useful?"
                      value={sNotes}
                      onChange={(e) => setSNotes(e.target.value)}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button className="gap-2" onClick={openMailDraft}>
                      <Mail className="size-4" />
                      Open email draft
                    </Button>
                    <Button variant="outline" className="bg-transparent gap-2" onClick={copyDraft}>
                      <Copy className="size-4" />
                      {copied === 'draft' ? 'Copied draft' : 'Copy draft'}
                    </Button>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Tip: Some preview environments block opening mail apps. If nothing happens, use “Copy draft” and paste it into any email to {siteConfig.contactEmail}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
