/**
 * About.tsx
 * About page describing the project mission and approach. Uses siteConfig for contact email.
 */

import Layout from '../components/Layout'
import { Separator } from '../components/ui/separator'
import { siteConfig, getContactMailto } from '../config/site'

/**
 * AboutPage
 * Provides a concise mission statement and editorial approach.
 */
export default function AboutPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold">About {siteConfig.name}</h1>
        <p className="mt-4 text-muted-foreground">
          {siteConfig.name} curates reflections where the great questions of philosophy meet the wisdom of Christian tradition.
          We value clarity, charity, and contemplative depth.
        </p>

        <Separator className="my-8" />

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Our Approach</h2>
          <ul>
            <li><strong>Harmony over rivalry:</strong> We explore how reason and faith illuminate each other.</li>
            <li><strong>Sources and tradition:</strong> From Scripture and Church Fathers to classical and modern philosophers.</li>
            <li><strong>Beauty and truth:</strong> Aesthetic experience as a path to contemplation.</li>
          </ul>

          <h2>What You Will Find</h2>
          <ul>
            <li>Essays and reading guides spanning Faith &amp; Reason, Ethics, Metaphysics, and Theology.</li>
            <li>Short reflections and curated quotations for meditation.</li>
            <li>Resources for study groups and personal formation.</li>
          </ul>

          <h2>Contribute</h2>
          <p>
            Interested in contributing an essay or proposing a topic? Reach out via email:
            <a className="ml-1 underline" href={getContactMailto(`Inquiry for ${siteConfig.name}`)}>
              {siteConfig.contactEmail}
            </a>.
          </p>
        </div>
      </section>
    </Layout>
  )
}
