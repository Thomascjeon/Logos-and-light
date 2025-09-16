/**
 * About.tsx
 * Renders the About page with authorial voice and project mission, using content provided by the owner.
 * Uses Layout for consistent site chrome and shadcn Separator for clean section breaks.
 */

import Layout from '../components/Layout'
import { Separator } from '../components/ui/separator'
import { siteConfig, getContactMailto } from '../config/site'

/**
 * AboutPage
 * Presents the vision, approach, and offerings of Logos & Light, plus contributor invitation.
 */
export default function AboutPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 py-12">
        {/* Page title */}
        <h1 className="text-2xl md:text-3xl font-semibold">About {siteConfig.name}</h1>

        {/* Intro section in readable prose */}
        <div className="prose prose-neutral dark:prose-invert mt-4 max-w-none">
          <p>
            Welcome to {siteConfig.name} — a space where reason and reverence, intellect and imagination, converge.
          </p>
          <p>
            This project began as a quiet response to a deep personal need: to wrestle honestly with questions of meaning,
            to seek harmony rather than polarization between faith and reason, and to anchor my professional and personal life
            in a vision of the Good, the True, and the Beautiful.
          </p>
          <p>
            My name is Thomas — I’m a physician in training, deeply engaged in the scientific and clinical worlds, yet equally
            formed by classical philosophy, theology, and a contemplative tradition. Alongside medical texts, you’ll often find
            me reading Church Fathers, Catholic mystics, and postmodern poets. This space emerged as an effort to integrate these strands —
            not to resolve every tension, but to walk attentively within them.
          </p>
        </div>

        <Separator className="my-10" />

        {/* Our Approach */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Our Approach</h2>
          <ul>
            <li>
              <strong>Harmony over rivalry.</strong>{' '}
              We explore how reason and faith illuminate one another, drawing from both the analytic clarity of philosophy
              and the symbolic depth of tradition.
            </li>
            <li>
              <strong>Sources and tradition.</strong>{' '}
              From Scripture and the Church Fathers to Aquinas, Kierkegaard, and contemporary voices — the library is wide but rooted.
            </li>
            <li>
              <strong>Beauty and truth.</strong>{' '}
              Aesthetic experience — art, music, poetry, silence — is not peripheral but essential to contemplation and insight.
            </li>
          </ul>
        </div>

        <Separator className="my-10" />

        {/* What You'll Find */}
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>What You’ll Find Here</h2>
          <ul>
            <li>
              <strong>Essays &amp; Reading Guides.</strong>{' '}
              Thoughtful explorations across Faith &amp; Reason, Ethics, Metaphysics, and Theology — with special attention
              to perennial questions and spiritual formation.
            </li>
            <li>
              <strong>Reflections &amp; Meditative Quotations.</strong>{' '}
              Short form writings and curated excerpts designed for inner stillness and spiritual anchoring.
            </li>
            <li>
              <strong>Resources for Study &amp; Formation.</strong>{' '}
              Tools for small groups, reading companions, and solo study — all meant to foster conversation and inner growth.
            </li>
          </ul>
        </div>

        <Separator className="my-10" />

        {/* Contribute callout */}
        <div
          className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
          role="region"
          aria-label="Contribute"
        >
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <h2>Contribute</h2>
            <p>
              Do you feel called to write, reflect, or suggest a topic? Whether you’re a student, seeker, scholar, or pilgrim — your voice may belong here.
            </p>
            <p className="mt-4">
              Reach out:{' '}
              <a
                className="underline"
                href={getContactMailto(`Inquiry for ${siteConfig.name}`)}
              >
                {siteConfig.contactEmail}
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  )
}
