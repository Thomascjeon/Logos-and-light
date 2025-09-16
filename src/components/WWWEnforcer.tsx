/**
 * WWWEnforcer.tsx
 * Ensures users visiting the apex domain are redirected to the canonical host (typically www).
 * Acts as a client-side safety net in case host-level 301 redirect is not configured.
 */

import { useEffect } from 'react'
import { siteConfig } from '../config/site'

/**
 * getCanonicalHost
 * Parses siteConfig.baseUrl and returns its hostname (e.g., "www.logos-and-light.com").
 */
function getCanonicalHost(): string | null {
  try {
    const u = new URL(siteConfig.baseUrl)
    return u.hostname || null
  } catch {
    return null
  }
}

/**
 * getApexFromCanonical
 * Given a canonical host (possibly starting with "www."), returns the apex hostname.
 */
function getApexFromCanonical(host: string): string {
  return host.replace(/^www\./, '')
}

/**
 * WWWEnforcer
 * On mount, if current hostname equals the apex (no "www") but the canonical host includes "www",
 * redirect to the canonical www host while preserving path, query, and hash.
 */
export default function WWWEnforcer() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const canonicalHost = getCanonicalHost()
    if (!canonicalHost) return

    const apexHost = getApexFromCanonical(canonicalHost)
    const onApex = window.location.hostname === apexHost
    const canonicalIsWWW = canonicalHost.startsWith('www.')

    // Only enforce when the chosen canonical host uses "www." and the visitor is on the apex.
    if (canonicalIsWWW && onApex) {
      // Use the protocol from the configured baseUrl when possible (usually https:)
      let targetProtocol = 'https:'
      try {
        targetProtocol = new URL(siteConfig.baseUrl).protocol || window.location.protocol
      } catch {
        targetProtocol = window.location.protocol
      }

      const { pathname, search, hash } = window.location
      const destination = `${targetProtocol}//${canonicalHost}${pathname}${search}${hash}`

      // Replace to avoid adding an extra history entry. This is a client-side redirect.
      window.location.replace(destination)
    }
  }, [])

  return null
}
