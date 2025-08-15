/**
 * ArticleDetail.tsx
 * Detailed article view with breadcrumb, optional hero image, body, and quote.
 * Respects UI preferences, image overrides, and content overrides.
 */

import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import { Link, useParams } from 'react-router'
import { Button } from '../components/ui/button'
import { ArrowLeft, Quote } from 'lucide-react'
import { getArticleDetailById, humanLabel } from '../lib/articleEngine'
import { getArticleImage } from '../lib/imageOverrides'
import useOverridesVersion from '../lib/useOverridesVersion'
import { useUIPrefs } from '../contexts/UIPrefsContext'
import ImageWithFallback from '../components/ImageWithFallback'
import { getContentOverride } from '../lib/contentOverrides'

/**
 * ArticleDetailPage
 * Renders an article by ID or a not-found state.
 */
export default function ArticleDetailPage() {
  const params = useParams()
  const id = params.id || ''
  const core = id ? getArticleDetailById(id) : null
  const { prefs } = useUIPrefs()
  useOverridesVersion()

  if (!core) {
    return (
      <Layout>
        <section className="mx-auto max-w-3xl px-4 py-10">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Articles', to: '/articles' }, { label: 'Not found' }]} />
          <p className="mt-3 text-sm text-muted-foreground">The article you’re looking for was not found.</p>
          <div className="mt-4">
            <Link to="/articles">
              <Button variant="outline" className="bg-transparent gap-2">
                <ArrowLeft className="size-4" />
                Back to Articles
              </Button>
            </Link>
          </div>
        </section>
      </Layout>
    )
  }

  // Apply content overrides if present
  const ov = getContentOverride(core.id)
  const displayTitle = ov?.title ?? core.title
  const displayExcerpt = ov?.excerpt ?? core.excerpt
  const displayBody = ov?.body && ov.body.length ? ov.body : core.body
  const displayQuote = ov?.quote ?? core.quote

  const label = humanLabel(core.topic)
  const resolvedImage = getArticleImage(core.id, core.image, core.topic)

  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 py-8 md:py-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Articles', to: '/articles' }, { label }]} />

        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">{displayTitle}</h1>
            <p className="mt-2 text-muted-foreground text-sm">{displayExcerpt}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/articles">
              <Button variant="outline" className="bg-transparent gap-2">
                <ArrowLeft className="size-4" />
                Back
              </Button>
            </Link>
            <Link to={`/imagery?article=${core.id}`}>
              <Button variant="outline" className="bg-transparent">Customize image</Button>
            </Link>
            <Link to={`/content?article=${core.id}`}>
              <Button variant="outline" className="bg-transparent">Edit text</Button>
            </Link>
          </div>
        </div>

        {prefs.images === 'on' && (
          <div className="mt-6 overflow-hidden rounded-xl border bg-muted">
            <ImageWithFallback
              src={resolvedImage}
              topicKey={core.topic}
              label={displayTitle}
              alt=""
              className="object-cover w-full h-full max-h-[360px]"
            />
          </div>
        )}

        <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <div className="mt-6 grid gap-4">
            {displayBody.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>

        {/* Quote block */}
        <div className="mt-8 rounded-xl border bg-card p-4">
          <div className="flex items-start gap-3">
            <Quote className="size-4 text-foreground/70" />
            <div>
              <div className="text-sm italic text-foreground/90">“{displayQuote.text}”</div>
              <div className="mt-1 text-xs text-muted-foreground">— {displayQuote.author}</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
