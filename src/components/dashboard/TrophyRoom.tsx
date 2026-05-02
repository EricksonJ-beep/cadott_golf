import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BADGE_DEFS, type BadgeGroup, type EarnedMap } from '@/lib/badges'

const GROUP_LABELS: Record<BadgeGroup, string> = {
  scoring_18:        '18-Hole Scoring',
  scoring_9:         '9-Hole Scoring',
  pars:              'Pars in a Round',
  birdies:           'Birdies in a Round',
  participation:     'Participation',
  streaks:           'Streak Milestones',
  feats:             'Feats',
  greens_fairways:   'Greens & Fairways',
  putting_milestones: 'Putting Milestones',
}

const GROUP_ORDER: BadgeGroup[] = [
  'scoring_18',
  'scoring_9',
  'pars',
  'birdies',
  'greens_fairways',
  'putting_milestones',
  'participation',
  'streaks',
  'feats',
]

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function TrophyRoom({ earned }: { earned: EarnedMap }) {
  const earnedCount = BADGE_DEFS.filter((b) => earned[b.id]).length
  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    badges: BADGE_DEFS.filter((b) => b.group === g),
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-baseline justify-between gap-2">
          <span>🏅 Trophy Room</span>
          <span className="text-xs font-normal text-muted-foreground shrink-0">
            {earnedCount} / {BADGE_DEFS.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {grouped.map(({ group, badges }) => (
          <div key={group} className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
              {GROUP_LABELS[group]}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {badges.map((b) => {
                const earnedAt = earned[b.id]
                const isEarned = earnedAt != null
                return (
                  <div
                    key={b.id}
                    title={`${b.name} — ${b.description}${
                      isEarned ? ` (Earned ${formatDate(earnedAt!)})` : ' (Locked)'
                    }`}
                    className={`rounded-lg border p-2 text-center transition-opacity ${
                      isEarned
                        ? 'bg-[#FFF9E0] border-[#FFD700]'
                        : 'bg-zinc-50 border-zinc-200 opacity-50 grayscale'
                    }`}
                  >
                    <div className="text-2xl leading-none">{b.emoji}</div>
                    <div className="text-[11px] font-semibold mt-1 leading-tight">{b.name}</div>
                    <div className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
                      {isEarned ? formatDate(earnedAt!) : 'Locked'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
