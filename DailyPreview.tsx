/**
 * DailyPreview.tsx
 * Compact preview card for today's Daily Reflection, showing key highlights and a link to the full page.
 */

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Link } from 'react-router'
import { CalendarDays, BookOpen, Tag } from 'lucide-react'
import { getReflectionForDate, humanizeTheme, type ReflectionTheme } from '../lib/contentEngine'

/**
 * DailyPreviewProps
 * Props to control the preview behavior.
 */
export interface DailyPreviewProps {
  /** Optional theme for the reflection; defaults to 'mindfulness' */
  theme?: ReflectionTheme
  /** Show the companion quote line; defaults to true */
  showQuote?: boolean
}

/**
 * DailyPreview
 * Renders a concise snapshot of today's reflection with scripture, short excerpt, tags, and CTA.
 */
export default function DailyPreview({ theme = 'mindfulness', showQuote = true }: DailyPreviewProps) {
  const today = useMemo(() => new Date(), [])
  const reflection = useMemo(() => getReflectionForDate(today, theme), [today, theme])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-primary" />
          <CardTitle className="text-xl">Today’s Daily Reflection</CardTitle>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {reflection.dateISO} • {humanizeTheme(reflection.theme)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-7">
        <div>
          <p className="font-medium">Title</p>
          <p className="text-foreground">{reflection.title}</p>
        </div>

        <div>
          <p className="font-medium">Scripture</p>
          <p className="text-muted-foreground">“{reflection.scripture.text}” — {reflection.scripture.ref}</p>
        </div>

        {showQuote && (
          <div>
            <p className="font-medium">Companion Quote</p>
            <p className="text-muted-foreground">“{reflection.quote.text}” — {reflection.quote.author}</p>
          </div>
        )}

        <Separator />

        {/* Show a short excerpt from the body */}
        <div>
          <p className="font-medium">Reflection</p>
          <p className="text-muted-foreground line-clamp-3">{reflection.body[0]}</p>
        </div>

        {/* Tags */}
        {reflection.tags?.length > 0 && (
          <div className="pt-1 flex flex-wrap gap-2 items-center">
            <Tag className="size-3.5 text-foreground/60" />
            {reflection.tags.map((tag) => (
              <span key={tag} className="text-[10px] rounded bg-muted px-2 py-0.5 text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          <Link to="/daily">
            <Button className="gap-2">
              <BookOpen className="size-4" />
              Read the full reflection
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
