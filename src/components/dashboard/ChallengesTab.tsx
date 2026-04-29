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

  const orderedCategories = Object.keys(CATEGORY_LABELS).filter((k) => grouped[k])

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-bold">Challenges</h2>
        <span className="text-xs text-muted-foreground">
          {challenges.length} active
        </span>
      </div>

      {orderedCategories.map((cat) => (
        <div key={cat} className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <span>{CATEGORY_ICONS[cat]}</span>
            {CATEGORY_LABELS[cat]}
          </h3>
          <div className="space-y-2">
            {grouped[cat].map((c) => (
              <Link key={c.id} href={`/challenges/${c.id}`}>
                <Card className="active:bg-zinc-50 transition-colors cursor-pointer hover:border-[#FFD700]">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight">{c.name}</p>
                        {c.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {c.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {c.type === 'range' ? 'Range' : 'Course'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
