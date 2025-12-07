/**
 * remoteImages.ts
 * Runtime loader for public remote image mappings (articles and topics).
 * Adds localStorage persistence so edits made in the browser persist across refresh
 * for that browser on public as well. Locally persisted maps overlay remote maps.
 */

import { remoteImagesConfig, remoteUpdateConfig } from '../config/remote'

/** Event name dispatched when remote or local mappings change. */
export const REMOTE_EVENT = 'll-remote-images-changed'

/** LocalStorage key for browser-local persisted mappings. */
const LOCAL_STORAGE_KEY = 'll-remote-images-local:v1'

/** Maps populated from the remote source (read-only in-memory). */
let remoteTopicMap: Record<string, string> = {}
let remoteArticleMap: Record<string, string> = {}

/** Maps persisted in this browser via localStorage (overlay on top of remote). */
let localTopicMap: Record<string, string> = {}
let localArticleMap: Record<string, string> = {}

/** Utility type for both maps. */
export type RemoteMaps = { topics: Record<string, string>; articles: Record<string, string> }

/** Returns the current remote topic image (local overlay takes precedence). */
export function getRemoteTopicImage(topicKey: string): string | undefined {
  return localTopicMap[String(topicKey)] ?? remoteTopicMap[String(topicKey)]
}

/** Returns the current remote article image (local overlay takes precedence). */
export function getRemoteArticleImage(articleId: string): string | undefined {
  return localArticleMap[articleId] ?? remoteArticleMap[articleId]
}

/** Get a shallow copy of remote-only maps. */
export function getRemoteMaps(): RemoteMaps {
  return {
    topics: { ...remoteTopicMap },
    articles: { ...remoteArticleMap },
  }
}

/** Get a shallow copy of locally persisted maps. */
export function getLocalMaps(): RemoteMaps {
  return {
    topics: { ...localTopicMap },
    articles: { ...localArticleMap },
  }
}

/** Get effective maps seen by the app: local overlays remote. */
export function getEffectiveMaps(): RemoteMaps {
  return {
    topics: { ...remoteTopicMap, ...localTopicMap },
    articles: { ...remoteArticleMap, ...localArticleMap },
  }
}

/** Replace in-memory remote maps and notify listeners (used by editor preview). */
export function setRemoteMaps(next: RemoteMaps): void {
  remoteTopicMap = next.topics || {}
  remoteArticleMap = next.articles || {}
  notifyChange()
}

/** Saves local overlays to localStorage and updates in-memory maps, then notifies. */
export function persistLocalMaps(next: RemoteMaps): void {
  localTopicMap = next.topics || {}
  localArticleMap = next.articles || {}
  saveLocalPersist()
  notifyChange()
}

/** Clears locally persisted overlays from this browser and notifies. */
export function clearLocalMaps(): void {
  localTopicMap = {}
  localArticleMap = {}
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY)
  } catch {
    // ignore
  }
  notifyChange()
}

/** Saves remote mappings to a writable endpoint if configured. Returns success flag. */
export async function saveRemoteMappings(next: RemoteMaps): Promise<boolean> {
  if (!remoteUpdateConfig.enabled || !remoteUpdateConfig.url) return false
  try {
    const res = await fetch(remoteUpdateConfig.url, {
      method: remoteUpdateConfig.method,
      headers: {
        'Content-Type': 'application/json',
        ...(remoteUpdateConfig.headers || {}),
      },
      body: JSON.stringify({
        topics: next.topics || {},
        articles: next.articles || {},
      }),
    })
    if (!res.ok) return false
    // Update remote in-memory and notify
    setRemoteMaps(next)
    return true
  } catch {
    return false
  }
}

/** Emits a change event so consumers can re-render. */
function notifyChange() {
  try {
    window.dispatchEvent(new CustomEvent(REMOTE_EVENT))
  } catch {
    // Silently ignore CustomEvent restrictions
  }
}

/**
 * parseCsvLine
 * Minimal CSV line parser supporting quoted fields, commas, and double-quote escaping.
 * - Fields with commas must be quoted.
 * - Inside quoted fields, "" represents a literal ".
 */
function parseCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]

    if (inQuotes) {
      if (ch === '"') {
        const next = line[i + 1]
        if (next === '"') {
          // Escaped quote
          cur += '"'
          i++
        } else {
          // End quote
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else {
      if (ch === ',') {
        out.push(cur)
        cur = ''
      } else if (ch === '"') {
        inQuotes = true
      } else {
        cur += ch
      }
    }
  }
  out.push(cur)
  return out.map(s => s.trim())
}

/**
 * parseCSV
 * Parses CSV text into topic/article maps.
 * Expected header: type,key,url (case-insensitive).
 * Handles quoted URLs (e.g., data URLs with commas).
 */
function parseCSV(text: string): { topics: Record<string, string>; articles: Record<string, string> } {
  const topics: Record<string, string> = {}
  const articles: Record<string, string> = {}

  // Normalize newlines and trim BOM
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return { topics, articles }

  // Determine header indices
  const headerFields = parseCsvLine(lines[0]).map(h => h.toLowerCase())
  const typeIdx = headerFields.indexOf('type')
  const keyIdx = headerFields.indexOf('key') >= 0 ? headerFields.indexOf('key') : headerFields.indexOf('id')
  const urlIdx = headerFields.indexOf('url') >= 0 ? headerFields.indexOf('url') : headerFields.indexOf('image')

  const start = (typeIdx >= 0 && keyIdx >= 0 && urlIdx >= 0) ? 1 : 0

  for (let i = start; i < lines.length; i++) {
    const row = parseCsvLine(lines[i])
    const [t, k, u] =
      start === 1
        ? [row[typeIdx], row[keyIdx], row[urlIdx]]
        : [row[0], row[1], row[2]]

    if (!t || !k || !u) continue
    const type = String(t).toLowerCase()
    if (type === 'topic') {
      topics[k] = u
    } else if (type === 'article') {
      articles[k] = u
    }
  }

  return { topics, articles }
}

/** Parses JSON text into topic/article maps. */
function parseJSON(text: string): { topics: Record<string, string>; articles: Record<string, string> } {
  try {
    const obj = JSON.parse(text)
    return {
      topics: (obj?.topics ?? {}) as Record<string, string>,
      articles: (obj?.articles ?? {}) as Record<string, string>,
    }
  } catch {
    return { topics: {}, articles: {} }
  }
}

/** Fetches remote mapping and updates in-memory remote maps. Local overlays remain intact. */
async function fetchAndUpdate(): Promise<void> {
  if (!remoteImagesConfig.enabled || !remoteImagesConfig.url) return

  const url = remoteImagesConfig.url
  const cacheBust = `__t=${Date.now()}`
  const sep = url.includes('?') ? '&' : '?'
  const finalUrl = `${url}${sep}${cacheBust}`

  try {
    const res = await fetch(finalUrl, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Remote mapping fetch failed: ${res.status}`)
    const text = await res.text()

    const parsed =
      remoteImagesConfig.source === 'json'
        ? parseJSON(text)
        : parseCSV(text)

    remoteTopicMap = parsed.topics || {}
    remoteArticleMap = parsed.articles || {}

    notifyChange()
  } catch (e) {
    // Network/CORS/parse errors are non-fatal; keep previous mappings.
    console.warn('Remote image mapping load skipped:', e)
  }
}

/** Load local overlays from localStorage into memory. */
function loadLocalPersist(): void {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      localTopicMap = {}
      localArticleMap = {}
      return
    }
    const parsed = JSON.parse(raw) as RemoteMaps
    localTopicMap = parsed.topics || {}
    localArticleMap = parsed.articles || {}
  } catch {
    localTopicMap = {}
    localArticleMap = {}
  }
}

/** Save current local overlays to localStorage. */
function saveLocalPersist(): void {
  try {
    const payload: RemoteMaps = {
      topics: localTopicMap,
      articles: localArticleMap,
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota errors
  }
}

/** Initializes remote loader and local overlays with periodic refresh. */
export function initRemoteImages(): void {
  // Load locally persisted overlays first so they apply immediately after refresh
  loadLocalPersist()
  notifyChange()

  if (!remoteImagesConfig.enabled || !remoteImagesConfig.url) return

  // Initial fetch
  fetchAndUpdate()

  // Periodic refresh
  const minutes = Math.max(1, (remoteImagesConfig.refreshMinutes ?? 15))
  const intervalMs = minutes * 60_000
  const id = window.setInterval(fetchAndUpdate, intervalMs)

  // Refresh when tab becomes visible
  const onVis = () => {
    if (document.visibilityState === 'visible') void fetchAndUpdate()
  }
  document.addEventListener('visibilitychange', onVis)

  // Clean up on hot reload navigations
  window.addEventListener('beforeunload', () => {
    window.clearInterval(id)
    document.removeEventListener('visibilitychange', onVis)
  })
}

/** Manually refresh remote mappings now (used by the editor). */
export function refreshRemoteImages(): Promise<void> {
  return fetchAndUpdate()
}
