/**
 * ContentEditor.tsx
 * Lightweight editor to author per-article text overrides (title, excerpt, body, quote, tags).
 * Stores changes in localStorage so they persist after refresh on this device.
 * You can export/import JSON for backup or to publish elsewhere.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { Link, useLocation } from 'react-router'
import { listArticlesForDate, getArticleDetailById } from '../lib/articleEngine'
import {
  getAllContentOverrides,
  setAllContentOverrides,
  getContentOverride,
  setContentOverride,
  clearContentOverride,
  type ArticleContentOverride,
} from '../lib/contentOverrides'
import { Download, Upload, Save, Trash2, Plus, AlertTriangle } from 'lucide-react'

/**
 * useQuery
 * Small helper to read query params.
 */
function useQuery() {
  const location = useLocation()
  return useMemo(() => new URLSearchParams(location.search.replace(/^\?/, '')), [location.search])
}

/**
 * buildBodyText
 * Joins paragraphs into an editable textarea text using blank lines.
 */
function buildBodyText(paras: string[]): string {
  return (paras || []).join('\n\n')
}

/**
 * splitBodyText
 * Splits textarea input into body paragraphs (blank line separates paragraphs).
 */
function splitBodyText(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map(s => s.trim())
    .filter(Boolean)
}

/**
 * downloadFile
 * Triggers a file download for given content.
 */
function downloadFile(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/**
 * ContentEditorPage
 * Public-facing editor for article content overrides with local persistence.
 */
export default function ContentEditorPage() {
  const today = useMemo(() => new Date(), [])
  const todays = useMemo(() => listArticlesForDate(today, 2), [today])

  const query = useQuery()
  const prefill = (query.get('article') || '').trim()

  const [articleId, setArticleId] = useState<string>(prefill || (todays[0]?.id ?? ''))
  const [loadedCoreTitle, setLoadedCoreTitle] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const [excerpt, setExcerpt] = useState<string>('')
  const [quoteText, setQuoteText] = useState<string>('')
  const [quoteAuthor, setQuoteAuthor] = useState<string>('')
  const [bodyText, setBodyText] = useState<string>('')
  const [tags, setTags] = useState<string>('') // comma-separated for UI
  const [validId, setValidId] = useState<boolean>(true)

  /** loadArticle
   * Loads base (generated) content + current override for a given article ID into the form.
   */
  function loadArticle(id: string) {
    const core = getArticleDetailById(id)
    setValidId(!!core)
    const ov = getContentOverride(id)

    setLoadedCoreTitle(core ? core.title : '')
    setTitle(ov?.title ?? (core ? core.title : ''))
    setExcerpt(ov?.excerpt ?? (core ? core.excerpt : ''))
    setQuoteText(ov?.quote?.text ?? (core ? core.quote.text : ''))
    setQuoteAuthor(ov?.quote?.author ?? (core ? core.quote.author : ''))
    setBodyText(ov?.body ? buildBodyText(ov.body) : (core ? buildBodyText(core.body) : ''))
    setTags((ov?.tags ?? (core ? core.tags : [])).join(', '))
  }

  useEffect(() => {
    if (articleId) loadArticle(articleId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId])

  /** onSave
   * Writes current form fields to overrides for the current article ID.
   */
  function onSave() {
    if (!articleId.trim()) return
    const ov: ArticleContentOverride = {
      title: title.trim() || undefined,
      excerpt: excerpt.trim() || undefined,
      quote: (quoteText.trim() || quoteAuthor.trim())
        ? { text: quoteText.trim(), author: quoteAuthor.trim() }
        : undefined,
      body: splitBodyText(bodyText),
      tags: tags.split(',').map(s => s.trim()).filter(Boolean),
    }
    setContentOverride(articleId.trim(), ov)
    alert('Saved locally. Your edits will persist after refresh on this device.')
  }

  /** onDelete
   * Clears the override for the current article ID.
   */
  function onDelete() {
    if (!articleId.trim()) return
    clearContentOverride(articleId.trim())
    loadArticle(articleId.trim())
    alert('Override removed for this article.')
  }

  /** onImport
   * Imports JSON mapping from a file and replaces all overrides.
   */
  function onImport(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || '')
        const data = JSON.parse(text)
        if (data && typeof data === 'object') {
          setAllContentOverrides(data as Record<string, ArticleContentOverride>)
          // reload current form view
          if (articleId) loadArticle(articleId)
          alert('Imported overrides.')
        }
      } catch {
        alert('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold">Content Editor</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-transparent gap-2"
              onClick={() => {
                const json = JSON.stringify(getAllContentOverrides(), null, 2)
                downloadFile('content-overrides.json', json, 'application/json')
              }}
            >
              <Download className="size-4" />
              Download JSON
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) onImport(f)
                e.currentTarget.value = ''
              }}
            />
            <Button
              variant="outline"
              className="bg-transparent gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              Import JSON
            </Button>
          </div>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Edit article text in your browser. Changes are saved locally and persist after refresh. Use JSON export/import to move or publish.
        </p>

        <Separator className="my-6" />

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Sidebar: pick article */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pick an article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Article ID</div>
                <Input
                  placeholder="e.g., faith-and-reason-20250811-1"
                  value={articleId}
                  onChange={e => setArticleId(e.target.value.trim())}
                />
                {!validId && (
                  <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="size-4" />
                    This ID is not a generated article for today; you can still save, but it won’t show anywhere unless an article uses this ID.
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">Today’s IDs</div>
              <div className="flex flex-col gap-1 max-h-64 overflow-auto pr-1">
                {todays.map(a => (
                  <Button
                    key={a.id}
                    variant="outline"
                    className={`bg-transparent justify-start ${a.id === articleId ? 'border-primary' : ''}`}
                    onClick={() => setArticleId(a.id)}
                  >
                    {a.id}
                  </Button>
                ))}
              </div>

              <Link to="/articles">
                <Button variant="outline" className="bg-transparent w-full">Back to Articles</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Editor form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Edit content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Title</div>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={loadedCoreTitle || 'Title'} />
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">Excerpt</div>
                <Input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short summary…" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Quote text</div>
                  <textarea
                    value={quoteText}
                    onChange={e => setQuoteText(e.target.value)}
                    placeholder="A companion quote"
                    className="w-full min-h-[72px] rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Quote author</div>
                  <Input value={quoteAuthor} onChange={e => setQuoteAuthor(e.target.value)} placeholder="Author" />
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">Body (paragraphs, separate with a blank line)</div>
                <textarea
                  value={bodyText}
                  onChange={e => setBodyText(e.target.value)}
                  placeholder="Write your article body here…"
                  className="w-full min-h-[220px] rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-1">Tags (comma separated)</div>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., Faith &amp; Reason, daily" />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button className="gap-2" onClick={onSave}>
                  <Save className="size-4" />
                  Save locally
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent gap-2"
                  onClick={() => {
                    setTitle('')
                    setExcerpt('')
                    setQuoteText('')
                    setQuoteAuthor('')
                    setBodyText('')
                    setTags('')
                  }}
                >
                  <Plus className="size-4" />
                  Clear form
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent gap-2"
                  onClick={onDelete}
                >
                  <Trash2 className="size-4" />
                  Remove override
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  )
}
