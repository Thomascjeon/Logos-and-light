/**
 * ImageryEditor.tsx
 * Lightweight editor to manage public remote image mappings for topics and articles.
 * Now supports uploading images from your computer and auto-saves all changes to localStorage,
 * so they persist after refresh in this browser (even on public). Local overlays merge over remote.
 *
 * For global persistence (visible to all visitors), configure a writable remote or export JSON/CSV
 * and upload to your public URL configured in src/config/remote.ts.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { AlertTriangle, CloudDownload, Save, Upload, Plus, Trash2, RefreshCw, ImagePlus, XCircle } from 'lucide-react'
import { listArticlesForDate, type TopicKey, topics as topicRegistry } from '../lib/articleEngine'
import { IS_PUBLIC } from '../lib/env'
import { Link, useLocation } from 'react-router'
import {
  getEffectiveMaps,
  setRemoteMaps,
  saveRemoteMappings,
  refreshRemoteImages,
  type RemoteMaps,
  persistLocalMaps,
  clearLocalMaps,
} from '../lib/remoteImages'
import { adminEditKey, remoteImagesConfig, remoteUpdateConfig } from '../config/remote'
import UploadDropzone from '../components/UploadDropzone'

/** Row entry representing a single editable mapping item. */
interface MappingRow {
  key: string
  url: string
}

/** Converts current RemoteMaps to list rows for rendering/editing. */
function mapsToRows(maps: RemoteMaps): { topicRows: MappingRow[]; articleRows: MappingRow[] } {
  return {
    topicRows: Object.entries(maps.topics || {}).map(([k, u]) => ({ key: k, url: u })),
    articleRows: Object.entries(maps.articles || {}).map(([k, u]) => ({ key: k, url: u })),
  }
}

/** Converts rows back to RemoteMaps. */
function rowsToMaps(topicRows: MappingRow[], articleRows: MappingRow[]): RemoteMaps {
  return {
    topics: Object.fromEntries(topicRows.filter(r => r.key && r.url).map(r => [r.key, r.url] as const)),
    articles: Object.fromEntries(articleRows.filter(r => r.key && r.url).map(r => [r.key, r.url] as const)),
  }
}

/**
 * csvEscape
 * Returns a CSV-safe field, quoting as needed and escaping double-quotes.
 */
function csvEscape(v: string): string {
  const needsQuote = /[",\n\r]/.test(v)
  const out = v.replace(/"/g, '""')
  return needsQuote ? `"${out}"` : out
}

/** Simple CSV generator from RemoteMaps (properly quoted). */
function toCSV(maps: RemoteMaps): string {
  const lines: string[] = ['type,key,url']
  for (const [k, u] of Object.entries(maps.topics || {})) {
    lines.push([csvEscape('topic'), csvEscape(k), csvEscape(u)].join(','))
  }
  for (const [k, u] of Object.entries(maps.articles || {})) {
    lines.push([csvEscape('article'), csvEscape(k), csvEscape(u)].join(','))
  }
  return lines.join('\n')
}

/** Triggers a file download for given content. */
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

/** useQuery helper. */
function useQuery() {
  const location = useLocation()
  return useMemo(() => new URLSearchParams(location.search.replace(/^\?/, '')), [location.search])
}

/** ImageryEditorPage
 * Public-facing editor for remote mappings with optional write-back and desktop uploads.
 * Adds local auto-persist so changes stick after refresh (this browser).
 */
export default function ImageryEditorPage() {
  const query = useQuery()
  const hasKey = (adminEditKey && query.get('key') === adminEditKey) || !adminEditKey
  const canEdit = !IS_PUBLIC || hasKey

  // Optional prefill from query (?article=... or ?topic=...)
  const prefillArticle = (query.get('article') || '').trim()
  const prefillTopic = (query.get('topic') || '').trim()

  // Seed from effective maps (local overlays + remote)
  const [topicRows, setTopicRows] = useState<MappingRow[]>([])
  const [articleRows, setArticleRows] = useState<MappingRow[]>([])
  const [saving, setSaving] = useState(false)
  const [savedOk, setSavedOk] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  /** Load effective maps into editor rows. */
  function loadFromEffective() {
    const maps = getEffectiveMaps()
    const { topicRows, articleRows } = mapsToRows(maps)
    setTopicRows(topicRows)
    setArticleRows(articleRows)
  }

  useEffect(() => {
    // Initialize with whatever we have loaded already (local overlays + remote)
    loadFromEffective()
  }, [])

  /**
   * Prefill a row from query parameters once on mount.
   * This helps quickly replace a single article/topic image via deep-links from elsewhere.
   */
  const didPrefillRef = useRef(false)
  useEffect(() => {
    if (didPrefillRef.current) return
    let changed = false
    if (prefillTopic && !topicRows.some(r => r.key === prefillTopic)) {
      setTopicRows(prev => [{ key: prefillTopic, url: '' }, ...prev])
      changed = true
    }
    if (prefillArticle && !articleRows.some(r => r.key === prefillArticle)) {
      setArticleRows(prev => [{ key: prefillArticle, url: '' }, ...prev])
      changed = true
    }
    if (changed) didPrefillRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillArticle, prefillTopic, topicRows.length, articleRows.length])

  /** Pull latest remote file and refresh editor with it. Keeps local overlays intact. */
  async function pullRemote() {
    setLoading(true)
    await refreshRemoteImages()
    loadFromEffective()
    setLoading(false)
  }

  /** Push changes via write-back if configured; otherwise fallback to export prompt. */
  async function onSaveRemote() {
    setSaving(true)
    setSavedOk(null)
    const nextMaps = rowsToMaps(topicRows, articleRows)
    const ok = await saveRemoteMappings(nextMaps)
    setSavedOk(ok)
    setSaving(false)
    if (!ok) {
      alert(
        'Save endpoint not configured or write failed. Use "Download JSON/CSV" and upload the file to your public URL configured in src/config/remote.ts.'
      )
    } else {
      // After successful save, reload the remote to ensure consumers see updates
      await refreshRemoteImages()
    }
  }

  /** Add convenience rows */
  function addTopicRow(prefillKey = '') {
    setTopicRows(prev => [{ key: prefillKey, url: '' }, ...prev])
  }
  function addArticleRow(prefillKey = '') {
    setArticleRows(prev => [{ key: prefillKey, url: '' }, ...prev])
  }

  /** Generate helpful suggestions: today's articles and known topics. */
  const today = useMemo(() => new Date(), [])
  const todaysArticles = useMemo(() => listArticlesForDate(today, 2), [today])

  /**
   * Auto-persist all edits locally (this browser) so they survive refresh.
   * Debounced to avoid excessive writes.
   */
  const debounceRef = useRef<number | null>(null)
  useEffect(() => {
    if (!canEdit) return
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      const maps = rowsToMaps(topicRows, articleRows)
      persistLocalMaps(maps)
      // Also update in-memory remote maps for immediate preview in other tabs if needed
      setRemoteMaps(getEffectiveMaps())
    }, 300)
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicRows, articleRows, canEdit])

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold">Imagery Editor</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-transparent gap-2" onClick={pullRemote} disabled={loading}>
              <RefreshCw className="size-4" />
              {loading ? 'Refreshing…' : 'Load current remote'}
            </Button>
            {canEdit && remoteUpdateConfig.enabled && (
              <Button className="gap-2" onClick={onSaveRemote} disabled={saving}>
                <Save className="size-4" />
                {saving ? 'Saving…' : 'Save to remote'}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Remote source: {remoteImagesConfig.enabled ? `${remoteImagesConfig.source.toUpperCase()} at ${remoteImagesConfig.url || 'not set'}` : 'Disabled'}
          {' · '}
          Write-back: {remoteUpdateConfig.enabled ? remoteUpdateConfig.url || 'enabled (URL not set)' : 'Disabled'}
          {!canEdit && (
            <>
              {' · '}
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-4" /> read-only (provide ?key=…)
              </span>
            </>
          )}
        </p>

        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1">
            <ImagePlus className="size-4" />
            Upload images from your computer. Images are compressed and embedded (Data URLs).
          </p>
          <p>
            Changes are auto-saved locally and persist after refresh on this device. To publish for all visitors, use “Save to remote” or download JSON/CSV and upload to your host/CDN.
          </p>
        </div>

        <Separator className="my-6" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="bg-transparent gap-2" onClick={() => addTopicRow()}>
                <Plus className="size-4" />
                Add topic row
              </Button>
              <div className="text-xs text-muted-foreground">
                Known topics: {topicRegistry.map(t => t.key).join(', ')}
              </div>
            </div>

            <div className="grid gap-3">
              {topicRows.map((row, idx) => (
                <div key={`${row.key}-${idx}`} className="grid gap-3 items-center rounded-lg border p-3 sm:grid-cols-[140px_1fr]">
                  <div className="flex items-center gap-3">
                    <div className="h-20 w-[140px] overflow-hidden rounded bg-muted shrink-0">
                      <img src={row.url || 'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/f6ed67fe-a1e2-4e77-96f5-0df824cd161d.jpg'} className="object-cover h-full w-full" alt={row.key || 'Topic preview'} />
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground text-xs">Topic key</div>
                      <Input
                        value={row.key}
                        onChange={e => {
                          const v = e.target.value.trim()
                          setTopicRows(list => list.map((r, i) => i === idx ? { ...r, key: v } : r))
                        }}
                        placeholder="e.g., faith-and-reason"
                        readOnly={!canEdit}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      value={row.url}
                      onChange={e => {
                        const v = e.target.value
                        setTopicRows(list => list.map((r, i) => i === idx ? { ...r, url: v } : r))
                      }}
                      placeholder="Public image URL or Data URL (JPG/WEBP)"
                      readOnly={!canEdit}
                    />
                    {canEdit && (
                      <div className="flex items-center gap-2">
                        <UploadDropzone
                          label="Upload from computer (JPG/PNG)"
                          onAccept={(dataUrl) => {
                            // Store as Data URL
                            setTopicRows(list => list.map((r, i) => i === idx ? { ...r, url: dataUrl } : r))
                          }}
                          maxBytes={1_800_000}
                          maxDim={1800}
                        />
                        <Button
                          variant="outline"
                          className="bg-transparent"
                          onClick={() => setTopicRows(list => list.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Articles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" className="bg-transparent gap-2" onClick={() => addArticleRow()}>
                <Plus className="size-4" />
                Add article row
              </Button>
              <div className="text-xs text-muted-foreground">
                Tip: IDs are visible on article detail URLs or generated via date. Examples (today): {todaysArticles.map(a => a.id).join(', ')}
              </div>
            </div>

            <div className="grid gap-3">
              {articleRows.map((row, idx) => (
                <div key={`${row.key}-${idx}`} className="grid gap-3 items-center rounded-lg border p-3 sm:grid-cols-[140px_1fr]">
                  <div className="flex items-center gap-3">
                    <div className="h-20 w-[140px] overflow-hidden rounded bg-muted shrink-0">
                      <img src={row.url || 'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/9c4a6468-8f20-46b6-88d7-123009959643.png'} className="object-cover h-full w-full" alt={row.key || 'Article preview'} />
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground text-xs">Article ID</div>
                      <Input
                        value={row.key}
                        onChange={e => {
                          const v = e.target.value.trim()
                          setArticleRows(list => list.map((r, i) => i === idx ? { ...r, key: v } : r))
                        }}
                        placeholder="e.g., art-2025-08-11-1"
                        readOnly={!canEdit}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      value={row.url}
                      onChange={e => {
                        const v = e.target.value
                        setArticleRows(list => list.map((r, i) => i === idx ? { ...r, url: v } : r))
                      }}
                      placeholder="Public image URL or Data URL (JPG/WEBP)"
                      readOnly={!canEdit}
                    />
                    {canEdit && (
                      <div className="flex items-center gap-2">
                        <UploadDropzone
                          label="Upload from computer (JPG/PNG)"
                          onAccept={(dataUrl) => {
                            setArticleRows(list => list.map((r, i) => i === idx ? { ...r, url: dataUrl } : r))
                          }}
                          maxBytes={1_800_000}
                          maxDim={1800}
                        />
                        <Button
                          variant="outline"
                          className="bg-transparent"
                          onClick={() => setArticleRows(list => list.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Publish or Export</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button className="gap-2" onClick={() => {
              const maps = rowsToMaps(topicRows, articleRows)
              const json = JSON.stringify(maps, null, 2)
              downloadFile('remote-images.json', json, 'application/json')
            }}>
              <CloudDownload className="size-4" />
              Download JSON
            </Button>
            <Button
              variant="outline"
              className="bg-transparent gap-2"
              onClick={() => {
                const csv = toCSV(rowsToMaps(topicRows, articleRows))
                downloadFile('remote-images.csv', csv, 'text/csv')
              }}
            >
              <CloudDownload className="size-4" />
              Download CSV
            </Button>
            <Button
              variant="outline"
              className="bg-transparent gap-2"
              onClick={async () => {
                const json = JSON.stringify(rowsToMaps(topicRows, articleRows), null, 2)
                try {
                  await navigator.clipboard.writeText(json)
                  alert('JSON copied to clipboard')
                } catch {
                  alert('Could not copy. Use Download JSON instead.')
                }
              }}
            >
              <Upload className="size-4" />
              Copy JSON
            </Button>
            {canEdit && remoteUpdateConfig.enabled && (
              <Button className="gap-2" onClick={onSaveRemote} disabled={saving}>
                <Save className="size-4" />
                {saving ? 'Saving…' : 'Save to remote'}
              </Button>
            )}
            <Button
              variant="outline"
              className="bg-transparent gap-2"
              onClick={() => {
                clearLocalMaps()
                loadFromEffective()
              }}
            >
              <XCircle className="size-4" />
              Clear local (this browser)
            </Button>
          </CardContent>
        </Card>

        {savedOk === true && (
          <p className="mt-3 text-sm text-emerald-600">Saved to remote successfully and mappings refreshed.</p>
        )}
        {savedOk === false && (
          <p className="mt-3 text-sm text-amber-600">
            Save failed. Please configure a writable endpoint (remoteUpdateConfig) or use downloads above and upload to your host/CDN.
          </p>
        )}

        <Separator className="my-6" />

        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            How it works: the site loads a mapping at runtime. Your browser also stores an overlay locally so your edits persist after refresh here.
          </p>
          <p>
            To publish globally, set a public URL in src/config/remote.ts and either enable write-back or upload the JSON/CSV you download here.
          </p>
          <p>
            Security tip: set an admin key in src/config/remote.ts and open this page as /#/imagery?key=YOUR_KEY to enable editing on public.
          </p>
        </div>

        <div className="mt-6">
          <Link to="/">
            <Button variant="outline" className="bg-transparent">Back to Home</Button>
          </Link>
        </div>
      </section>
    </Layout>
  )
}
