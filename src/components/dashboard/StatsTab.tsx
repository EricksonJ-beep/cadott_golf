import Link from 'next/link'
import { getMyPersonalBests, getMyMostLoggedChallenge } from '@/app/actions/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import TrendChart from './TrendChart'

const CATEGORY_LABEL: Record<string, string> = {
  putting: 'Putting',
  chipping: 'Chipping',
  bunker: 'Bunker',
  driving: 'Driving',
  approach: 'Approach',
  wedges: 'Wedges',
  course_stats: 'Course Stats',
}

function formatScore(
  score: number,
  scoringType: string,
  maxScore: number | null,
  unit: string | null,
): string {
  if (scoringType === 'pass_fail') return score === 1 ? '✓ Pass' : '✗ Fail'
  if (scoringType === 'score_out_of' && maxScore) return `${score} / ${maxScore}`
  if (scoringType === 'count' && unit) return `${score} ${unit}`
  return String(score)
}

export default async function StatsTab({ userId }: { userId: number }) {
  const [bests, mostLogged] = await Promise.all([
    getMyPersonalBests(),
    getMyMostLoggedChallenge(),
  ])

  if (bests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-5xl">📊</span>
        <h2 className="text-xl font-bold">Stats</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Log a few challenges and your personal bests + trend charts will show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Stats</h2>

      {mostLogged && mostLogged.trend.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-baseline justify-between gap-2">
              <span className="truncate">📈 {mostLogged.name}</span>
              <span className="text-xs font-normal text-muted-foreground shrink-0">
                {mostLogged.attempts} attempts
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={mostLogged.trend} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">⭐ Personal Bests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {bests.map((b) => (
            <Link
              key={b.challengeId}
              href={`/challenges/${b.challengeId}`}
              className="block py-2 border-b last:border-b-0 active:bg-zinc-50"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{b.name}</p>
                  <div className="flex gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-[10px]">
                      {CATEGORY_LABEL[b.category]}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {b.attempts} attempt{b.attempts !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-sm tabular-nums shrink-0">
                  {formatScore(b.bestScore ?? 0, b.scoringType, b.maxScore, b.unit)}
                </span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
