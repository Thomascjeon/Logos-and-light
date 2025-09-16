/**
 * articleEngine.ts
 * Deterministic, client-side article generator for multiple categories (topics).
 * Produces daily-stable, topic-specific articles without external APIs and supports detail rendering by ID.
 * Assigns unique, title-aware images per article using Smart Placeholder.
 *
 * Enhancements (current):
 * - Title-aware imagery: extract significant words from the title and blend with topic keywords.
 * - Deterministic but diverse style words/colors to avoid duplicates across articles.
 * - Retains remote override precedence via imageOverrides utilities elsewhere.
 */

import type { Article as ArticleCardType } from '../components/ArticleCard'

/**
 * TopicKey
 * Supported topic keys aligning with the Topics page.
 */
export type TopicKey =
  | 'faith-and-reason'
  | 'ethics'
  | 'metaphysics'
  | 'theology'
  | 'scripture'
  | 'aesthetics'
  | 'history'
  | 'apologetics'

/**
 * TopicMeta
 * Metadata for topics: display label and image keyword for smart placeholders.
 */
interface TopicMeta {
  /** Machine key for the topic */
  key: TopicKey
  /** Human label for display */
  label: string
  /** Smart placeholder keyword (short common words; avoids "book page" look) */
  imageKeyword: string
}

/**
 * topics
 * Registry of available topics with curated non-book imagery keywords.
 */
export const topics: TopicMeta[] = [
  { key: 'faith-and-reason', label: 'Faith & Reason', imageKeyword: 'compass' },
  { key: 'ethics', label: 'Ethics', imageKeyword: 'scales' },
  { key: 'metaphysics', label: 'Metaphysics', imageKeyword: 'galaxy' },
  { key: 'theology', label: 'Theology', imageKeyword: 'stained glass' },
  { key: 'scripture', label: 'Scripture', imageKeyword: 'cross sunrise' },
  { key: 'aesthetics', label: 'Aesthetics', imageKeyword: 'statue' },
  { key: 'history', label: 'History', imageKeyword: 'ruins' },
  { key: 'apologetics', label: 'Apologetics', imageKeyword: 'shield' },
]

/**
 * hash
 * Simple FNV-1a-like hash to derive stable pseudo-random indices.
 */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * pick
 * Deterministically picks an item from an array using a numeric seed.
 */
function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

/**
 * rotate
 * Returns a rotated array based on a seed for variety.
 */
function rotate<T>(arr: T[], seed: number): T[] {
  const n = arr.length
  if (n === 0) return arr
  const offset = seed % n
  return arr.slice(offset).concat(arr.slice(0, offset))
}

/**
 * sampleDeterministic
 * Picks 'count' unique items deterministically by rotating + slicing.
 */
function sampleDeterministic<T>(arr: T[], count: number, seed: number): T[] {
  if (arr.length === 0) return []
  const rotated = rotate(arr, seed)
  if (count >= arr.length) return rotated.slice()
  return rotated.slice(0, count)
}

/**
 * titlePool
 * Topic-flavored title fragments to assemble article titles.
 */
const titlePool: Record<TopicKey, string[]> = {
  'faith-and-reason': [
    'Reason in Service of Love',
    'Logos and the Light of Faith',
    'When Inquiry Kneels',
    'Thinking with the Church',
    'Mind Renewed in Christ',
    'Truth Weds Trust',
  ],
  ethics: [
    'The Shape of the Good Life',
    'Virtue and the Beatitudes',
    'Habits of Holy Courage',
    'Mercy and Justice',
    'Formed by Love',
  ],
  metaphysics: [
    'Being, Gift, and Creator',
    'Contingency and the Necessary',
    'Light from First Principles',
    'Participation in Being',
    'Wonder Before What Is',
  ],
  theology: [
    'Knowing God in Mystery',
    'Trinity and the Life of Love',
    'The Cross at the Center',
    'Grace and Nature',
    'Speaking of God Well',
  ],
  scripture: [
    'Reading with the Saints',
    'Scripture as Living Word',
    'Hearing God Today',
    'From Text to Transformation',
    'Word that Forms Us',
  ],
  aesthetics: [
    'Beauty as a Path to God',
    'Icons of Glory',
    'Art and the Ache for Home',
    'The Radiance of Form',
    'Attention to Splendor',
  ],
  history: [
    'Lessons from the Fathers',
    'Streams of Tradition',
    'Renewal in Every Age',
    'Pilgrims and Witnesses',
    'Memory for Mission',
  ],
  apologetics: [
    'A Reason for Hope',
    'Answering with Gentleness',
    'Truth in the Public Square',
    'Confidence without Arrogance',
    'Giving the Why with Love',
  ],
}

/**
 * excerptPool
 * Short synopsis fragments per topic to craft article excerpts.
 */
const excerptPool: Record<TopicKey, string[]> = {
  'faith-and-reason': [
    'How faith and inquiry enrich one another without compromise.',
    'Why the life of the mind belongs inside discipleship.',
    'Honoring both revelation and reasoned arguments.',
    'Thinking deeply as an act of trust.',
  ],
  ethics: [
    'From habits to holiness: character shaped by grace.',
    'What the Beatitudes teach about real flourishing.',
    'Navigating moral gray with the light of Christ.',
    'Virtue as love’s steady form.',
  ],
  metaphysics: [
    'From contingency to Creator: a first-philosophy path.',
    'Seeing creation as gift and participation.',
    'How being and goodness anchor our lives.',
    'Wonder before the fact of existence.',
  ],
  theology: [
    'Entering mystery with reverence and clarity.',
    'The Cross and Resurrection as interpretive center.',
    'Grace elevates, not erases, nature.',
    'The Trinity as love’s eternal life.',
  ],
  scripture: [
    'Lectio with the Church: hearing the living Word.',
    'From text to transformation in daily life.',
    'Reading as communion, not mere information.',
    'Word that reads us back.',
  ],
  aesthetics: [
    'Beauty draws us toward the True and the Good.',
    'Seeing with new eyes: a theology of art.',
    'Why form and radiance matter to the soul.',
    'Attention trained by splendor.',
  ],
  history: [
    'Receiving the wisdom of saints and teachers.',
    'Movements of renewal across the centuries.',
    'Witnesses who show faith under pressure.',
    'Tradition as faithful memory.',
  ],
  apologetics: [
    'Giving reasons for hope with gentleness.',
    'Truth in the public square without fear.',
    'Confidence rooted in Christ, not in victory.',
    'Clarity with compassion persuades.',
  ],
}

/**
 * paragraphsByTopic
 * Topic-specific paragraph pools to avoid redundancy and add depth.
 */
const paragraphsByTopic: Record<TopicKey, string[]> = {
  'faith-and-reason': [
    'Faith and reason are not rivals but friends; each asks for the whole truth and receives it as gift.',
    'Christian inquiry kneels before revelation without abandoning clear thinking or careful argument.',
    'To love God with the mind is to let thought be purified by humility and guided by the Church’s wisdom.',
    'Reason serves love best when it seeks understanding that becomes worship.',
    'In prayer, questions become places of trust; in study, trust becomes patient inquiry.',
    'Christ, the Logos, unites what we know and whom we love.',
    'A disciple’s intellect is not neutral ground; it is soil for seeds of light.',
  ],
  ethics: [
    'Virtue is form given to love—habits trained to choose the good with joy.',
    'The Beatitudes describe a life beautiful in God’s eyes, not merely successful.',
    'Conscience matures when taught by truth, strengthened by grace, and exercised in small, concrete acts.',
    'Mercy perfects justice by fulfilling its aim: the good of the other.',
    'Freedom grows where desire is healed, not indulged.',
    'Holiness is not sterility but the fullness of love’s courage.',
  ],
  metaphysics: [
    'To ask why there is anything at all is to stand at the edge of wonder.',
    'Creation is given, not necessary; it participates in Being who is first.',
    'Causality opens onto meaning: final causes point beyond utility to purpose.',
    'Contingent things echo a more-than-contingent Source.',
    'The true, good, and beautiful are convertible because they flow from one simple act of being.',
    'First principles are not shortcuts but foundations for reverent thought.',
  ],
  theology: [
    'Theology speaks after listening; it answers revelation with careful reverence.',
    'God is not an item among items but the One in whom we live and move and have our being.',
    'The Cross reveals both the gravity of sin and the greater gravity of love.',
    'Grace heals, elevates, and perfects nature without erasing it.',
    'The Trinity is not an abstract puzzle but the living life of God shared with us.',
    'Dogma protects mystery so it can be adored rather than flattened.',
  ],
  scripture: [
    'Scripture is living Word: to read is to be addressed by God.',
    'We read with the Church so that private impressions are tested by common faith.',
    'Lectio divina forms a rhythm of hearing, responding, resting, and being sent.',
    'Meditation turns words into prayer; contemplation lets prayer ripen into quiet joy.',
    'The canon is a symphony where Christ is the theme.',
    'To memorize a verse is to carry light in the mind.',
  ],
  aesthetics: [
    'Beauty does not distract from God; it discloses Him.',
    'Form is the radiance of order; splendor invites attention made pure.',
    'Icons teach us to see; art can become prayer when offered in love.',
    'Desire learns to love the beautiful truly when healed by grace.',
    'The Church’s arts are not luxuries but language for glory.',
    'A crafted thing can tutor the heart toward patience.',
  ],
  history: [
    'The communion of saints is not nostalgia but companionship for mission.',
    'Renewal appears in every age when hearts return to the first love.',
    'Councils, creeds, and catechesis are memory serving charity.',
    'Martyrs witness that truth is worth more than comfort.',
    'Tradition carries fire, not ashes; it hands on life.',
    'History chastens our pride and enlarges our hope.',
  ],
  apologetics: [
    'Apologetics is not winning arguments but winning trust for the Truth.',
    'Give reasons, yes—but with gentleness and patience born of prayer.',
    'Public square clarity should be salted with compassion.',
    'Confidence rests in Christ’s lordship, not in our eloquence.',
    'Questions are doors, not threats, when the Church is secure in her hope.',
    'Beauty and goodness often persuade where syllogisms cannot.',
  ],
}

/**
 * practiceByTopic
 * Simple practice suggestions appended as a closing paragraph.
 */
const practiceByTopic: Record<TopicKey, string[]> = {
  'faith-and-reason': [
    'Practice: write one honest question to bring into prayer and study today.',
    'Practice: read a paragraph from a Doctor of the Church and journal one line of light.',
  ],
  ethics: [
    'Practice: choose one concrete act of mercy and do it quietly.',
    'Practice: name a virtue to practice in a small decision before noon.',
  ],
  metaphysics: [
    'Practice: spend five minutes in wonder outdoors and thank God simply.',
    'Practice: trace a cause in your day back to its purpose and offer it to God.',
  ],
  theology: [
    'Practice: pray the Creed slowly, lingering at one phrase.',
    'Practice: read one paragraph of a classic catechism and respond in prayer.',
  ],
  scripture: [
    'Practice: try lectio divina on a short psalm today.',
    'Practice: memorize one verse and repeat it at noon and evening.',
  ],
  aesthetics: [
    'Practice: sit with a sacred image for two minutes and notice one detail.',
    'Practice: create one small thing and offer it to God in gratitude.',
  ],
  history: [
    'Practice: read a short life of a saint and imitate one habit today.',
    'Practice: ask someone older in faith one question about God’s faithfulness.',
  ],
  apologetics: [
    'Practice: write a gentle, clear answer to a common question you hear.',
    'Practice: pray for someone who disagrees with you by name.',
  ],
}

/**
 * scriptureByTopic
 * Small scripture pool per topic for a mid-article reflection line.
 */
const scriptureByTopic: Record<TopicKey, Array<{ text: string; ref: string }>> = {
  'faith-and-reason': [
    { text: 'Be transformed by the renewing of your mind.', ref: 'Romans 12:2' },
    { text: 'In him was life; and the life was the light of men.', ref: 'John 1:4' },
  ],
  ethics: [
    { text: 'Blessed are the pure in heart, for they shall see God.', ref: 'Matthew 5:8' },
    {
      text: 'What does the Lord require of you but to do justice, and to love kindness, and to walk humbly?',
      ref: 'Micah 6:8',
    },
  ],
  metaphysics: [
    { text: 'In him we live and move and have our being.', ref: 'Acts 17:28' },
    { text: 'He is before all things, and in him all things hold together.', ref: 'Colossians 1:17' },
  ],
  theology: [
    { text: 'The Word became flesh and dwelt among us.', ref: 'John 1:14' },
    { text: 'Holy, holy, holy is the Lord of hosts.', ref: 'Isaiah 6:3' },
  ],
  scripture: [
    { text: 'Your word is a lamp to my feet and a light to my path.', ref: 'Psalm 119:105' },
    { text: 'All Scripture is breathed out by God and profitable for teaching.', ref: '2 Timothy 3:16' },
  ],
  aesthetics: [
    { text: 'Worship the Lord in the beauty of holiness.', ref: 'Psalm 96:9' },
    { text: 'Whatever is lovely, think about these things.', ref: 'Philippians 4:8' },
  ],
  history: [
    { text: 'Remember the days of old; consider the years of many generations.', ref: 'Deuteronomy 32:7' },
    { text: 'We are surrounded by so great a cloud of witnesses…', ref: 'Hebrews 12:1' },
  ],
  apologetics: [
    {
      text: 'Always be prepared to make a defense… yet with gentleness and respect.',
      ref: '1 Peter 3:15',
    },
    { text: 'Let your speech always be gracious, seasoned with salt.', ref: 'Colossians 4:6' },
  ],
}

/**
 * extraTags
 * Additional tags to add variety.
 */
const extraTags: Record<TopicKey, string[]> = {
  'faith-and-reason': ['reason', 'revelation', 'logos'],
  ethics: ['virtue', 'mercy', 'justice'],
  metaphysics: ['being', 'first principles', 'causality'],
  theology: ['trinity', 'incarnation', 'grace'],
  scripture: ['lectio divina', 'word', 'canon'],
  aesthetics: ['beauty', 'form', 'icon'],
  history: ['tradition', 'saints', 'renewal'],
  apologetics: ['hope', 'gentleness', 'public square'],
}

/**
 * generalConnective
 * Short connective paragraphs reused across topics for rhythm.
 */
const generalConnective: string[] = [
  'Prayer steadies inquiry so that thought becomes worship and action becomes charity.',
  'Gratitude clears vision; from gratitude we can think, choose, and love more truly.',
  'Small, faithful acts shape the soul more than rare heroic moments.',
]

/**
 * quotePool
 * Companion quotes to enrich articles.
 */
const quotePool: Array<{ text: string; author: string }> = [
  { text: 'Faith seeks understanding.', author: 'Anselm' },
  { text: 'The unexamined life is not worth living.', author: 'Socrates' },
  { text: 'You have made us for Yourself, and our heart is restless until it rests in You.', author: 'Augustine' },
  { text: 'All truth is God’s truth.', author: 'Arthur Holmes' },
  { text: 'He who has God and everything else has no more than he who has God only.', author: 'C. S. Lewis' },
]

/**
 * toDateISO
 * Normalizes Date to YYYY-MM-DD.
 */
function toDateISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * articleId
 * Creates a stable ID encoding topic, date, and index.
 */
function articleId(topic: TopicKey, dateISO: string, index: number): string {
  return `${topic}-${dateISO.replace(/-/g, '')}-${index}`
}

/**
 * humanLabel
 * Retrieves a display label for a topic key.
 */
export function humanLabel(topic: TopicKey): string {
  const meta = topics.find(t => t.key === topic)
  return meta ? meta.label : topic
}

/**
 * keywordFor
 * Returns the smart image keyword for a topic key.
 */
function keywordFor(topic: TopicKey): string {
  const meta = topics.find(t => t.key === topic)
  return meta ? meta.imageKeyword : 'abstract gradient'
}

/**
 * buildBody
 * Builds a topic-specific body using deterministic sampling, scripture, and practice.
 * The result is 4–6 paragraphs varying per article.
 */
function buildBody(topic: TopicKey, seed: number): string[] {
  // Choose core paragraphs (3–4)
  const baseCount = 3 + (seed % 2) // 3 or 4
  const core = sampleDeterministic(paragraphsByTopic[topic], baseCount, seed + 101)

  // Scripture reflection (1)
  const scr = pick(scriptureByTopic[topic], seed + 211)
  const scripturePara = `Scripture: “${scr.text}” (${scr.ref}).`

  // One connective (1)
  const connect = pick(generalConnective, seed + 307)

  // Practice (1)
  const practice = pick(practiceByTopic[topic], seed + 409)

  // Compose with slight order variation; keep paragraphs simple and readable
  const paras: string[] = []
  core.forEach(p => paras.push(p))
  paras.push(connect)
  paras.push(scripturePara)
  paras.push(practice)

  return paras
}

/**
 * parseArticleId
 * Parses an article ID back to its components or returns null if invalid.
 */
function parseArticleId(id: string): { topic: TopicKey; dateISO: string; index: number } | null {
  const m = id.match(/^([a-z-]+)-(\d{8})-(\d+)$/)
  if (!m) return null
  const topic = m[1] as TopicKey
  if (!topics.some(t => t.key === topic)) return null
  const y = m[2].slice(0, 4)
  const mo = m[2].slice(4, 6)
  const d = m[2].slice(6, 8)
  const dateISO = `${y}-${mo}-${d}`
  const index = parseInt(m[3], 10)
  return { topic, dateISO, index }
}

/**
 * extractKeywords
 * Extracts up to 2 significant, lowercase words from a title (ignores stopwords/punctuation).
 */
function extractKeywords(title: string, seed: number): string[] {
  const stop = new Set([
    'the','and','of','in','a','an','to','with','for','on','by','at','from','as','is','are','be','or','that','this','it','into','over','under','before','after','our','your','their',
  ])
  const words = title
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !stop.has(w))

  if (words.length === 0) return []
  const unique = Array.from(new Set(words))
  return sampleDeterministic(unique, Math.min(2, unique.length), seed)
}

/**
 * buildImageQuery
 * Builds a Smart Placeholder query using title keywords + topic keyword + seeded style words.
 * The selection is deterministic per article ID to avoid duplicates while remaining elegant.
 */
function buildImageQuery(topic: TopicKey, title: string, seed: number): string {
  const topicKw = keywordFor(topic)

  // Expanded style vocabulary tuned to site palette and aesthetics
  const styleWords = [
    'glass','geometry','grid','lattice','lines','prism','halo','bokeh','gradient','marble','stone','arch','pillar','symmetric',
    'minimal','abstract','studio','soft light','long exposure','ray','tessellation','vortex','spiral','silhouette','texture',
    'mesh','weave','ring','wave','hexagon','pattern','light rays','silver','mirror','refraction','glow','cathedral light',
  ]
  const palette = ['indigo','teal','violet','amber','azure','slate','silver','ivory','charcoal','emerald','rose','sky','cyan']

  // Derive title terms and seed-based style mixture
  const titleTerms = extractKeywords(title, seed + 1)
  const w1 = pick(styleWords, seed + 17)
  const w2 = pick(rotate(styleWords, seed + 31), seed + 5)
  const w3 = pick(rotate(styleWords, seed + 47), seed + 23)
  const w4 = pick(rotate(styleWords, seed + 59), seed + 37)
  const color1 = pick(palette, seed + 71)
  const color2 = pick(rotate(palette, seed + 83), seed + 19)

  // Compose final query; Smart Placeholder accepts spaces without encoding
  const parts = [...titleTerms, topicKw, w1, w2, w3, w4, color1, color2]
  return parts.join(' ')
}

/**
 * generateArticleCore
 * Internal builder for a single article object given topic, date, and index.
 * Adds deterministic image variety using a topic keyword plus seeded style words and title terms.
 */
function generateArticleCore(
  topic: TopicKey,
  dateISO: string,
  index: number
): {
  id: string
  title: string
  excerpt: string
  image: string
  tags: string[]
  body: string[]
  quote: { text: string; author: string }
  topic: TopicKey
  dateISO: string
} {
  const seedBase = hash(`${topic}|${dateISO}|${index}`)
  const id = articleId(topic, dateISO, index)

  // Title & excerpt
  const title = pick(titlePool[topic], seedBase + 3)
  const excerpt = pick(excerptPool[topic], seedBase + 7)

  // Quote & body
  const quote = pick(quotePool, seedBase + 11)
  const body = buildBody(topic, seedBase + 13)

  /**
   * Title-aware, deterministic Smart Placeholder query.
   * Example: "Reason Love compass geometry marble soft light indigo sky"
   */
  const query = buildImageQuery(topic, title, seedBase + 19)
  const image = `https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/ab6ea90d-af37-40dd-879c-6732198db0be.jpg`

  // Tags for quick scanning
  const extra = pick(extraTags[topic], seedBase + 29)
  const tags = [humanLabel(topic), 'daily', extra]

  return {
    id,
    title,
    excerpt,
    image,
    tags,
    body,
    quote,
    topic,
    dateISO,
  }
}

/**
 * listArticlesForDate
 * Generates a list of articles across all topics for the given date.
 */
export function listArticlesForDate(date: Date, perTopic: number = 2): ArticleCardType[] {
  const dateISO = toDateISO(date)
  const items: ArticleCardType[] = []
  topics.forEach(t => {
    for (let i = 1; i <= perTopic; i++) {
      const core = generateArticleCore(t.key, dateISO, i)
      items.push({
        id: core.id,
        title: core.title,
        excerpt: core.excerpt,
        image: core.image,
        tags: core.tags,
        path: `/articles/${core.id}`,
        // Provide topic so ArticleCard can apply topic-level overrides
        topic: core.topic,
      })
    }
  })
  return items
}

/**
 * guessTopicFromSlug
 * Attempts to guess the topic from a non-dated slug (e.g., "faith-and-reason-primer").
 */
function guessTopicFromSlug(slug: string): TopicKey | undefined {
  const lower = slug.toLowerCase()
  const match = topics.find(t => lower.includes(t.key))
  return match?.key
}

/**
 * buildPrimerBody
 * Builds a "Primer" body for a topic with a short intro, core points, scripture, and practice.
 */
function buildPrimerBody(topic: TopicKey, seed = 0): string[] {
  const intro = `A short primer on ${humanLabel(topic)}: key ideas, a scripture to ponder, and one simple practice to begin.`
  const core = sampleDeterministic(paragraphsByTopic[topic], 3, seed + 1)
  const scr = pick(scriptureByTopic[topic], seed + 2)
  const scripturePara = `Scripture to ponder: “${scr.text}” (${scr.ref}).`
  const practice = pick(practiceByTopic[topic], seed + 3)
  return [intro, ...core, scripturePara, practice]
}

/**
 * getArticleDetailById
 * Reconstructs a full article object by ID (deterministic).
 * Also provides a graceful fallback for non-dated slugs (e.g., "<topic>-primer") so pages are never empty.
 */
export function getArticleDetailById(
  id: string
): (ReturnType<typeof generateArticleCore>) | null {
  const parsed = parseArticleId(id)
  if (parsed) {
    const { topic, dateISO, index } = parsed
    return generateArticleCore(topic, dateISO, index)
  }

  // Fallback path: if ID isn't in dated format, try to infer topic and build a primer-like article.
  const topicGuess = guessTopicFromSlug(id)
  if (topicGuess) {
    const todayISO = toDateISO(new Date())
    const seed = hash(id + '|' + todayISO)
    const base = generateArticleCore(topicGuess, todayISO, 1)

    const isPrimer = /(^|[-_])primer($|[-_])/i.test(id)
    const body = isPrimer ? buildPrimerBody(topicGuess, seed) : buildBody(topicGuess, seed)
    const title = isPrimer ? `${humanLabel(topicGuess)} Primer` : base.title
    const excerpt = isPrimer
      ? `A concise primer on ${humanLabel(topicGuess)}—themes, Scripture, and one simple practice to start.`
      : base.excerpt

    // Rebuild a title-aware image for the new title to keep imagery aligned with the fallback content.
    const image = `https://pub-cdn.sider.ai/u/U0AWH6J28LO/web-coder/6896d87314f019f2a83e5a14/resource/24eb1c6b-ca6a-40e9-b18f-114f22829fd8.jpg`

    return {
      ...base,
      id,
      title,
      excerpt,
      image,
      body,
    }
  }

  // Unknown and not inferable
  return null
}
