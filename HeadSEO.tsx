/**
 * HeadSEO.tsx
 * Injects and keeps updated the canonical URL and Open Graph URL tags
 * based on the configured site baseUrl and current hash route.
 * This is lightweight and avoids extra dependencies.
 */

import { useEffect } from 'react'
import { siteConfig } from '../config/site'

/**
 * pathFromHash
 * Derives a clean path from the hash router (e.g., "#/articles/123" -> "/articles/123").
 */
function pathFromHash(): string {
  const hash = typeof window !== 'undefined' ? window.location.hash : ''
  if (!hash || hash === '#' || hash === '#/') return '/'
  // Remove the leading '#'
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  // Ensure it starts with '/'
  return raw.startsWith('/') ? raw : `/${raw}`
}

/**
 * buildCanonical
 * Builds the canonical absolute URL by combining baseUrl with the current path.
 * Hashes are not included in canonical URLs for cleaner indexing.
 */
function buildCanonical(baseUrl: string): string {
  if (!baseUrl) return ''
  const origin = baseUrl.replace(/\/+$/, '')
  const path = pathFromHash()
  if (path === '/') return origin
  return `${origin}${path}`
}

/**
 * upsertLink
 * Creates or updates a <link> tag in the document head.
 */
function upsertLink(id: string, rel: string, href: string) {
  if (typeof document === 'undefined' || !href) return
  let el = document.head.querySelector<HTMLLinkElement>(`link#${id}`)
  if (!el) {
    el = document.createElement('link')
    el.id = id
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

/**
 * upsertMeta
 * Creates or updates a <meta> tag in the document head by (name|property).
 */
function upsertMeta(id: string, key: 'name' | 'property', name: string, content: string) {
  if (typeof document === 'undefined' || !content) return
  let el = document.head.querySelector<HTMLMetaElement>(`meta#${id}`)
  if (!el) {
    el = document.createElement('meta')
    el.id = id
    el.setAttribute(key, name)
    document.head.appendChild(el)
  }
  el.content = content
}

/**
 * HeadSEO
 * React component that maintains canonical and og:url tags on route changes.
 */
export default function HeadSEO() {
  useEffect(() => {
    // Skip when baseUrl is not configured
    if (!siteConfig.baseUrl) return

    const apply = () => {
      const canonical = buildCanonical(siteConfig.baseUrl)
      upsertLink('ll-canonical', 'canonical', canonical)
      upsertMeta('ll-og-url', 'property', 'og:url', canonical)
      // Helpful for social/snippets (optional)
      upsertMeta('ll-og-site-name', 'property', 'og:site_name', siteConfig.name)
    }

    apply()

    // Update on hash changes (HashRouter navigation)
    const onHash = () => apply()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return null
}
