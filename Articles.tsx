/**
 * Articles.tsx
 * Articles index with breadcrumb and today's generated readings.
 * Respects UI preferences and uses ArticleCard. Adds links to imagery and content editors.
 */

import Layout from '../components/Layout'
import Breadcrumbs from '../components/Breadcrumbs'
import ArticleCard from '../components/ArticleCard'
import { listArticlesForDate } from '../lib/articleEngine'
import { useMemo } from 'react'
import { Button } from '../components/ui/button'
import { Link } from 'react-router'

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

        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Articles</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Daily-stable readings across key topics, generated deterministically.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/imagery">
              <Button variant="outline" className="bg-transparent">Customize images</Button>
            </Link>
            <Link to="/content">
              <Button variant="outline" className="bg-transparent">Customize text</Button>
            </Link>
          </div>
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
