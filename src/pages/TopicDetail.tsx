/**
 * TopicDetail.tsx
 * Dedicated topic page with minimalist content: icon-led hero, description, themes,
 * guiding questions, simple practices, and latest readings for the topic.
 * Enhancements: Breadcrumbs, verse-of-the-day strip, embellished section headers with IconBadge.
 */

import Layout from '../components/Layout'
import { Link, useParams } from 'react-router'
import { Separator } from '../components/ui/separator'
import { Button } from '../components/ui/button'
import IconBadge from '../components/IconBadge'
import ArticleCard from '../components/ArticleCard'
import Breadcrumbs from '../components/Breadcrumbs'
import { useMemo } from 'react'
import { listArticlesForDate, topics as topicRegistry, humanLabel } from '../lib/articleEngine'
import type { TopicKey } from '../lib/articleEngine'
import {
  Compass,
  Scale,
  Orbit,
  Church,
  BookOpen,
  Palette,
  Landmark,
  Shield,
  ArrowLeft,
  ArrowRight,
  Quote,
  Sparkles,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react'

/**
 * iconFor
 * Returns an icon element for a topic key.
 */
function iconFor(topic: TopicKey) {
  switch (topic) {
    case 'faith-and-reason':
      return <Compass />
    case 'ethics':
      return <Scale />
    case 'metaphysics':
      return <Orbit />
    case 'theology':
      return <Church />
    case 'scripture':
      return <BookOpen />
    case 'aesthetics':
      return <Palette />
    case 'history':
      return <Landmark />
    case 'apologetics':
      return <Shield />
    default:
      return <Compass />
  }
}

/**
 * toneFor
 * Provides a gentle color tone per topic for IconBadge.
 */
function toneFor(topic: TopicKey): 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'teal' {
  switch (topic) {
    case 'faith-and-reason':
      return 'indigo'
    case 'ethics':
      return 'sky'
    case 'metaphysics':
      return 'violet'
    case 'theology':
      return 'amber'
    case 'scripture':
      return 'emerald'
    case 'aesthetics':
      return 'rose'
    case 'history':
      return 'sky'
    case 'apologetics':
      return 'teal'
    default:
      return 'indigo'
  }
}

/**
 * contentFor
 * Curated descriptions, themes, questions, and practices per topic.
 */
function contentFor(topic: TopicKey) {
  const desc: Record<TopicKey, string> = {
    'faith-and-reason':
      'How faith and inquiry illuminate each other. We think with the Church, trusting that truth is unified in Christ.',
    ethics:
      'From virtue to beatitude: the shape of a life formed by grace. We learn to desire and do the good in love.',
    metaphysics:
      'Questions of being, causality, and participation. Creation as gift invites wonder and wise first principles.',
    theology:
      'Speaking rightly of God with reverence and clarity. The Cross and Trinity shape Christian understanding.',
    scripture:
      'Hearing the living Word with the Church. Reading becomes communion that reforms our minds and hearts.',
    aesthetics:
      'Beauty as a path to God. Form and radiance awaken the soul to the True and the Good.',
    history:
      'Receiving wisdom from the saints. The Spirit renews the Church in every age through faithful witnesses.',
    apologetics:
      'Giving reasons for hope with gentleness and confidence in Christ. Truth is compelling without coercion.',
  }

  const themes: Record<TopicKey, string[]> = {
    'faith-and-reason': ['Logos and love', 'Unity of truth', 'Humility of inquiry'],
    ethics: ['Virtue & habit', 'Conscience formed in grace', 'Beatitudes'],
    metaphysics: ['Being & participation', 'Contingency & Creator', 'Final causality'],
    theology: ['Trinity & unity', 'Incarnation & Cross', 'Grace & nature'],
    scripture: ['Lectio divina', 'Canon & tradition', 'Word and worship'],
    aesthetics: ['Form & radiance', 'Icon and image', 'Beauty and desire'],
    history: ['Fathers & Doctors', 'Councils & renewal', 'Witness & martyrdom'],
    apologetics: ['Hope with gentleness', 'Truth in public square', 'Reason & charity'],
  }

  const questions: Record<TopicKey, string[]> = {
    'faith-and-reason': ['How does inquiry deepen trust?', 'Where do reason and revelation meet?'],
    ethics: ['What forms character?', 'How do the Beatitudes shape choices?'],
    metaphysics: ['Why is there something rather than nothing?', 'How does creation participate in being?'],
    theology: ['What does it mean to speak of God well?', 'How does the Cross interpret everything?'],
    scripture: ['How do I hear Scripture as living Word?', 'What is the role of the Church in reading?'],
    aesthetics: ['Why does beauty move us toward truth?', 'How does art become prayer?'],
    history: ['Which witnesses speak to our moment?', 'What renewals repeat across ages?'],
    apologetics: ['How do I answer with gentleness?', 'Where is confidence rooted—in Christ or victory?'],
  }

  const practices: Record<TopicKey, string[]> = {
    'faith-and-reason': ['Journal one honest question and pray with it', 'Read a short paragraph from a Doctor of the Church'],
    ethics: ['Name one virtue to practice today', 'Reconcile intention with a small concrete act'],
    metaphysics: ['Spend five minutes in wonder outdoors', 'Trace a cause to its first principles'],
    theology: ['Pray the Creed slowly', 'Read one paragraph from a classic catechism'],
    scripture: ['Practice lectio divina (read, meditate, pray, contemplate)', 'Memorize a short verse'],
    aesthetics: ['Sit with a sacred image for two minutes', 'Create something simple and offer it to God'],
    history: ['Read a saint’s short biography', 'Name one practice from the past to recover'],
    apologetics: ['Write a gentle answer to a common question', 'Pray for someone who disagrees with you'],
  }

  return {
    description: desc[topic],
    themes: themes[topic],
    questions: questions[topic],
    practices: practices[topic],
  }
}

/**
 * verseFor
 * Provides a small verse/quote for the given topic. Picks deterministically by date.
 */
function verseFor(topic: TopicKey, date = new Date()): { text: string; ref: string } {
  const verses: Record<TopicKey, { text: string; ref: string }[]> = {
    'faith-and-reason': [
      { text: 'In your light do we see light.', ref: 'Psalm 36:9' },
      { text: 'Always be prepared to make a defense to anyone who asks you for a reason for the hope that is in you—yet with gentleness and respect.', ref: '1 Peter 3:15' },
    ],
    ethics: [
      { text: 'Blessed are the pure in heart, for they shall see God.', ref: 'Matthew 5:8' },
      { text: 'Train yourself for godliness.', ref: '1 Timothy 4:7' },
    ],
    metaphysics: [
      { text: 'In him we live and move and have our being.', ref: 'Acts 17:28' },
      { text: 'He is before all things, and in him all things hold together.', ref: 'Colossians 1:17' },
    ],
    theology: [
      { text: 'The Word became flesh and dwelt among us.', ref: 'John 1:14' },
      { text: 'Holy, holy, holy is the Lord of hosts; the whole earth is full of his glory!', ref: 'Isaiah 6:3' },
    ],
    scripture: [
      { text: 'Your word is a lamp to my feet and a light to my path.', ref: 'Psalm 119:105' },
      { text: 'All Scripture is breathed out by God and profitable for teaching.', ref: '2 Timothy 3:16' },
    ],
    aesthetics: [
      { text: 'Worship the Lord in the beauty of holiness.', ref: 'Psalm 96:9' },
      { text: 'Whatever is lovely, think about these things.', ref: 'Philippians 4:8' },
    ],
    history: [
      { text: 'Remember the days of old; consider the years of many generations.', ref: 'Deuteronomy 32:7' },
      { text: 'Since we are surrounded by so great a cloud of witnesses...', ref: 'Hebrews 12:1' },
    ],
    apologetics: [
      { text: 'We destroy arguments and every lofty opinion raised against the knowledge of God, and take every thought captive to obey Christ.', ref: '2 Corinthians 10:5' },
      { text: 'Let your speech always be gracious, seasoned with salt.', ref: 'Colossians 4:6' },
    ],
  }
  const arr = verses[topic]
  const index = (date.getDate() + date.getMonth()) % arr.length
  return arr[index]
}

/**
 * TopicDetailPage
 * Renders the topic content based on URL param and lists latest readings for that topic.
 */
export default function TopicDetailPage() {
  const params = useParams()
  const topicParam = (params.topic || '') as TopicKey
  const topicMeta = topicRegistry.find(t => t.key === topicParam)

  // Guard: invalid topic
  if (!topicMeta) {
    return (
      <Layout>
        <section className="mx-auto max-w-3xl px-4 py-10">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Topics', to: '/topics' }, { label: 'Not found' }]} />
          <p className="mt-3 text-sm text-muted-foreground">Topic not found.</p>
          <div className="mt-4">
            <Link to="/topics">
              <Button variant="outline" className="bg-transparent gap-2">
                <ArrowLeft className="size-4" />
                Back to Topics
              </Button>
            </Link>
          </div>
        </section>
      </Layout>
    )
  }

  const label = humanLabel(topicMeta.key)
  const tone = toneFor(topicMeta.key)
  const icon = iconFor(topicMeta.key)

  const { description, themes, questions, practices } = contentFor(topicMeta.key)
  const verse = verseFor(topicMeta.key)

  // Generate a small set of latest readings for this topic (deterministic for today)
  const articles = useMemo(() => {
    const today = new Date()
    // Generate 4 per topic and then filter; we only keep items whose ID starts with the topic key
    const all = listArticlesForDate(today, 4)
    return all.filter(a => a.id.startsWith(`${topicMeta.key}-`)).slice(0, 4)
  }, [topicMeta.key])

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 py-10">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: 'Topics', to: '/topics' },
            { label: label },
          ]}
        />

        {/* Header */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Header icon: no hover motion here to keep the header calm */}
            <IconBadge icon={icon} tone={tone} size="lg" hover="none" />
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold">{label}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <Link to="/topics">
            <Button variant="outline" className="bg-transparent gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </Link>
        </div>

        {/* Verse/Quote of the day strip */}
        <div className="mt-6 rounded-xl border bg-card p-4">
          <div className="flex items-start gap-3">
            <IconBadge icon={<Quote />} tone={tone} size="sm" className="shrink-0" />
            <div>
              <div className="text-sm italic text-foreground/90">“{verse.text}”</div>
              <div className="mt-1 text-xs text-muted-foreground">{verse.ref}</div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Themes and Questions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="group rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2">
              <IconBadge icon={<Sparkles />} tone={tone} size="sm" />
              <h2 className="text-base font-medium">Key themes</h2>
            </div>
            <ul className="mt-3 grid gap-2">
              {themes.map((t, i) => (
                <li key={i} className="text-sm text-foreground/80">• {t}</li>
              ))}
            </ul>
          </div>

          <div className="group rounded-xl border bg-card p-5">
            <div className="flex items-center gap-2">
              <IconBadge icon={<HelpCircle />} tone={tone} size="sm" />
              <h2 className="text-base font-medium">Guiding questions</h2>
            </div>
            <ul className="mt-3 grid gap-2">
              {questions.map((q, i) => (
                <li key={i} className="text-sm text-foreground/80">• {q}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Practices */}
        <div className="group mt-6 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2">
            <IconBadge icon={<CheckCircle2 />} tone={tone} size="sm" />
            <h2 className="text-base font-medium">Simple practices</h2>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {practices.map((p, i) => (
              <li
                key={i}
                className="rounded bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>

        <Separator className="my-6" />

        {/* Latest readings */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBadge icon={icon} tone={tone} size="sm" />
              <h2 className="text-base md:text-lg font-semibold">Latest readings</h2>
            </div>
            <Link to="/articles" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              Explore more
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map(a => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
