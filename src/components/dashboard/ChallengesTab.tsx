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

  const renderChallengeCard = (c: (typeof challenges)[number]) => (
    <Link key={c.id} href={`/challenges/${c.id}`}>
      <Card className="active:bg-zinc-50 transition-colors cursor-pointer hover:border-[#FFD700]">
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
              <Badge variant="secondary" className="text-[10px]">
                {c.type === 'range' ? 'Range' : 'Course'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )

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
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>{CATEGORY_ICONS.putting}</span>
            Putting Challenges
          </h3>
          <div className="space-y-2">{putting.map((c) => renderChallengeCard(c))}</div>
        </div>
      )}

      {chipping.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>{CATEGORY_ICONS.chipping}</span>
            Chipping Challenges
          </h3>
          <div className="space-y-2">{chipping.map((c) => renderChallengeCard(c))}</div>
        </div>
      )}

      {orderedCategories.map((cat) => (
        <div key={cat} className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>{CATEGORY_ICONS[cat]}</span>
            {CATEGORY_LABELS[cat]}
          </h3>
          <div className="space-y-2">{grouped[cat].map((c) => renderChallengeCard(c))}</div>
        </div>
      ))}
    </div>
  )
}
