/**
 * NotFound.tsx
 * Simple 404 page for unknown routes with a clear path back home.
 */

import Layout from '../components/Layout'
import { Link } from 'react-router'

/**
 * NotFoundPage
 * Provides a friendly 404 message and a navigation recovery action.
 */
export default function NotFoundPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The page you are looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </Layout>
  )
}
