/**
 * IconBadge.tsx
 * Elegant, reusable icon badge with subtle gradient aura and ring for minimalist emphasis.
 * Now supports optional hover micro-interactions (lift/tilt).
 */

import React, { isValidElement, cloneElement, ReactElement } from 'react'

/**
 * IconBadgeProps
 * Props for the icon badge decorator component.
 */
export interface IconBadgeProps {
  /** The lucide icon element to render inside the badge */
  icon: React.ReactNode
  /** Visual tone of the badge (controls gradients and ring colors) */
  tone?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'teal'
  /** Size of the badge and icon */
  size?: 'sm' | 'md' | 'lg'
  /** Optional extra classes for outer wrapper */
  className?: string
  /** Hover interaction style (applies when parent has .group) */
  hover?: 'none' | 'lift' | 'tilt'
}

/**
 * toneClasses
 * Maps tones to their gradient aura, ring, and background classes.
 */
const toneClasses = {
  indigo: {
    aura: 'from-indigo-500/30 via-sky-500/20 to-emerald-400/30',
    ring: 'ring-indigo-200 dark:ring-indigo-400/40',
    bg: 'bg-indigo-500/5 dark:bg-indigo-400/5',
  },
  emerald: {
    aura: 'from-emerald-500/30 via-teal-500/20 to-sky-400/30',
    ring: 'ring-emerald-200 dark:ring-emerald-400/40',
    bg: 'bg-emerald-500/5 dark:bg-emerald-400/5',
  },
  amber: {
    aura: 'from-amber-500/30 via-orange-500/20 to-rose-400/30',
    ring: 'ring-amber-200 dark:ring-amber-400/40',
    bg: 'bg-amber-500/5 dark:bg-amber-400/5',
  },
  rose: {
    aura: 'from-rose-500/30 via-pink-500/20 to-fuchsia-400/30',
    ring: 'ring-rose-200 dark:ring-rose-400/40',
    bg: 'bg-rose-500/5 dark:bg-rose-400/5',
  },
  sky: {
    aura: 'from-sky-500/30 via-cyan-500/20 to-indigo-400/30',
    ring: 'ring-sky-200 dark:ring-sky-400/40',
    bg: 'bg-sky-500/5 dark:bg-sky-400/5',
  },
  violet: {
    aura: 'from-violet-500/30 via-purple-500/20 to-indigo-400/30',
    ring: 'ring-violet-200 dark:ring-violet-400/40',
    bg: 'bg-violet-500/5 dark:bg-violet-400/5',
  },
  teal: {
    aura: 'from-teal-500/30 via-emerald-500/20 to-cyan-400/30',
    ring: 'ring-teal-200 dark:ring-teal-400/40',
    bg: 'bg-teal-500/5 dark:bg-teal-400/5',
  },
}

/**
 * sizeClasses
 * Dimensions and icon sizing for each preset.
 */
const sizeClasses = {
  sm: { outer: 'p-0.5', inner: 'p-1.5', icon: 'size-4 rounded-md', radius: 'rounded-lg' },
  md: { outer: 'p-0.5', inner: 'p-2', icon: 'size-5 rounded-md', radius: 'rounded-lg' },
  lg: { outer: 'p-1', inner: 'p-2.5', icon: 'size-6 rounded-lg', radius: 'rounded-xl' },
}

/**
 * hoverClassesFor
 * Returns micro-interaction classes for hover behavior. Requires a parent .group.
 */
function hoverClassesFor(mode: 'none' | 'lift' | 'tilt'): string {
  switch (mode) {
    case 'lift':
      return 'transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none will-change-transform'
    case 'tilt':
      return 'transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[1.5deg] motion-reduce:transition-none motion-reduce:transform-none will-change-transform'
    default:
      return ''
  }
}

/**
 * IconBadge
 * Wraps an icon with a soft aura, ring, and muted background for a refined minimal look.
 */
export default function IconBadge({
  icon,
  tone = 'indigo',
  size = 'md',
  className = '',
  hover = 'lift',
}: IconBadgeProps) {
  const toneC = toneClasses[tone]
  const sizeC = sizeClasses[size]

  /** Normalize icon sizing by cloning if possible. */
  let iconEl = icon
  if (isValidElement(icon)) {
    const el = icon as ReactElement<{ className?: string }>
    iconEl = cloneElement(el, {
      className: [sizeC.icon, 'text-foreground'].join(' '),
    })
  }

  return (
    <span
      className={[
        'relative inline-flex items-center justify-center',
        sizeC.radius,
        sizeC.outer,
        hoverClassesFor(hover),
        className,
      ].join(' ')}
      aria-hidden
    >
      {/* Aura glow */}
      <span
        className={[
          'pointer-events-none absolute inset-0',
          sizeC.radius,
          'bg-gradient-to-br',
          toneC.aura,
          'opacity-70 blur-md',
        ].join(' ')}
      />
      {/* Inner tile with ring */}
      <span
        className={[
          'relative',
          sizeC.radius,
          sizeC.inner,
          toneC.bg,
          'ring-1',
          toneC.ring,
          'shadow-sm',
          'transition-colors',
        ].join(' ')}
      >
        {iconEl}
      </span>
    </span>
  )
}
