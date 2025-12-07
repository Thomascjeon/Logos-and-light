/**
 * Home.tsx
 * The landing page with hero, quote carousel, featured content, topics, and practice links.
 */

import { useMemo } from 'react'
import Layout from '../components/Layout'
import { Button } from '../components/ui/button'
import { Separator } from '../components/ui/separator'
import { ArrowRight, Compass, Heart, Wind, BookOpen } from 'lucide-react'
import QuoteCarousel from '../components/QuoteCarousel'
import ArticleCard, { Article } from '../components/ArticleCard'
import TopicCard from '../components/TopicCard'
import { Link } from 'react-router'
import { listArticlesForDate } from '../lib/articleEngine'
import DailyPreview from '../components/DailyPreview'

/**
 * HomePage
 * Composes the homepage hero, quotes, daily preview, featured articles, topics grid.
 */
export default function HomePage() {
  /**
   * Featured articles:
   * - Use generated articles for today so IDs are valid (topic-YYYYMMDD-index).
   * - This ensures per-article and per-topic image overrides apply automatically.
   */
  const featuredArticles: Article[] = useMemo(() => {
    const today = new Date()
    // Generate 1 per topic, then take the first 3 to feature.
    // listArticlesForDate returns items with correct paths (/articles/:id).
    return listArticlesForDate(today, 1).slice(0, 3)
  }, [])

  return (
    <Layout>
      {/* Hero */}
      <section className="relative">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-100/70 via-transparent to-transparent dark:from-indigo-900/20"
          aria-hidden
        />
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Where <span className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">philosophy</span> meets{' '}
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">Christian thought</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-base md:text-lg">
                Logos &amp; Light is a contemplative space for essays, reflections, and resources at the
                intersection of classical philosophy and the Christian tradition.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/articles">
                  <Button className="gap-2">
                    Read Articles
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link to="/topics">
                  <Button variant="outline" className="bg-transparent gap-2">
                    Explore Topics
                    <Compass className="size-4" />
                  </Button>
                </Link>
                <Link to="/daily">
                  <Button variant="outline" className="bg-transparent gap-2">
                    Daily Reflection
                    <Heart className="size-4" />
                  </Button>
                </Link>
                <Link to="/resources">
                  <Button variant="outline" className="bg-transparent gap-2">
                    Resources
                    <BookOpen className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <QuoteCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Daily Reflection Preview */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <h2 className="text-xl md:text-2xl font-semibold">Today’s Daily Reflection</h2>
        <Separator className="my-6" />
        <DailyPreview />
      </section>

      {/* Featured Articles */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">Featured readings</h2>
          <Link to="/articles" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <Separator className="my-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredArticles.map(a => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>

      {/* Practice & Reflection (Daily card previously removed) */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl md:text-2xl font-semibold">Practice &amp; Reflection</h2>
        <Separator className="my-6" />
        {/* With a single item, use a single-column grid for full-width presentation */}
        <div className="grid gap-5">
          <Link to="/mindfulness" className="group relative overflow-hidden rounded-xl border">
            <div className="absolute inset-0">
              <img src="https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/85a335e8-365f-4bc2-9b15-b0ce51518115.png" className="object-cover h-full w-full" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent group-hover:opacity-80 transition-opacity" />
            <div className="relative p-5 h-40 flex items-end">
              <div className="text-white drop-shadow">
                <div className="flex items-center gap-2">
                  <Wind className="size-4" />
                  <p className="font-medium">Mindfulness &amp; Christian Prayer</p>
                </div>
                <p className="text-xs text-white/90 mt-1">Attention as communion with Christ—practices and guidance.</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Topics */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl md:text-2xl font-semibold">Explore topics</h2>
        <Separator className="my-6" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <TopicCard
            title="Faith & Reason"
            imageKeyword="compass"
            to="/topics/faith-and-reason"
            topicKey="faith-and-reason"
          />
          <TopicCard
            title="Ethics"
            imageKeyword="scales"
            to="/topics?topic=ethics"
            topicKey="ethics"
          />
          <TopicCard
            title="Metaphysics"
            imageKeyword="galaxy"
            to="/topics?topic=metaphysics"
            topicKey="metaphysics"
          />
          <TopicCard
            title="Theology"
            imageKeyword="stained glass"
            to="/topics/theology"
            topicKey="theology"
          />
        </div>
      </section>
    </Layout>
  )
}
