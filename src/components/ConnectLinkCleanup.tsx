/**
 * ConnectLinkCleanup.tsx
 * Small utility component that removes the "External" link from the Connect area (or anywhere it appears)
 * when it matches the provided characteristics (opens in new tab and is labeled "External" or points to example.com).
 *
 * It runs once on mount and also observes DOM mutations so it works across SPA route changes.
 */

import { useEffect } from 'react'

/**
 * removeTargets
 * Finds and removes anchors that:
 * - have target="_blank" (external)
 * - and either their text is exactly "External" (trimmed) OR href is "https://example.com"
 */
function removeTargets(root: ParentNode = document) {
  const candidates = Array.from(root.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]'))
  for (const a of candidates) {
    const label = (a.textContent || '').trim()
    const href = a.getAttribute('href') || ''
    if (label === 'External' || href === 'https://example.com') {
      // Remove the anchor itself; if wrapped in an <li>, prefer removing that for cleaner layout.
      const parentLi = a.closest('li')
      if (parentLi && parentLi.parentElement) {
        parentLi.parentElement.removeChild(parentLi)
      } else if (a.parentElement) {
        a.parentElement.removeChild(a)
      }
    }
  }
}

/**
 * ConnectLinkCleanup
 * React component that performs the cleanup on mount and observes future DOM changes.
 */
export default function ConnectLinkCleanup() {
  useEffect(() => {
    // Initial sweep
    removeTargets(document)

    // Observe DOM for future route changes or re-renders
    const observer = new MutationObserver(muts => {
      for (const m of muts) {
        if (m.addedNodes && m.addedNodes.length > 0) {
          m.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              removeTargets(node)
            }
          })
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return null
}
