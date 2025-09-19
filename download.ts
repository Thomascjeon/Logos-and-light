/**
 * download.ts
 * Small utility to download an image by URL or Data URL. Falls back to opening in a new tab on CORS failure.
 */

/**
 * slugify
 * Converts a string to a filesystem-friendly slug.
 */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * downloadImage
 * Attempts to download an image. If src is a data URL, it downloads directly.
 * For remote URLs, it fetches and saves as a Blob; if that fails (CORS), opens the URL in a new tab.
 */
export async function downloadImage(src: string, baseName: string = 'image'): Promise<void> {
  const name = `${slugify(baseName) || 'image'}.jpg`

  // Data URL path: download directly
  if (src.startsWith('data:')) {
    const a = document.createElement('a')
    a.href = src
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    return
  }

  // Try to fetch as Blob for a proper download
  try {
    const res = await fetch(src, { mode: 'cors' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
    return
  } catch {
    // Fallback: open in a new tab; user can save manually
    window.open(src, '_blank', 'noopener,noreferrer')
  }
}
