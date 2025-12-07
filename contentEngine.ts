/**
 * contentEngine.ts
 * Deterministic, client-side content generator for daily reflections without external APIs.
 * Generates theme-based reflections and caches them in localStorage.
 */

export type ReflectionTheme = 'mindfulness' | 'hope' | 'gratitude' | 'discernment' | 'suffering' | 'faith-reason'

/**
 * Reflection
 * Structured content for a generated daily reflection piece.
 */
export interface Reflection {
  dateISO: string
  theme: ReflectionTheme
  title: string
  scripture: { text: string; ref: string }
  quote: { text: string; author: string }
  body: string[]
  prayer: string
  questions: string[]
  tags: string[]
}

/**
 * themes
 * List of supported reflection themes for navigation and selection.
 */
export const themes: ReflectionTheme[] = [
  'mindfulness',
  'hope',
  'gratitude',
  'discernment',
  'suffering',
  'faith-reason',
]

/**
 * hash
 * Simple string hash used to derive deterministic indices from a seed.
 */
function hash(str: string): number {
  let h = 2166136261
  // FNV-1a style loop for stable hashing
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * pick
 * Picks a deterministic item from an array based on the provided index/seed.
 */
function pick<T>(arr: T[], seed: number): T {
  if (arr.length === 0) throw new Error('Cannot pick from empty array')
  return arr[seed % arr.length]
}

/**
 * scripturePool
 * Short, public-domain-friendly Scripture excerpts (KJV-like phrasing).
 */
const scripturePool: Array<{ text: string; ref: string }> = [
  { text: 'Be still, and know that I am God.', ref: 'Psalm 46:10' },
  { text: 'In quietness and in confidence shall be your strength.', ref: 'Isaiah 30:15' },
  { text: 'Pray without ceasing.', ref: '1 Thessalonians 5:17' },
  { text: 'In Him was life; and the life was the light of men.', ref: 'John 1:4' },
  { text: 'Be transformed by the renewing of your mind.', ref: 'Romans 12:2' },
  { text: 'Draw nigh to God, and he will draw nigh to you.', ref: 'James 4:8' },
]

/**
 * quotePool
 * Classical and Christian voices for contemplation.
 */
const quotePool: Array<{ text: string; author: string }> = [
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'You have made us for Yourself, and our heart is restless until it rests in You.', author: 'Augustine' },
  { text: 'Faith seeks understanding.', author: 'Anselm' },
  { text: 'All truth is God’s truth.', author: 'Arthur Holmes' },
  { text: 'He who has God and everything else has no more than he who has God only.', author: 'C. S. Lewis' },
  { text: 'What we think about when we are free to think about what we will—that is what we are or will soon become.', author: 'A. W. Tozer' },
]

/**
 * titleFragments
 * Building blocks to craft varied, theme-colored titles.
 */
const titleFragments: Record<ReflectionTheme, string[]> = {
  mindfulness: [
    'Be Still and Know',
    'Attention in the Presence of Christ',
    'Breath, Body, and Beloved',
    'Christ-centered Stillness',
  ],
  hope: ['Bright Hope in the Present', 'Anchored Expectation', 'Light at the Edge', 'Hope That Does Not Shame'],
  gratitude: ['Receiving the Day', 'Gratitude as Worship', 'Counting Gifts with God', 'Eucharistic Vision'],
  discernment: ['Hearing the Still Small Voice', 'Wisdom for the Way', 'Testing and Holding Fast', 'Walking in Light'],
  suffering: ['Meaning in the Night', 'Companion in Sorrow', 'Cross and Consolation', 'Lament and Trust'],
  'faith-reason': ['Logos and Light', 'Mind Renewed', 'Reason as Servant of Love', 'Harmony of Faith and Mind'],
}

/**
 * bodyTemplates
 * Paragraph templates with lightweight slotting for scripture/quote/theme.
 */
const bodyTemplates: string[] = [
  'Today’s reflection considers THEME as a posture of loving attention before God. In SCRIPTURE, we are invited not to escape the world but to behold God within it.',
  'Mindfulness in Christ is not emptying into nothingness, but opening to communion. As QUOTE reminds us, the examined life is ordered toward Truth Himself.',
  'Practice a gentle rhythm: inhale “Jesus,” exhale “have mercy.” Let distractions become cues for returning to Presence without judgment.',
  'Let your reason serve love. Ask: what is true here, what is good to do, and what is beautiful to behold in light of the Gospel?',
]

/**
 * prayers
 * Closing prayers that fit many themes.
 */
const prayers: string[] = [
  'Lord Jesus, quiet my restless heart and tune my attention to Your presence. Teach me to abide in love. Amen.',
  'Father, renew my mind and guide my steps. Let Your light illumine my thoughts and actions today. Amen.',
  'Holy Spirit, breathe in me a steady, gentle awareness of Your presence, and kindle hope within. Amen.',
]

/**
 * questionsPool
 * Examen-style prompts to make the reflection concrete.
 */
const questionsPool: string[] = [
  'Where did I notice God’s presence today?',
  'What stirred anxiety, and how might I bring it to prayer?',
  'What is one small act of love or truth I can offer next?',
  'How can I let my breath become a reminder to return to Christ?',
]

/**
 * makeBody
 * Fills body templates with theme, scripture, and quote references.
 */
function makeBody(
  theme: ReflectionTheme,
  scripture: { text: string; ref: string },
  quote: { text: string; author: string },
  seed: number
): string[] {
  // Replace placeholders with humanized theme and references
  return bodyTemplates.map((t) =>
    t
      .replace(/THEME/g, humanizeTheme(theme))
      .replace(/SCRIPTURE/g, `"${scripture.text}" (${scripture.ref})`)
      .replace(/QUOTE/g, `"${quote.text}" — ${quote.author}`)
  )
}

/**
 * humanizeTheme
 * Nicely formatted label for each theme.
 */
export function humanizeTheme(theme: ReflectionTheme): string {
  switch (theme) {
    case 'mindfulness':
      return 'mindfulness in Christ'
    case 'hope':
      return 'Christian hope'
    case 'gratitude':
      return 'gratitude before God'
    case 'discernment':
      return 'spiritual discernment'
    case 'suffering':
      return 'suffering with Christ'
    case 'faith-reason':
      return 'the harmony of faith and reason'
  }
}

/**
 * generateReflection
 * Deterministically builds a reflection for a given date and theme.
 */
export function generateReflection(date: Date, theme: ReflectionTheme = 'mindfulness'): Reflection {
  const dateISO = date.toISOString().slice(0, 10)
  const seed = hash(dateISO + '|' + theme)

  const scripture = pick(scripturePool, seed + 1)
  const quote = pick(quotePool, seed + 7)
  const title = pick(titleFragments[theme], seed + 13)

  const body = makeBody(theme, scripture, quote, seed)
  const prayer = pick(prayers, seed + 17)
  const questions = [
    pick(questionsPool, seed + 19),
    pick(questionsPool, seed + 23),
  ].filter((v, idx, arr) => arr.indexOf(v) === idx)

  const tags = [humanizeTheme(theme), 'daily', 'reflection']

  return {
    dateISO,
    theme,
    title,
    scripture,
    quote,
    body,
    prayer,
    questions,
    tags,
  }
}

/**
 * getStoredReflection
 * Retrieves a stored reflection from localStorage if available.
 */
function getStoredReflection(key: string): Reflection | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as Reflection
  } catch {
    return null
  }
}

/**
 * storeReflection
 * Persists a reflection in localStorage.
 */
function storeReflection(key: string, value: Reflection) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage write errors (e.g., quota)
  }
}

/**
 * getReflectionForDate
 * Returns a reflection for the date and theme, generating and caching as needed.
 */
export function getReflectionForDate(date: Date, theme: ReflectionTheme = 'mindfulness'): Reflection {
  const dateISO = date.toISOString().slice(0, 10)
  const key = `ll-reflection:${dateISO}:${theme}`
  const existing = getStoredReflection(key)
  if (existing) return existing
  const generated = generateReflection(date, theme)
  storeReflection(key, generated)
  return generated
}
