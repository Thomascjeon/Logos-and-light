/**
 * contentOverrides.ts
 * LocalStorage-backed per-article content overrides (title, excerpt, body, quote, tags).
 * Used by ArticleCard and ArticleDetail to show user-authored content instead of generated text.
 */

import { useEffect } from 'react'

/**
 * ArticleContentOverride
 * Shape for user-authored content per article.
 */
export interface ArticleContentOverride {
  /** Optional custom title */
  title?: string
  /** Optional custom excerpt */
  excerpt?: string
  /** Optional custom tags (shown on cards) */
  tags?: string[]
  /** Optional custom body paragraphs */
  body?: string[]
  /** Optional custom quote */
  quote?: { text: string; author: string }
}

/**
 * ContentOverridesMap
 * Map of articleId -> override object.
 */
export type ContentOverridesMap = Record<string, ArticleContentOverride>

/** Storage key for content overrides. */
const STORAGE_KEY = 'll-content-overrides:v1'

/** Custom event name dispatched after changes so UIs can refresh immediately. */
export const CONTENT_EVENT = 'll-content-overrides-changed'

/**
 * readAll
 * Reads the full overrides map from localStorage.
 */
function readAll(): ContentOverridesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as ContentOverridesMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * writeAll
 * Writes the full overrides map to localStorage and emits change event.
 */
function writeAll(map: ContentOverridesMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // ignore quota errors
  }
  try {
    window.dispatchEvent(new CustomEvent(CONTENT_EVENT))
  } catch {
    // ignore
  }
}

/**
 * getContentOverride
 * Returns the override for the given article ID, if any.
 */
export function getContentOverride(articleId: string): ArticleContentOverride | undefined {
  const map = readAll()
  return map[articleId]
}

/**
 * setContentOverride
 * Sets/merges an override for an article ID.
 */
export function setContentOverride(articleId: string, override: ArticleContentOverride): void {
  const map = readAll()
  const prev = map[articleId] || {}
  map[articleId] = { ...prev, ...override }
  writeAll(map)
}

/**
 * clearContentOverride
 * Removes the override for the given article ID.
 */
export function clearContentOverride(articleId: string): void {
  const map = readAll()
  if (map[articleId]) {
    delete map[articleId]
    writeAll(map)
  }
}

/**
 * getAllContentOverrides
 * Returns the entire overrides map.
 */
export function getAllContentOverrides(): ContentOverridesMap {
  return readAll()
}

/**
 * setAllContentOverrides
 * Replaces the entire overrides map.
 */
export function setAllContentOverrides(next: ContentOverridesMap): void {
  writeAll(next || {})
}

/**
 * useContentOverridesVersion
 * Optional small hook: re-render when overrides change.
 */
export function useContentOverridesVersion(): number {
  // tiny inline hook to avoid an extra file; consumers can use useOverridesVersion which also listens to this event
  const React = require('react') as typeof import('react')
  const [v, setV] = React.useState(0)
  useEffect(() => {
    const onChange = () => setV(x => x + 1)
    window.addEventListener(CONTENT_EVENT, onChange as EventListener)
    return () => window.removeEventListener(CONTENT_EVENT, onChange as EventListener)
  }, [])
  return v
}
