/**
 * Questions.tsx
 * A curated set of deep questions about mindfulness and Christian faith, using an accessible accordion.
 */

import * as Accordion from '@radix-ui/react-accordion'
import Layout from '../components/Layout'
import { Separator } from '../components/ui/separator'
import { HelpCircle } from 'lucide-react'

/**
 * Question
 * Represents a single FAQ-like item.
 */
interface Question {
  id: string
  q: string
  a: string
}

/**
 * questions
 * Content exploring compatibility, discernment, and Christian telos.
 */
const questions: Question[] = [
  {
    id: 'compatibility',
    q: 'Is mindfulness compatible with Christian prayer?',
    a: 'Yes, when understood as loving attention in the presence of Christ. Christian contemplation is not self-enclosure nor emptying into nothingness, but communion with the Triune God. Mindfulness practices can serve this end when oriented toward prayer and charity.',
  },
  {
    id: 'emptying',
    q: 'Do Christians “empty the mind”?',
    a: 'We release clinging thoughts to make room for God’s Word and love. The aim is not vacancy but receptivity—dieting from distractions so that we can feast on Christ. “Be still and know that I am God” (Ps 46:10).',
  },
  {
    id: 'discernment',
    q: 'How do I discern what to keep from modern mindfulness?',
    a: 'Keep gentleness, attention, and compassion. Integrate Scripture, the Name of Jesus, and the sacraments. Test ideas: do they point to truth, goodness, and beauty as revealed in Christ, and do they bear the fruit of love?',
  },
  {
    id: 'apps',
    q: 'What about secular meditation apps?',
    a: 'Use with discernment. Prefer tools that do not redefine ultimate meaning. Consider Christian practices like the Examen, Lectio Divina, or breath prayer. The measure is whether it leads you to deeper love of God and neighbor.',
  },
  {
    id: 'goal',
    q: 'What is the goal of Christian “mindfulness”?',
    a: 'Union with God in Christ, transformation by the renewal of the mind (Rom 12:2), and a life of charity. Calm is a gift, not the ultimate aim.',
  },
]

/**
 * QuestionsPage
 * Renders an accordion of questions and answers.
 */
export default function QuestionsPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-center gap-3">
          <HelpCircle className="size-5 text-primary" />
          <h1 className="text-2xl md:text-3xl font-semibold">Big Questions</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Exploring the implications of modern mindfulness for believers in Christ.
        </p>

        <Separator className="my-6" />

        <Accordion.Root type="single" collapsible className="w-full">
          {questions.map(item => (
            <Accordion.Item key={item.id} value={item.id} className="border-b">
              <Accordion.Header>
                <Accordion.Trigger className="w-full text-left px-3 py-4 hover:bg-accent transition-colors">
                  <span className="font-medium">{item.q}</span>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="px-3 pb-4 text-sm text-muted-foreground">
                {item.a}
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>
    </Layout>
  )
}
