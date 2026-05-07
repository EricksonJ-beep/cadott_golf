import Link from 'next/link'
import {
  getMyPersonalBests,
  getMyMostLoggedChallenge,
  getMyRoundRecords,
  getMySeasonSummary,
  getMyBadges,
  getMyStreaks,
  getTeamSeasonStats,
  getMyPersonalRoundBests,
} from '@/app/actions/stats'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import TrendChart from './TrendChart'
import SeasonAveragesCard from './SeasonAveragesCard'
import CourseStatsCard from './CourseStatsCard'
import TeamStatsCard from './TeamStatsCard'
import TrophyRoom from './TrophyRoom'
import StreaksCard from './StreaksCard'
import RoundBestsCard from './RoundBestsCard'

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

export default async function StatsTab(_props: { userId: number }) {
  const [bests, mostLogged, records, season, badges, streaks, team, roundBests] = await Promise.all([
    getMyPersonalBests(),
    getMyMostLoggedChallenge(),
    getMyRoundRecords(),
    getMySeasonSummary(),
    getMyBadges(),
    getMyStreaks(),
    getTeamSeasonStats(),
    getMyPersonalRoundBests(),
  ])

  const hasAnyBadge = Object.values(badges).some((v) => v !== null)

  const hasTeamData = team != null && team.rounds9 + team.rounds18 > 0

  if (
    bests.length === 0 &&
    records.allTimeRounds === 0 &&
    (!season || season.rounds9 + season.rounds18 === 0) &&
    !hasAnyBadge &&
    !hasTeamData
  ) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-5xl">📊</span>
        <h2 className="text-xl font-bold">Stats</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Log a few challenges or rounds and your stats will show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold">Stats</h2>

      {team && <TeamStatsCard team={team} />}

      {season && (
        <CourseStatsCard
          girPct={season.girPct}
          firPct={season.firPct}
          avgPutts18={season.avgPutts18}
          avgPutts9={season.avgPutts9}
        />
      )}

      <RoundBestsCard
        bestGirPct={roundBests.bestGirPct}
        bestFirPct={roundBests.bestFirPct}
        lowestPutts18={roundBests.lowestPutts18}
        lowestPutts9={roundBests.lowestPutts9}
      />

      {season && <SeasonAveragesCard summary={season} />}

      <StreaksCard streaks={streaks} />

      {records.allTimeRounds > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">🏆 All-Time Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-center">
              {records.allTimeLowest9 != null && (
                <div>
                  <div className="text-2xl font-bold tabular-nums">{records.allTimeLowest9}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Best 9-hole</div>
                </div>
              )}
              {records.allTimeLowest18 != null && (
                <div>
                  <div className="text-2xl font-bold tabular-nums">{records.allTimeLowest18}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Best 18-hole</div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center pt-1">
              <Badge variant="secondary">{records.allTimeRounds} Rounds</Badge>
              {records.allTimeEagles > 0 && (
                <Badge variant="secondary">
                  <span className="text-amber-600 mr-1">●</span>{records.allTimeEagles} Eagle{records.allTimeEagles !== 1 ? 's' : ''}
                </Badge>
              )}
              <Badge variant="secondary">
                <span className="text-red-600 mr-1">●</span>{records.allTimeBirdies} Birdie{records.allTimeBirdies !== 1 ? 's' : ''}
              </Badge>
            </div>
            {records.historicalSeasons.length > 0 && (
              <div className="border-t pt-3 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Season History</p>
                {records.historicalSeasons.map((s) => (
                  <div key={s.id} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.season} · {s.holesPlayed}-hole</span>
                    <span className="tabular-nums font-medium">
                      {s.roundsPlayed != null ? `${s.roundsPlayed} rounds` : ''}
                      {s.lowestScore != null ? ` · Low ${s.lowestScore}` : ''}
                      {s.averageScore != null ? ` · Avg ${s.averageScore.toFixed(1)}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {bests.length > 0 && (
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
      )}

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

      <TrophyRoom earned={badges} />
    </div>
  )
}
