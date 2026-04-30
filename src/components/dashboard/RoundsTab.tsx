import Link from 'next/link'
import { getMyRounds, getMyCourseStats } from '@/app/actions/rounds'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function RoundsTab() {
  const [rounds, stats] = await Promise.all([getMyRounds(), getMyCourseStats()])

  const fwyPct =
    stats && stats.fairwayOpps > 0
      ? Math.round((stats.fairwaysHit / stats.fairwayOpps) * 100)
      : null
  const girPct =
    stats && stats.totalHoles > 0
      ? Math.round((stats.girHit / stats.totalHoles) * 100)
      : null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Rounds</h2>
        <Link
          href="/birdie-board"
          className="inline-flex items-center gap-1.5 bg-[#FFD700] text-black text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-[#e6c200]"
        >
          🏆 Leaderboard
        </Link>
      </div>

      <Link href="/rounds/new">
        <Button className="w-full h-12 bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold">
          + Log a Round
        </Button>
      </Link>

      {stats && stats.roundsPlayed > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">⛳ Course Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-bold tabular-nums">{stats.roundsPlayed}</div>
                <div className="text-[10px] text-muted-foreground uppercase">Rounds</div>
              </div>
              <div>
                <div className="text-xl font-bold tabular-nums">
                  {stats.avgScore != null ? stats.avgScore.toFixed(2) : '—'}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">Avg / Hole</div>
              </div>
              <div>
                <div className="text-xl font-bold tabular-nums">
                  {stats.avgPutts != null ? stats.avgPutts.toFixed(2) : '—'}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">Avg Putts</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <Badge variant="secondary">
                <span className="text-amber-600 mr-1">●</span> {stats.eagles} Eagle{stats.eagles !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary">
                <span className="text-red-600 mr-1">●</span> {stats.birdies} Birdie{stats.birdies !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary">
                {stats.pars} Par{stats.pars !== 1 ? 's' : ''}
              </Badge>
              {fwyPct !== null && (
                <Badge variant="outline">Fwy {fwyPct}%</Badge>
              )}
              {girPct !== null && (
                <Badge variant="outline">GIR {girPct}%</Badge>
              )}
            </div>
            {(stats.holesOnPar3 > 0 || stats.holesOnPar4 > 0 || stats.holesOnPar5 > 0) && (
              <div className="mt-4 border-t pt-3 grid grid-cols-3 gap-2 text-center">
                {stats.holesOnPar3 > 0 && (
                  <div>
                    <div className="text-base font-bold tabular-nums">
                      {stats.avgOnPar3 != null ? stats.avgOnPar3.toFixed(2) : '—'}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase">Avg Par 3</div>
                    <div className="text-[9px] text-muted-foreground">+{stats.avgOnPar3 != null ? (stats.avgOnPar3 - 3).toFixed(2) : '—'}</div>
                  </div>
                )}
                {stats.holesOnPar4 > 0 && (
                  <div>
                    <div className="text-base font-bold tabular-nums">
                      {stats.avgOnPar4 != null ? stats.avgOnPar4.toFixed(2) : '—'}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase">Avg Par 4</div>
                    <div className="text-[9px] text-muted-foreground">+{stats.avgOnPar4 != null ? (stats.avgOnPar4 - 4).toFixed(2) : '—'}</div>
                  </div>
                )}
                {stats.holesOnPar5 > 0 && (
                  <div>
                    <div className="text-base font-bold tabular-nums">
                      {stats.avgOnPar5 != null ? stats.avgOnPar5.toFixed(2) : '—'}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase">Avg Par 5</div>
                    <div className="text-[9px] text-muted-foreground">+{stats.avgOnPar5 != null ? (stats.avgOnPar5 - 5).toFixed(2) : '—'}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {rounds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
          <span className="text-4xl">⛳</span>
          <p className="text-sm text-muted-foreground max-w-xs">
            No rounds logged yet. Tap &ldquo;Log a Round&rdquo; to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Rounds
          </h3>
          {rounds.map((r) => (
            <Link key={r.id} href={`/rounds/${r.id}`}>
              <Card className="active:bg-zinc-50 cursor-pointer hover:border-[#FFD700]">
                <CardContent className="py-3 px-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{r.courseName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString()} · {r.holesPlayed} holes
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-bold tabular-nums">{r.totalScore ?? '—'}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
