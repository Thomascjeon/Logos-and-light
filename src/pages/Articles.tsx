/**
 * Articles.tsx
 * Articles index with breadcrumb and today's generated readings.
 * Respects UI preferences and uses ArticleCard.
 * Editor links were removed per request.
 */

import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import ArticleCard from '../components/ArticleCard'
import { listArticlesForDate } from '../lib/articleEngine'
import { useMemo } from 'react'

/**
 * ArticlesPage
 * Lists deterministic daily articles across topics.
 */
export default function ArticlesPage() {
  const today = useMemo(() => new Date(), [])
  const articles = useMemo(() => listArticlesForDate(today, 2), [today])

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Articles' }]} />

        {/* Header without editor/action buttons */}
        <div className="mt-4">
          <h1 className="text-2xl md:text-3xl font-semibold">Articles</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Fresh readings across our core topics—new each day.
          </p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map(a => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </Layout>
  )
}
