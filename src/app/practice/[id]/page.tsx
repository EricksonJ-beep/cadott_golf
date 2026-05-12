import { getPracticePlan } from '@/app/actions/practice'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Props = { params: Promise<{ id: string }> }

type PlanBlock = {
  id: number
  blockName: string
  startMinute: number
  durationMinutes: number
  drillDescription: string | null
  orderIndex: number
}

// ── Badge parsing ─────────────────────────────────────────────────────────────

type ParsedBadge = { type: 'challenge' | 'balls' | 'log'; label: string }

function parseBadges(blockName: string, description: string): { text: string; badges: ParsedBadge[] } {
  const badges: ParsedBadge[] = []
  let text = description

  // [Challenge: ...] marker (explicit)
  text = text.replace(/\[Challenge:\s*([^\]]+)\]/g, (_, label) => {
    badges.push({ type: 'challenge', label: label.trim() })
    return ''
  })

  // [Log: ...] marker (explicit)
  text = text.replace(/\[Log:\s*([^\]]+)\]/g, (_, label) => {
    badges.push({ type: 'log', label: label.trim() })
    return ''
  })

  // Block name contains "Challenge" → implicit challenge badge
  if (/challenge/i.test(blockName) && !badges.some((b) => b.type === 'challenge')) {
    badges.push({ type: 'challenge', label: 'Challenge — log your result' })
  }

  // Description starts with "N balls" → balls badge
  const ballsMatch = text.match(/^(\d+)\s+balls?\b/i)
  if (ballsMatch) {
    badges.push({ type: 'balls', label: `${ballsMatch[1]} balls` })
  }

  return { text: text.trim(), badges }
}

// ── Section grouping ──────────────────────────────────────────────────────────

type Section = { sectionIndex: number; blocks: PlanBlock[] }

function groupIntoSections(blocks: PlanBlock[], totalDurationMinutes: number): Section[] {
  const third = totalDurationMinutes / 3
  const sections: Section[] = []
  for (const block of blocks) {
    const sectionIndex = Math.min(2, Math.floor(block.startMinute / third))
    const last = sections[sections.length - 1]
    if (!last || last.sectionIndex !== sectionIndex) {
      sections.push({ sectionIndex, blocks: [block] })
    } else {
      last.blocks.push(block)
    }
  }
  return sections
}

// ── Color palettes ────────────────────────────────────────────────────────────

const SECTION_STYLES = [
  {
    header: 'bg-[#E6F1FB] border-[#BDD8F5]',
    icon: 'bg-[#185FA5] text-white',
    timeBadge: 'bg-[#C8E0F5] text-[#0C447C]',
  },
  {
    header: 'bg-[#EAF3DE] border-[#C5DFA5]',
    icon: 'bg-[#3B6D11] text-white',
    timeBadge: 'bg-[#D0E9B0] text-[#27500A]',
  },
  {
    header: 'bg-[#FAEEDA] border-[#F0D09C]',
    icon: 'bg-[#854F0B] text-white',
    timeBadge: 'bg-[#F5DFB0] text-[#633806]',
  },
] as const

const BADGE_STYLES: Record<ParsedBadge['type'], string> = {
  challenge: 'bg-[#FCEBEB] text-[#791F1F] border-[#F5C5C5]',
  balls:     'bg-[#EAF3DE] text-[#27500A] border-[#C5DFA5]',
  log:       'bg-[#FAEEDA] text-[#633806] border-[#F0D09C]',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PracticePlanPage({ params }: Props) {
  const { id } = await params
  const plan = await getPracticePlan(Number(id))
  if (!plan) notFound()

  const sections = groupIntoSections(plan.blocks as PlanBlock[], plan.totalDurationMinutes)

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-black text-white h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard?tab=practice" className="text-[#FFD700] text-sm font-medium">
          ← Back
        </Link>
        <span className="text-sm font-medium truncate">{plan.title}</span>
      </header>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {/* Plan header */}
        <div>
          <h1 className="text-xl font-bold">{plan.title}</h1>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <Badge variant="secondary">{plan.totalDurationMinutes} min</Badge>
            {plan.focusArea && <Badge variant="outline">{plan.focusArea}</Badge>}
            {plan.theme && <Badge variant="outline">{plan.theme}</Badge>}
          </div>
          {plan.equipmentList && (
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Equipment:</strong> {plan.equipmentList}
            </p>
          )}
        </div>

        {/* Sections */}
        {sections.map((section, si) => {
          const style = SECTION_STYLES[section.sectionIndex % 3]
          const firstBlock = section.blocks[0]
          const lastBlock = section.blocks[section.blocks.length - 1]
          const sectionStart = firstBlock.startMinute
          const sectionEnd = lastBlock.startMinute + lastBlock.durationMinutes
          const sectionDuration = sectionEnd - sectionStart

          return (
            <div
              key={si}
              className="rounded-xl border border-zinc-200 overflow-hidden shadow-sm"
            >
              {/* Section header */}
              <div className={cn('flex items-center justify-between px-4 py-3 border-b border-zinc-200', style.header)}>
                <div className="flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0', style.icon)}>
                    {si + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      Block {si + 1}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {sectionStart}–{sectionEnd} min
                    </div>
                  </div>
                </div>
                <span className={cn('text-xs font-semibold px-3 py-1 rounded-full', style.timeBadge)}>
                  {sectionDuration} min
                </span>
              </div>

              {/* Drills */}
              <div className="divide-y divide-zinc-100">
                {section.blocks.map((block, bi) => {
                  const desc = block.drillDescription ?? ''
                  const { text, badges } = parseBadges(block.blockName, desc)

                  return (
                    <div key={block.id} className="flex gap-3 px-4 py-3">
                      <span className="text-xs font-semibold text-zinc-400 mt-0.5 min-w-[18px]">
                        {bi + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold text-zinc-900">{block.blockName}</span>
                          <span className="text-xs text-zinc-400 whitespace-nowrap flex-shrink-0">
                            {block.startMinute}–{block.startMinute + block.durationMinutes} min
                          </span>
                        </div>
                        {text && (
                          <p className="text-sm text-zinc-500 mt-1 leading-relaxed whitespace-pre-wrap">
                            {text}
                          </p>
                        )}
                        {badges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {badges.map((badge, bdi) => (
                              <span
                                key={bdi}
                                className={cn(
                                  'inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border',
                                  BADGE_STYLES[badge.type],
                                )}
                              >
                                {badge.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
