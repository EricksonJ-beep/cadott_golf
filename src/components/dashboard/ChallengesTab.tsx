import Link from 'next/link'
import { getActiveChallenges } from '@/app/actions/challenges'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CATEGORY_LABELS: Record<string, string> = {
  putting: 'Putting',
  chipping: 'Chipping',
  bunker: 'Bunker',
  driving: 'Driving',
  approach: 'Approach',
  wedges: 'Wedges',
  course_stats: 'Course Stats',
}

const CATEGORY_ICONS: Record<string, string> = {
  putting: '🥅',
  chipping: '🎯',
  bunker: '🏖️',
  driving: '🚀',
  approach: '🏌️',
  wedges: '⛳',
  course_stats: '📊',
}

const CATEGORY_STYLES: Record<string, { stripe: string; border: string; header: string }> = {
  putting: {
    stripe: 'from-emerald-300 to-emerald-200',
    border: 'border-emerald-200/90 hover:border-emerald-300',
    header: 'text-emerald-700',
  },
  chipping: {
    stripe: 'from-orange-300 to-amber-200',
    border: 'border-orange-200/90 hover:border-orange-300',
    header: 'text-orange-700',
  },
  bunker: {
    stripe: 'from-yellow-300 to-amber-200',
    border: 'border-yellow-200/90 hover:border-yellow-300',
    header: 'text-yellow-700',
  },
  driving: {
    stripe: 'from-sky-300 to-cyan-200',
    border: 'border-sky-200/90 hover:border-sky-300',
    header: 'text-sky-700',
  },
  approach: {
    stripe: 'from-indigo-300 to-blue-200',
    border: 'border-indigo-200/90 hover:border-indigo-300',
    header: 'text-indigo-700',
  },
  wedges: {
    stripe: 'from-lime-300 to-lime-200',
    border: 'border-lime-200/90 hover:border-lime-300',
    header: 'text-lime-700',
  },
  course_stats: {
    stripe: 'from-violet-300 to-fuchsia-200',
    border: 'border-violet-200/90 hover:border-violet-300',
    header: 'text-violet-700',
  },
}

const TYPE_BADGE_STYLES: Record<'range' | 'course', string> = {
  range: 'bg-sky-100 text-sky-800 border border-sky-200',
  course: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
}

function isNew(newUntil: string | null): boolean {
  if (!newUntil) return false
  // Compare YYYY-MM-DD strings directly to avoid timezone issues
  const today = new Date().toISOString().slice(0, 10)
  return newUntil >= today
}

export default async function ChallengesTab({ userId }: { userId: number }) {
  const challenges = await getActiveChallenges()

  if (challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-5xl">🎯</span>
        <h2 className="text-xl font-bold">Challenges</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          No challenges yet. Your coach will add them soon.
        </p>
      </div>
    )
  }

  const grouped = challenges.reduce<Record<string, typeof challenges>>((acc, c) => {
    if (!acc[c.category]) acc[c.category] = []
    acc[c.category].push(c)
    return acc
  }, {})

  const featured = challenges.filter((c) => c.isFeatured)
  const putting = grouped.putting ?? []
  const chipping = grouped.chipping ?? []
  const orderedCategories = Object.keys(CATEGORY_LABELS).filter(
    (k) => grouped[k] && k !== 'putting' && k !== 'chipping',
  )

  const renderChallengeCard = (c: (typeof challenges)[number]) => {
    const categoryStyle = CATEGORY_STYLES[c.category] ?? {
      stripe: 'from-zinc-300 to-zinc-200',
      border: 'border-zinc-200 hover:border-zinc-300',
      header: 'text-zinc-700',
    }

    return (
    <Link key={c.id} href={`/challenges/${c.id}`}>
      <Card
        className={`relative overflow-hidden bg-white border shadow-[0_1px_0_rgba(0,0,0,0.03)] active:bg-zinc-50 transition-all duration-200 cursor-pointer hover:shadow-sm ${categoryStyle.border}`}
      >
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${categoryStyle.stripe}`} />
        <CardContent className="py-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-semibold text-sm leading-tight">{c.name}</p>
                {isNew(c.newUntil) && (
                  <span className="inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200 leading-none">
                    New
                  </span>
                )}
              </div>
              {c.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {c.description}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {c.isFeatured && (
                <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-900">
                  Featured
                </Badge>
              )}
              <Badge variant="secondary" className={`text-[10px] ${TYPE_BADGE_STYLES[c.type]}`}>
                {c.type === 'range' ? 'Range' : 'Course'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
    )
  }

  const renderSectionLabel = (cat: string, label: string) => {
    const headerClass = CATEGORY_STYLES[cat]?.header ?? 'text-muted-foreground'

    return (
      <h3 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${headerClass}`}>
        <span>{CATEGORY_ICONS[cat]}</span>
        {label}
      </h3>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-bold">Challenges</h2>
        <span className="text-xs text-muted-foreground">
          {challenges.length} active
        </span>
      </div>

      {featured.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>⭐</span>
            Featured Challenges
          </h3>
          <div className="space-y-2">{featured.map((c) => renderChallengeCard(c))}</div>
        </div>
      )}

      {putting.length > 0 && (
        <div className="space-y-2">
          {renderSectionLabel('putting', 'Putting Challenges')}
          <div className="space-y-2">{putting.map((c) => renderChallengeCard(c))}</div>
        </div>
      )}

      {chipping.length > 0 && (
        <div className="space-y-2">
          {renderSectionLabel('chipping', 'Chipping Challenges')}
          <div className="space-y-2">{chipping.map((c) => renderChallengeCard(c))}</div>
        </div>
      )}

      {orderedCategories.map((cat) => (
        <div key={cat} className="space-y-2">
          {renderSectionLabel(cat, CATEGORY_LABELS[cat])}
          <div className="space-y-2">{grouped[cat].map((c) => renderChallengeCard(c))}</div>
        </div>
      ))}
    </div>
  )
}
