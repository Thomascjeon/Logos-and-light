/**
 * ArticleCard.tsx
 * Card for listing an article with image (optional), title, excerpt, and tags.
 * Respects UI preferences (images on/off), image overrides, and content overrides.
 */

import { Link } from 'react-router'
import { Tag } from 'lucide-react'
import { useUIPrefs } from '../contexts/UIPrefsContext'
import useOverridesVersion from '../lib/useOverridesVersion'
import { getArticleImage } from '../lib/imageOverrides'
import type { TopicKey } from '../lib/articleEngine'
import ImageWithFallback from './ImageWithFallback'
import { getContentOverride } from '../lib/contentOverrides'

/**
 * Article
 * Minimal article card data shape used across lists.
 */
export type Article = {
  id: string
  title: string
  excerpt: string
  image: string
  tags: string[]
  path: string
  /** Optional topic key to allow topic-level overrides to apply to this article image. */
  topic?: TopicKey
}

/**
 * ArticleCardProps
 * Props for the article card.
 */
export interface ArticleCardProps {
  article: Article
}

/**
 * ArticleCard
 * Compact, readable card with optional image.
 */
export default function ArticleCard({ article }: ArticleCardProps) {
  const { prefs } = useUIPrefs()
  // Re-render when any type of overrides change (image/content/remote)
  useOverridesVersion()

  // Resolve image via overrides, preferring article override, then topic override if provided
  const resolvedImage = getArticleImage(article.id, article.image, article.topic)

  // Resolve textual content via content overrides
  const contentOv = getContentOverride(article.id)
  const displayTitle = contentOv?.title ?? article.title
  const displayExcerpt = contentOv?.excerpt ?? article.excerpt
  const displayTags = contentOv?.tags?.length ? contentOv.tags : article.tags

  return (
    <Link
      to={article.path}
      className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
      aria-label={`Open article: ${displayTitle}`}
    >
      {/* Media */}
      {prefs.images === 'on' && (
        <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
          <ImageWithFallback
            src={resolvedImage}
            topicKey={article.topic}
            label={displayTitle}
            alt=""
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
      )}

      {/* Body */}
      <div className="p-4">
        <h3 className="text-sm font-medium line-clamp-2 group-hover:text-foreground transition-colors">
          {displayTitle}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{displayExcerpt}</p>
        {displayTags?.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Tag className="size-3.5 text-foreground/60" />
            {displayTags.map((t, i) => (
              <span key={i} className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
