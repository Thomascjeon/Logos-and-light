/**
 * Home.tsx
 * Public landing page with a simple hero and quick links.
 * Image strip removed per request to keep the page clean and focused.
 */

import { Link } from 'react-router'
import { BookOpen, Layers, Calendar, Info } from 'lucide-react'
import React from 'react'

/**
 * Home
 * Provides clear entrances to the main sections and a welcoming hero.
 */
export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="px-6 md:px-8 lg:px-12">
        <Hero />
        <QuickLinks />
        {/* ImageStrip removed as requested */}
      </section>
    </main>
  )
}

/**
 * Hero
 * Compact hero with brand headline and primary calls-to-action.
 */
function Hero(): JSX.Element {
  return (
    <div className="mx-auto max-w-4xl py-16 text-center">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
        Logos & Light
      </h1>
      <p className="mt-4 text-muted-foreground md:text-lg">
        Essays where reason meets faith — slow thinking, enduring questions, and practices for a luminous life.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to="/articles"
          className="inline-flex items-center rounded-md bg-foreground px-4 py-2 text-background hover:opacity-90 transition"
          aria-label="Go to Articles"
        >
          <BookOpen className="mr-2 h-4 w-4" />
          Articles
        </Link>
        <Link
          to="/topics"
          className="inline-flex items-center rounded-md border border-border px-4 py-2 hover:bg-muted transition"
          aria-label="Browse Topics"
        >
          <Layers className="mr-2 h-4 w-4" />
          Topics
        </Link>
      </div>
    </div>
  )
}

/**
 * QuickLinks
 * Grid of small, high-contrast cards that direct to key areas of the site.
 */
function QuickLinks(): JSX.Element {
  const items = [
    {
      icon: <BookOpen className="h-5 w-5" aria-hidden="true" />,
      title: 'Latest Articles',
      desc: 'Long-form essays where reason and faith interrogate one another—with sources and practice.',
      to: '/articles',
    },
    {
      icon: <Layers className="h-5 w-5" aria-hidden="true" />,
      title: 'Explore Topics',
      desc: 'Curated pathways across ethics, metaphysics, theology, and more.',
      to: '/topics',
    },
    {
      icon: <Calendar className="h-5 w-5" aria-hidden="true" />,
      title: 'Daily',
      desc: 'A brief, prayerful exercise: Scripture, a companion line, and questions to carry into the day.',
      to: '/daily',
    },
    {
      icon: <Info className="h-5 w-5" aria-hidden="true" />,
      title: 'About',
      desc: 'The vision that animates the work—and how you can take part.',
      to: '/about',
    },
  ] as const

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it) => (
        <Link
          key={it.title}
          to={it.to}
          className="group rounded-lg border border-border p-4 hover:bg-muted transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={it.title}
        >
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-muted p-2 text-foreground/90">
              {it.icon}
            </div>
            <div>
              <h3 className="font-semibold">{it.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{it.desc}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
