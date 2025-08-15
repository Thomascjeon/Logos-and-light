/**
 * QuoteCarousel.tsx
 * Auto-advancing cross-fade quote carousel for Scripture and philosophy excerpts.
 */

import { useEffect, useMemo, useState } from 'react'

/**
 * Quote
 * Represents a single quote with attribution and category.
 */
export interface Quote {
  text: string
  author: string
  source?: string
  kind: 'Scripture' | 'Philosophy'
}

/**
 * QuoteCarouselProps
 * Props to provide quotes and optional auto-advance timing.
 */
export interface QuoteCarouselProps {
  quotes?: Quote[]
  intervalMs?: number
}

/**
 * QuoteCarousel
 * Simple opacity crossfade between quotes with auto-advance.
 */
export default function QuoteCarousel({ quotes, intervalMs = 6000 }: QuoteCarouselProps) {
  const items = useMemo<Quote[]>(
    () =>
      quotes ?? [
        { text: 'In the beginning was the Word, and the Word was with God, and the Word was God.', author: 'John', source: 'John 1:1', kind: 'Scripture' },
        { text: 'The unexamined life is not worth living.', author: 'Socrates', kind: 'Philosophy' },
        { text: 'You have made us for yourself, O Lord, and our heart is restless until it rests in you.', author: 'Augustine', source: 'Confessions', kind: 'Philosophy' },
        { text: 'Faith seeks understanding.', author: 'Anselm', kind: 'Philosophy' },
        { text: 'Be transformed by the renewal of your mind.', author: 'Paul', source: 'Romans 12:2', kind: 'Scripture' },
      ],
    [quotes]
  )

  const [index, setIndex] = useState(0)

  /** Auto-advance logic that cycles through the quotes. */
  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % items.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [items.length, intervalMs])

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-6 md:p-8">
      {items.map((q, i) => {
        const active = i === index
        return (
          <figure
            key={i}
            className={[
              'absolute inset-0 flex flex-col items-center justify-center text-center p-6 transition-opacity duration-700',
              active ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            aria-hidden={!active}
          >
            <blockquote className="text-lg md:text-xl font-medium leading-relaxed">
              “{q.text}”
            </blockquote>
            <figcaption className="mt-3 text-sm text-muted-foreground">
              — {q.author}{q.source ? `, ${q.source}` : ''} · {q.kind}
            </figcaption>
          </figure>
        )
      })}
      {/* Simple dot indicators */}
      <div className="relative mt-44 md:mt-36 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            className={[
              'size-2 rounded-full',
              i === index ? 'bg-primary' : 'bg-muted',
            ].join(' ')}
            onClick={() => setIndex(i)}
            aria-label={`Go to quote ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
