/**
 * UploadDropzone.tsx
 * Reusable drag-and-drop, click-to-upload, and paste-enabled image uploader.
 * Converts images to compressed JPEG Data URLs and returns via onAccept.
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import { ImagePlus, UploadCloud } from 'lucide-react'

/**
 * UploadDropzoneProps
 * Props for the uploader component.
 */
export interface UploadDropzoneProps {
  /** Called with a JPEG data URL after successful processing */
  onAccept: (dataUrl: string) => void
  /** Optional label shown in the dropzone */
  label?: string
  /** Optional className for wrapper */
  className?: string
  /** Max target bytes after compression (default ~1.5MB) */
  maxBytes?: number
  /** Max long-edge dimension in pixels (progressively reduced if needed) */
  maxDim?: number
}

/**
 * bytesFromDataUrl
 * Estimates byte size of a base64 data URL.
 */
function bytesFromDataUrl(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] || ''
  const len = base64.length
  // Base64: 4 chars -> 3 bytes, account for padding
  const padding = (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0)
  return Math.floor(len * 3 / 4) - padding
}

/**
 * loadImage
 * Loads a File into an HTMLImageElement via object URL.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

/**
 * toJpegDataUrl
 * Draws an image to canvas with constrained dimensions and returns a JPEG data URL.
 */
function toJpegDataUrl(
  img: HTMLImageElement,
  maxDim: number,
  quality: number
): string {
  const { naturalWidth: w, naturalHeight: h } = img
  const scale = Math.min(1, maxDim / Math.max(w, h))
  const targetW = Math.max(1, Math.round(w * scale))
  const targetH = Math.max(1, Math.round(h * scale))

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    // Fallback: let the browser default handle
    return img.src
  }
  // Draw the resized image
  ctx.drawImage(img, 0, 0, targetW, targetH)
  // Export to JPEG
  return canvas.toDataURL('image/jpeg', quality)
}

/**
 * compressImageToTarget
 * Attempts multiple quality/dimension steps to fit within maxBytes.
 */
async function compressImageToTarget(
  file: File,
  maxBytes: number,
  startMaxDim: number
): Promise<string> {
  const img = await loadImage(file)

  // Progressive steps to try to fit within maxBytes
  const steps = [
    { dim: startMaxDim, q: 0.85 },
    { dim: Math.round(startMaxDim * 0.88), q: 0.75 },
    { dim: Math.round(startMaxDim * 0.8), q: 0.7 },
    { dim: Math.round(startMaxDim * 0.7), q: 0.65 },
    { dim: Math.round(startMaxDim * 0.6), q: 0.6 },
    { dim: Math.round(startMaxDim * 0.5), q: 0.55 },
  ]

  let best = toJpegDataUrl(img, steps[0].dim, steps[0].q)
  let bestBytes = bytesFromDataUrl(best)

  for (let i = 0; i < steps.length; i++) {
    const { dim, q } = steps[i]
    const dataUrl = toJpegDataUrl(img, dim, q)
    const size = bytesFromDataUrl(dataUrl)
    if (size <= maxBytes) return dataUrl
    if (size < bestBytes) {
      best = dataUrl
      bestBytes = size
    }
  }
  // Return the smallest attempt even if still larger than maxBytes
  return best
}

/**
 * UploadDropzone
 * UI zone for drag-drop/paste/click uploading of images.
 */
export default function UploadDropzone({
  onAccept,
  label = 'Drop or paste an image (JPG/PNG), or click to choose',
  className = '',
  maxBytes = 1_500_000, // ~1.5MB
  maxDim = 1600,
}: UploadDropzoneProps) {
  const [hover, setHover] = useState(false)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  /** handleFiles
   * Processes the first image file: compress -> return data URL.
   */
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const file = Array.from(files).find(f => f.type.startsWith('image/'))
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await compressImageToTarget(file, maxBytes, maxDim)
      onAccept(dataUrl)
    } finally {
      setBusy(false)
    }
  }, [maxBytes, maxDim, onAccept])

  /** onDrop handlers */
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setHover(false)
    if (e.dataTransfer?.files?.length) {
      void handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const onPaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.files
    if (items && items.length) {
      void handleFiles(items)
    }
  }, [handleFiles])

  /** Button click to open file chooser */
  const onClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const stateClasses = useMemo(() => {
    if (busy) return 'opacity-80'
    if (hover) return 'ring-2 ring-primary/50 bg-primary/5'
    return ''
  }, [hover, busy])

  return (
    <div
      tabIndex={0}
      onClick={onClick}
      onPaste={onPaste}
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setHover(true) }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setHover(true) }}
      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setHover(false) }}
      onDrop={onDrop}
      className={`cursor-pointer rounded-lg border border-dashed p-3 text-xs text-muted-foreground flex items-center gap-2 hover:bg-muted/40 transition ${stateClasses} ${className}`}
      aria-label="Image upload dropzone"
    >
      <UploadCloud className="size-4 text-foreground/70" />
      <span className="flex-1">{busy ? 'Processing image…' : label}</span>
      <span className="inline-flex items-center gap-1 text-foreground/70">
        <ImagePlus className="size-4" /> Choose
      </span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && void handleFiles(e.target.files)}
      />
    </div>
  )
}
