/**
 * images.ts
 * Centralized, code-level default images for topics and specific articles.
 * Also provides an optional site-wide image override that replaces every image across the app.
 *
 * Notes:
 * - Set siteWideImageOverride to a non-empty URL to force one image everywhere (topics, articles, detail pages).
 * - Local overrides (Settings → Imagery) are only available on localhost for development.
 */

import type { TopicKey } from '../lib/articleEngine'

/**
 * siteWideImageOverride
 * If set, this URL will be used for ALL images across the app (highest precedence inside the app code).
 * Leave null to disable.
 *
 * Set per user request: global image override points to the uploaded “vase” artwork.
 */
export const siteWideImageOverride: string | null =
  'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/40a7f191-0501-4b2f-9f2f-478e08a0354e.png'

/**
 * topicDefaultImages
 * Provide a default image for any topic you want to control globally.
 * Keys are TopicKey values; partial mapping is fine.
 */
export const topicDefaultImages: Partial<Record<TopicKey, string>> = {
  'faith-and-reason':
    'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/1165a6e5-d918-498f-a892-da02f7b9f33a.jpg',
  ethics:
    'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/73f2a284-a52f-4bf1-bf95-3e39633111ca.jpg',
  metaphysics:
    'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/af573bbf-31f8-442b-8503-451b73c6c684.jpg',
  theology:
    'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/a43918b1-181b-4638-b410-ab48ccf35af3.jpg',
  scripture:
    'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/e15f031d-3ed1-4ca3-8278-ad0baf2303a4.jpg',
  aesthetics:
    'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/df1cf8b6-e235-4955-8670-5f8be3b3abbb.jpg',
  history:
    'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/1fd06e00-e387-4481-8236-f43db402e908.jpg',
  apologetics:
    'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/329c538a-dc7f-4d23-9679-d5eff2ad8f2b.jpg',
}

/**
 * articleDefaultImages
 * Provide defaults for specific articles by ID. Partial mapping is fine.
 * The ID should match the article's id field used across the app.
 */
export const articleDefaultImages: Record<string, string> = {
  // Add article-specific defaults here if you want to pin an image for a single piece.
}
