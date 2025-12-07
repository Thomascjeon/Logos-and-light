/**
 * Breadcrumbs.tsx
 * Lightweight breadcrumb navigation component for orientation.
 */

import { Link } from 'react-router'

/**
 * BreadcrumbItem
 * One item in the breadcrumb trail.
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string
  /** Optional link destination; omit for the current page */
  to?: string
}

/**
 * Breadcrumbs
 * Renders a small breadcrumb trail: Home > Section > Current
 */
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          return (
            <li key={idx} className="flex items-center gap-1">
              {item.to && !isLast ? (
                <Link to={item.to} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground/70">{item.label}</span>
              )}
              {!isLast && <span className="opacity-50">/</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
