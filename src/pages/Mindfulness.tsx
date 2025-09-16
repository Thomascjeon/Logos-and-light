/**
 * Mindfulness.tsx
 * A guide connecting modern mindfulness with Christian contemplation and practice.
 */

import Layout from '../components/Layout'
import { Separator } from '../components/ui/separator'
import { Button } from '../components/ui/button'
import { Link } from 'react-router'
import { BookOpen, Heart, Wind } from 'lucide-react'

/**
 * MindfulnessPage
 * Explains alignments, distinctions, and offers practical Christ-centered practices.
 */
export default function MindfulnessPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center gap-3">
          <Wind className="size-5 text-primary" />
          <h1 className="text-2xl md:text-3xl font-semibold">Mindfulness &amp; Christian Prayer</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Mindfulness names a steady, non-judgmental attention to the present. As Christians, we practice this as
          loving attention to the presence of Christ—communion, not emptiness.
        </p>

        <Separator className="my-6" />

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Shared Ground</h2>
          <ul>
            <li>Attention and gentleness toward thoughts and feelings.</li>
            <li>Embodied awareness: breath, posture, and presence.</li>
            <li>Compassion and patience cultivated over time.</li>
          </ul>

          <h2>Crucial Differences</h2>
          <ul>
            <li><strong>Telos (Goal):</strong> Not merely calm or insight, but union with God in love.</li>
            <li><strong>Presence:</strong> Not empty awareness, but receptive communion with the Living God.</li>
            <li><strong>Discernment:</strong> We test and order our thoughts toward truth, goodness, and beauty.</li>
          </ul>

          <h2>Practices to Try</h2>
          <ol>
            <li><strong>Breath Prayer:</strong> Inhale “Jesus,” exhale “have mercy.” Let distractions become a cue to return.</li>
            <li><strong>Lectio Divina:</strong> Slowly read a short Scripture, listen, respond, rest.</li>
            <li><strong>The Examen:</strong> Review the day with gratitude, notice consolations and desolations, ask for grace.</li>
          </ol>

          <h2>Suggested Reading</h2>
          <ul>
            <li><a href="https://en.wikipedia.org/wiki/Jesus_Prayer" target="_blank" rel="noreferrer">The Jesus Prayer</a></li>
            <li><a href="https://en.wikipedia.org/wiki/Lectio_Divina" target="_blank" rel="noreferrer">Lectio Divina</a></li>
            <li><a href="https://en.wikipedia.org/wiki/Ignatian_spirituality" target="_blank" rel="noreferrer">Ignatian Spirituality &amp; Examen</a></li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link to="/daily">
            <Button className="gap-2">
              <Heart className="size-4" />
              Start a Daily Reflection
            </Button>
          </Link>
          <Link to="/questions">
            <Button variant="outline" className="bg-transparent gap-2">
              <BookOpen className="size-4" />
              Big Questions
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  )
}
