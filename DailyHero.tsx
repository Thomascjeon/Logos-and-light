/**
 * DailyHero.tsx
 * Elegant hero banner for the Daily page with image, gradient overlay, and accessible heading.
 * Respects responsive layout and maintains strong text contrast.
 */

import React from 'react'

/**
 * DailyHeroProps
 * Props for the hero banner.
 */
export interface DailyHeroProps {
  /** Image URL for the hero banner */
  src: string
  /** Accessible alt text for the banner image */
  alt?: string
  /** Prominent heading displayed over the image */
  title?: string
  /** Optional caption under the heading */
  caption?: string
  /** Optional extra content (e.g., actions) */
  children?: React.ReactNode
}

/**
 * DailyHero
 * Renders a rounded, bordered hero with overlay text.
 */
export default function DailyHero({
  src,
  alt = 'Daily Wisdom',
  title = 'Daily Wisdom',
  caption,
  children,
}: DailyHeroProps) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl px-4 pt-6">
        <div className="overflow-hidden rounded-xl border bg-muted">
          <div className="relative aspect-[16/7] w-full">
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
              decoding="async"
              loading="eager"
            />
            {/* Gradient overlay for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
            {/* Text overlay */}
            <div className="absolute bottom-5 left-5 right-5">
              <h1 className="text-2xl md:text-4xl font-semibold text-white drop-shadow">
                {title}
              </h1>
              {caption && (
                <p className="mt-2 text-white/85 text-sm md:text-base max-w-2xl drop-shadow">
                  {caption}
                </p>
              )}
              {children && <div className="mt-3">{children}</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
