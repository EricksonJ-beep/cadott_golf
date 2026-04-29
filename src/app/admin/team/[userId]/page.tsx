import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPlayerSummary } from '@/app/actions/team'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Props = { params: Promise<{ userId: string }> }

export default async function PlayerDetailPage({ params }: Props) {
  const { userId } = await params
  const data = await getPlayerSummary(Number(userId))
  if (!data) notFound()

  const { user, summary, recentRounds } = data
  const fwyPct =
    summary && summary.fairwayOpps > 0
      ? Math.round((summary.fairwaysHit / summary.fairwayOpps) * 100)
      : null
  const girPct =
    summary && summary.totalHoles > 0
      ? Math.round((summary.girHit / summary.totalHoles) * 100)
      : null

  return (
    <div className="space-y-4">
      <Link href="/admin/team" className="text-sm text-zinc-500">
        ← Back to Team
      </Link>

      <div>
        <h1 className="text-xl font-bold">{user.name}</h1>
        <p className="text-xs text-muted-foreground">
          @{user.username}{user.grade ? ` · Grade ${user.grade}` : ''}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Course Stats</CardTitle>
        </CardHeader>
        <CardContent>
          {!summary || summary.roundsPlayed === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No rounds logged yet.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {summary.roundsPlayed}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">Rounds</div>
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {summary.avgScore != null ? summary.avgScore.toFixed(2) : '—'}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">Avg / Hole</div>
                </div>
                <div>
                  <div className="text-xl font-bold tabular-nums">
                    {summary.avgPutts != null ? summary.avgPutts.toFixed(2) : '—'}
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase">Avg Putts</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <Badge variant="secondary">🦅 {summary.eagles} Eagles</Badge>
                <Badge variant="secondary">🐦 {summary.birdies} Birdies</Badge>
                <Badge variant="secondary">{summary.pars} Pars</Badge>
                {fwyPct !== null && <Badge variant="outline">Fwy {fwyPct}%</Badge>}
                {girPct !== null && <Badge variant="outline">GIR {girPct}%</Badge>}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {recentRounds.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentRounds.map((r) => (
                <li key={r.id} className="py-2 flex items-center justify-between">
                  <Link href={`/rounds/${r.id}`} className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{r.courseName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString()} · {r.holesPlayed} holes
                    </p>
                  </Link>
                  <span className="text-lg font-bold tabular-nums shrink-0">
                    {r.totalScore ?? '—'}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
