/**
 * ImageWithFallback.tsx
 * Reusable image component that falls back to a topic-colored SVG placeholder (data URL)
 * when the main image fails to load (CSP, ad-blockers, network).
 */

import React, { useMemo, useState } from 'react'
import type { TopicKey } from '../lib/articleEngine'

/**
 * ImageWithFallbackProps
 * Props for the resilient image component.
 */
export interface ImageWithFallbackProps {
  /** Primary image URL to attempt */
  src: string
  /** Accessible alt text */
  alt?: string
  /** Class names forwarded to &lt;img&gt; */
  className?: string
  /** Optional topic key to colorize the fallback placeholder deterministically */
  topicKey?: TopicKey
  /** Optional label used in the placeholder (e.g., title or topic label) */
  label?: string
}

/**
 * topicGradient
 * Returns a pleasant gradient pair for a given topic.
 */
function topicGradient(topic?: TopicKey): { from: string; to: string } {
  switch (topic) {
    case 'faith-and-reason':
      return { from: '#6366f1', to: '#14b8a6' } // indigo -> teal
    case 'ethics':
      return { from: '#0ea5e9', to: '#22c55e' } // sky -> emerald
    case 'metaphysics':
      return { from: '#8b5cf6', to: '#06b6d4' } // violet -> cyan
    case 'theology':
      return { from: '#f59e0b', to: '#ef4444' } // amber -> red
    case 'scripture':
      return { from: '#22c55e', to: '#0ea5e9' } // emerald -> sky
    case 'aesthetics':
      return { from: '#f43f5e', to: '#f59e0b' } // rose -> amber
    case 'history':
      return { from: '#06b6d4', to: '#0ea5e9' } // cyan -> sky
    case 'apologetics':
      return { from: '#14b8a6', to: '#0ea5e9' } // teal -> sky
    default:
      return { from: '#6366f1', to: '#06b6d4' } // indigo -> cyan (default)
  }
}

/**
 * buildSvgDataUri
 * Builds an SVG gradient placeholder with optional centered label, returned as data URL.
 */
function buildSvgDataUri(label: string | undefined, from: string, to: string): string {
  // Keep text short for readability; avoid special characters that complicate encoding.
  const text = (label || '').slice(0, 42)
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-label="${escapeAttr(
    text || 'placeholder image'
  )}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#g)"/>
    ${
      text
        ? `<text x="800" y="450" text-anchor="middle" dominant-baseline="middle"
            font-family="system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial"
            font-size="52" fill="rgba(255,255,255,0.92)" style="letter-spacing:0.5px">${escapeText(text)}</text>`
        : ''
    }
  </svg>`
    .trim()
    // Minimal whitespace to keep data URI short
    .replace(/\n\s+/g, ' ')

  // Encode as UTF-8 data URL; encode special chars only.
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/**
 * escapeAttr
 * Escapes text to be safely used inside XML attribute context.
 */
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

/**
 * escapeText
 * Escapes text to be safely used inside XML text node.
 */
function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
}

/**
 * ImageWithFallback
 * Attempts to render the primary src; on error, swaps in a themed SVG placeholder.
 */
export default function ImageWithFallback({
  src,
  alt = '',
  className = '',
  topicKey,
  label,
}: ImageWithFallbackProps) {
  const [failed, setFailed] = useState(false)

  // Build placeholder only when needed/when inputs change
  const placeholder = useMemo(() => {
    const { from, to } = topicGradient(topicKey)
    return buildSvgDataUri(label, from, to)
  }, [topicKey, label])

  return (
    <img
      src={failed ? placeholder : src}
      onError={() => setFailed(true)}
      alt={alt}
      className={className}
      // Decoding async helps avoid layout jank when many images appear.
      decoding="async"
      // Let browser lazily load below-the-fold images for lists
      loading="lazy"
    />
  )
}
