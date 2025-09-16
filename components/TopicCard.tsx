/**
 * TopicCard.tsx
 * Minimalist topic tile enhanced with an elegant icon badge and clear title.
 * Chooses a topic-appropriate icon and tone when not provided.
 */

import { Link } from 'react-router'
import type { TopicKey } from '../lib/articleEngine'
import {
  Compass,
  Scale,
  Orbit,
  Church,
  BookOpen,
  Palette,
  Landmark,
  Shield,
  FolderOpen,
} from 'lucide-react'
import IconBadge from './IconBadge'

/**
 * TopicCardProps
 * Props for rendering a topic tile.
 */
export interface TopicCardProps {
  /** Display title for the topic tile */
  title: string
  /** Optional icon to override the default topic icon */
  icon?: React.ReactNode
  /** Keyword for smart placeholder imagery (unused in minimalist version) */
  imageKeyword?: string
  /** Destination link for the tile */
  to: string
  /** Topic key used to select default icon/tone */
  topicKey?: TopicKey
}

/**
 * iconForTopic
 * Picks a lucid-react icon for the given topic key.
 */
function iconForTopic(topic?: TopicKey): JSX.Element {
  switch (topic) {
    case 'faith-and-reason':
      return <Compass />
    case 'ethics':
      return <Scale />
    case 'metaphysics':
      return <Orbit />
    case 'theology':
      return <Church />
    case 'scripture':
      return <BookOpen />
    case 'aesthetics':
      return <Palette />
    case 'history':
      return <Landmark />
    case 'apologetics':
      return <Shield />
    default:
      return <FolderOpen />
  }
}

/**
 * toneForTopic
 * Maps topic keys to an IconBadge tone for nuanced color.
 */
function toneForTopic(topic?: TopicKey):
  | 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'teal' {
  switch (topic) {
    case 'faith-and-reason':
      return 'indigo'
    case 'ethics':
      return 'sky'
    case 'metaphysics':
      return 'violet'
    case 'theology':
      return 'amber'
    case 'scripture':
      return 'emerald'
    case 'aesthetics':
      return 'rose'
    case 'history':
      return 'sky'
    case 'apologetics':
      return 'teal'
    default:
      return 'indigo'
  }
}

/**
 * TopicCard
 * Clean card with an elegant icon badge and title. No images.
 */
export default function TopicCard({
  title,
  icon,
  to,
  topicKey,
}: TopicCardProps) {
  const finalIcon = icon ?? iconForTopic(topicKey)
  const tone = toneForTopic(topicKey)

  return (
    <Link
      to={to}
      aria-label={`Open topic: ${title}`}
      className="group relative block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
    >
      {/* Subtle top accent */}
      <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400" />

      <div className="p-4 h-28 flex items-end">
        <div className="flex items-center gap-3">
          <IconBadge icon={finalIcon} tone={tone} size="md" />
          <span className="font-medium group-hover:text-foreground transition-colors">{title}</span>
        </div>
      </div>
    </Link>
  )
}
