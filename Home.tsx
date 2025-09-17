/**
 * Home.tsx
 * Beautiful, content-rich landing page with clear entrances to key sections.
 * Uses Layout for site chrome and accessible, responsive Tailwind UI.
 */

import { Link } from 'react-router'
import Layout from '../components/Layout'
import { siteConfig } from '../config/site'

/**
 * HomePage
 * Presents a hero, quick navigation, and featured sections with visual imagery.
 */
export default function HomePage() {
  const features = [
    {
      title: 'Faith & Reason',
      desc: 'Essays exploring harmony between philosophy and Christian thought.',
      to: '/articles',
      src: 'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/858c3a4e-e04f-490d-8c19-0dcc55f0ffe8.png',
    },
    {
      title: 'Daily Wisdom',
      desc: 'Short reflections and meditative quotations for the day.',
      to: '/daily',
      src: 'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/b6f6f76d-3ece-4003-b2c2-7db2f74bfe02.png',
    },
    {
      title: 'Study Resources',
      desc: 'Reading guides and tools for personal and group formation.',
      to: '/resources',
      src: 'https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/166d1645-93d1-46ea-8b6c-f7e1ab81b8a0.png',
    },
  ]

  const quickLinks = [
    { name: 'Articles', to: '/articles' },
    { name: 'Topics', to: '/topics' },
    { name: 'Daily', to: '/daily' },
    { name: 'Mindfulness', to: '/mindfulness' },
    { name: 'Questions', to: '/questions' },
    { name: 'About', to: '/about' },
  ]

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                {siteConfig.name}
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground">
                {siteConfig.tagline}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/articles"
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground shadow hover:opacity-90"
                >
                  Explore Articles
                </Link>
                <Link
                  to="/topics"
                  className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                >
                  Browse Topics
                </Link>
              </div>
            </div>

            <div className="relative aspect-square w-full overflow-hidden rounded-xl border">
              <img
                src="https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/81a4db50-dd9d-428a-9300-f40323e2891c.png"
                alt="Abstract aurora artwork"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((q) => (
            <Link
              key={q.name}
              to={q.to}
              className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {q.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <Link
              to={f.to}
              key={f.title}
              className="group block overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow"
            >
              <div className="aspect-video w-full overflow-hidden">
                <img src={f.src} className="h-full w-full object-cover" alt={f.title} />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-medium">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                <span className="mt-4 inline-block text-sm font-medium text-primary group-hover:underline">
                  Open
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  )
}
