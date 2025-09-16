/**
 * Topics.tsx
 * Topic overview grid, optionally responding to a query param for focus.
 * Removed stray "Customize images" button per request (route no longer exists).
 */

import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import TopicCard from '../components/TopicCard'
import { useLocation } from 'react-router'
import { Separator } from '../components/ui/separator'

/**
 * parseQuery
 * Utility to parse the hash URL query string for topic focusing.
 */
function parseQuery(search: string) {
  const params = new URLSearchParams(search.replace(/^\?/, ''))
  return {
    topic: params.get('topic') ?? '',
  }
}

/**
 * TopicsPage
 * Displays topic tiles; highlights a focused topic if present in query params.
 */
export default function TopicsPage() {
  const location = useLocation()
  const { topic } = useMemo(() => parseQuery(location.search), [location.search])
  const [focus, setFocus] = useState<string>('')

  /** Syncs the focused topic from URL query into local state for UI emphasis. */
  useEffect(() => {
    setFocus(topic)
  }, [topic])

  /**
   * Curated keywords chosen to avoid "book page" visuals and increase diversity.
   * - Faith & Reason: compass (inquiry/direction)
   * - Ethics: scales (justice/balance)
   * - Metaphysics: galaxy (cosmos/being)
   * - Theology: stained glass (church/art/meaning)
   * - Scripture: cross sunrise (revelation/new day)
   * - Aesthetics: statue (form/beauty)
   * - History: ruins (antiquity/memory)
   * - Apologetics: lion (courage/strength)
   */
  const topics = [
    { title: 'Faith & Reason', keyword: 'compass', key: 'faith-and-reason' },
    { title: 'Ethics', keyword: 'scales', key: 'ethics' },
    { title: 'Metaphysics', keyword: 'galaxy', key: 'metaphysics' },
    { title: 'Theology', keyword: 'stained glass', key: 'theology' },
    { title: 'Scripture', keyword: 'cross sunrise', key: 'scripture' },
    { title: 'Aesthetics', keyword: 'statue', key: 'aesthetics' },
    { title: 'History', keyword: 'ruins', key: 'history' },
    { title: 'Apologetics', keyword: 'lion', key: 'apologetics' },
  ]

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Topics</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Browse key areas where philosophical questions and Christian wisdom converge.
          </p>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map(t => (
            <div key={t.key} className={focus === t.key ? 'ring-2 ring-primary rounded-xl' : ''}>
              <TopicCard
                title={t.title}
                imageKeyword={t.keyword}
                to={`/topics/${t.key}`}
                topicKey={t.key as any}
              />
            </div>
          ))}
        </div>
      </section>
    </Layout>
  )
}
