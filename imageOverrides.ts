/**
 * imageOverrides.ts
 * LocalStorage-backed utilities to override topic and article images plus a new site-wide override.
 * Respects public-vs-local environment, code-level defaults, and remote public mappings.
 *
 * New: site-wide override (config or localStorage) that replaces all imagery everywhere.
 */

import type { TopicKey } from './articleEngine'
import { IS_PUBLIC } from './env'
import { topicDefaultImages, articleDefaultImages, siteWideImageOverride } from '../config/images'
import { getRemoteArticleImage, getRemoteTopicImage } from './remoteImages'

/** ImageOverrides
 * Structure stored in localStorage that tracks per-topic and per-article overrides.
 */
interface ImageOverrides {
  /** Map of topicKey -> custom image URL */
  topics: Record<string, string>
  /** Map of articleId -> custom image URL */
  articles: Record<string, string>
}

/** Storage key for overrides (versioned for safe evolution) */
export const STORAGE_KEY = 'll-image-overrides:v1'
/** Storage key for site-wide global image override (applies to all images) */
export const STORAGE_SITE_WIDE = 'll-sitewide-image:v1'

/** Custom event name dispatched after local changes so UIs can refresh immediately */
export const OV_EVENT = 'll-image-overrides-changed'

/**
 * getSiteWideImageLocal
 * Reads a site-wide override URL from localStorage if present.
 */
function getSiteWideImageLocal(): string | null {
  try {
    const v = localStorage.getItem(STORAGE_SITE_WIDE)
    return v && v.trim() ? v.trim() : null
  } catch {
    return null
  }
}

/**
 * setSiteWideImage
 * Sets or clears the site-wide override URL in localStorage and notifies listeners.
 * Works in both public and local environments (intended for quick preview changes).
 */
export function setSiteWideImage(src: string | null) {
  try {
    if (src && src.trim()) {
      localStorage.setItem(STORAGE_SITE_WIDE, src.trim())
    } else {
      localStorage.removeItem(STORAGE_SITE_WIDE)
    }
    window.dispatchEvent(new CustomEvent(OV_EVENT))
  } catch {
    // ignore
  }
}

/** Reads overrides from localStorage or returns defaults (local only). */
function getOverrides(): ImageOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { topics: {}, articles: {} }
    const parsed = JSON.parse(raw)
    return {
      topics: parsed.topics ?? {},
      articles: parsed.articles ?? {},
    }
  } catch {
    return { topics: {}, articles: {} }
  }
}

/** Writes overrides to localStorage and emits a change event (local only). */
function saveOverrides(next: ImageOverrides): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota errors
  }
  try {
    window.dispatchEvent(new CustomEvent(OV_EVENT))
  } catch {
    // ignore
  }
}

/** Resolves the topic-level default image from code mapping or fallback. */
function resolveTopicDefault(topic: TopicKey, fallback: string): string {
  const byCode = topicDefaultImages[topic]
  return (byCode as string) || fallback
}

/** Resolves the article-level default image from code mapping/topic fallback. */
function resolveArticleDefault(articleId: string, fallback: string, topicKey?: TopicKey): string {
  const byArticle = articleDefaultImages[articleId]
  if (byArticle) return byArticle
  if (topicKey && topicDefaultImages[topicKey]) return topicDefaultImages[topicKey] as string
  return fallback
}

/** Sets or clears a topic-level image override (no-op on public). */
export function setTopicImage(topic: TopicKey, src: string | null) {
  if (IS_PUBLIC) return
  const ov = getOverrides()
  if (src && src.trim()) {
    ov.topics[String(topic)] = src.trim()
  } else {
    delete ov.topics[String(topic)]
  }
  saveOverrides(ov)
}

/** Sets or clears an article-specific image override (no-op on public). */
export function setArticleImage(articleId: string, src: string | null) {
  if (IS_PUBLIC) return
  const ov = getOverrides()
  if (src && src.trim()) {
    ov.articles[articleId] = src.trim()
  } else {
    delete ov.articles[articleId]
  }
  saveOverrides(ov)
}

/**
 * getTopicImage
 * Resolves a topic image source using environment-aware precedence, with a new hard site-wide override at the very top.
 */
export function getTopicImage(topic: TopicKey, defaultSrc: string): string {
  // 0) Site-wide override (config constant or localStorage) — always wins
  const siteWide = siteWideImageOverride || getSiteWideImageLocal()
  if (siteWide) return siteWide

  if (IS_PUBLIC) {
    // Public: remote -> code -> fallback
    const r = getRemoteTopicImage(String(topic))
    if (r) return r
    return resolveTopicDefault(topic, defaultSrc)
  }
  // Local: local -> remote -> code -> fallback
  const ov = getOverrides()
  const fromOverride = ov.topics[String(topic)]
  if (fromOverride) return fromOverride
  const r = getRemoteTopicImage(String(topic))
  if (r) return r
  return resolveTopicDefault(topic, defaultSrc)
}

/**
 * getArticleImage
 * Resolves an article image source using environment-aware precedence.
 * New: site-wide override takes absolute precedence.
 */
export function getArticleImage(
  articleId: string,
  defaultSrc: string,
  topicKey?: TopicKey
): string {
  // 0) Site-wide override (config constant or localStorage) — always wins
  const siteWide = siteWideImageOverride || getSiteWideImageLocal()
  if (siteWide) return siteWide

  if (IS_PUBLIC) {
    // 1) Remote article mapping
    const ra = getRemoteArticleImage(articleId)
    if (ra) return ra

    // 2) Remote topic mapping (explicit public preference)
    if (topicKey) {
      const rt = getRemoteTopicImage(String(topicKey))
      if (rt) return rt
    }

    // 3) Code default for this article (if any)
    const byArticle = articleDefaultImages[articleId]
    if (byArticle) return byArticle

    // 4) Generated unique per-article default (from generator)
    if (defaultSrc) return defaultSrc

    // 5) Code default topic mapping (broad fallback)
    if (topicKey && topicDefaultImages[topicKey]) return topicDefaultImages[topicKey] as string

    return defaultSrc
  }

  // Local: local (article -> topic) -> remote (article -> topic) -> code -> fallback
  const ov = getOverrides()
  if (ov.articles[articleId]) return ov.articles[articleId]
  if (topicKey && ov.topics[String(topicKey)]) return ov.topics[String(topicKey)]

  const ra = getRemoteArticleImage(articleId)
  if (ra) return ra
  if (topicKey) {
    const rt = getRemoteTopicImage(String(topicKey))
    if (rt) return rt
  }
  return resolveArticleDefault(articleId, defaultSrc, topicKey)
}

/** Exposed for settings UI to read current values (local dev only). */
export function getAllOverrides(): ImageOverrides {
  if (IS_PUBLIC) return { topics: {}, articles: {} }
  return getOverrides()
}
