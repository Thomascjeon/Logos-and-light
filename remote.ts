/**
 * remote.ts
 * Configuration for remote image mappings that load at runtime on the public site.
 * Set enabled=true and provide a public URL to a CSV or JSON mapping file.
 *
 * CSV format (recommended):
 *   type,key,url
 *   article,art-2025-08-11-1,https://your-cdn.example.com/a1.jpg
 *   topic,faith-and-reason,https://your-cdn.example.com/t-faith.jpg
 *
 * JSON format (alternative):
 * {
 *   "articles": { "art-2025-08-11-1": "https://...", "art-2025-08-12-2": "https://..." },
 *   "topics": { "faith-and-reason": "https://..." }
 * }
 */

export type RemoteSource = 'csv' | 'json'

/** RemoteImagesConfig
 * Controls runtime loading of remote image mappings.
 */
export interface RemoteImagesConfig {
  /** Enable remote loading. */
  enabled: boolean
  /** Source format: 'csv' or 'json'. */
  source: RemoteSource
  /** Public URL to the mapping file (with CORS enabled). */
  url: string
  /** How often to refresh in minutes (default 15). */
  refreshMinutes?: number
}

/**
 * Remote image source (ENABLED for your test).
 * We will use your JSON link so everyone can see the images.
 */
export const remoteImagesConfig: RemoteImagesConfig = {
  enabled: true,
  source: 'json',
  url: 'https://raw.githubusercontent.com/Thomascjeon/logosandlight-pictures/refs/heads/main/remote-images%20(2).json',
  refreshMinutes: 15,
}

/** RemoteUpdateConfig
 * Optional write-back endpoint to persist mapping changes directly from the editor.
 * If your host/CDN provides a writable endpoint with CORS (e.g., a small API, S3 pre-signed URL),
 * you can set this up so clicking Save on the editor writes remotely.
 *
 * Notes:
 * - If disabled or misconfigured, the editor still lets you Download/Copy JSON/CSV for manual upload.
 * - The editor always sends JSON payload: { topics: Record<string,string>; articles: Record<string,string> }.
 */
export interface RemoteUpdateConfig {
  enabled: boolean
  /** HTTP method to write the mapping (e.g., 'PUT' for pre-signed URLs, 'POST' for APIs). */
  method: 'PUT' | 'POST'
  /** Writable URL (must allow CORS from your site). Prefer the same URL used by remoteImagesConfig.url for JSON. */
  url: string
  /** Optional static headers (e.g., { "Authorization": "Bearer ..." }). Avoid secrets if your site is fully public. */
  headers?: Record<string, string>
}

/** Default write-back config is disabled. Configure if you have a writable endpoint. */
export const remoteUpdateConfig: RemoteUpdateConfig = {
  enabled: false,
  method: 'PUT',
  url: '',
  headers: undefined,
}

/** Admin edit key (optional)
 * If set to a non-empty string, the imagery editor at /imagery requires a query ?key=YOUR_KEY to unlock editing on public.
 * Leave empty to allow editing without a key (not recommended on public).
 */
export const adminEditKey = ''
