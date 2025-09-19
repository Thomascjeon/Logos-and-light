/**
 * ResourceCard.tsx
 * Reusable resource card showing icon, title, description, and a link.
 * Supports internal navigation (react-router) and external links.
 */

import React from 'react'
import { Link } from 'react-router'
import { ExternalLink } from 'lucide-react'

/**
 * Resource
 * Descriptor for a single external or internal resource item.
 */
export interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: 'Beginner' | 'Reference' | 'Reading' | 'Tools' | 'Media'
  source?: string
  icon?: React.ReactNode
}

/**
 * ResourceCardProps
 * Props for the resource card component.
 */
export interface ResourceCardProps {
  resource: Resource
}

/**
 * isInternalPath
 * Determines if a URL should be handled by the SPA router (HashRouter friendly).
 */
function isInternalPath(href: string): boolean {
  // Treat app routes as internal if starting with "/"
  return /^\/(?!\/)/.test(href)
}

/**
 * ResourceCard
 * Card with subtle border, icon, title, description, and link affordance.
 * Uses Link for internal routes; <a> for external.
 */
export default function ResourceCard({ resource }: ResourceCardProps) {
  const internal = isInternalPath(resource.url)

  const Body = (
    <div className="group block rounded-xl border bg-card p-4 transition-shadow hover:shadow-md h-full">
      <div className="flex items-start gap-3">
        {/* Icon */}
        {resource.icon ? (
          <div className="rounded-lg bg-muted p-2 text-foreground/80">{resource.icon}</div>
        ) : (
          <div className="rounded-lg bg-muted p-2">
            <ExternalLink className="size-5 text-foreground/60" />
          </div>
        )}

        {/* Textual content */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-medium">{resource.title}</h3>
            {resource.source && (
              <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground shrink-0">
                {resource.source}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{resource.description}</p>
          <div className="mt-3 text-[10px] text-foreground/60">
            {resource.category}
          </div>
        </div>
      </div>
    </div>
  )

  if (internal) {
    return (
      <Link to={resource.url} aria-label={`Open ${resource.title}`}>
        {Body}
      </Link>
    )
  }

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${resource.title} in a new tab`}
      className="no-underline"
    >
      {Body}
    </a>
  )
}
