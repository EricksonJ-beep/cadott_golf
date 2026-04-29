import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type SeasonRow = { userId: number; name: string; bestScore: number | null }
type AllTimeRecord = {
  score: number
  dateLogged: string
  userId: number
  name: string
  seasonName: string | null
} | null

type Props = {
  seasonName: string | null
  seasonRows: SeasonRow[]
  allTime: AllTimeRecord
  formatScore: (n: number) => string
  currentUserId: number
}

export default function Leaderboard({ seasonName, seasonRows, allTime, formatScore, currentUserId }: Props) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>🏆 Top 5 — {seasonName ?? 'Season'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seasonRows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No scores logged this season yet. Be the first.
            </p>
          ) : (
            <ol className="space-y-1.5">
              {seasonRows.map((row, i) => {
                const isMe = row.userId === currentUserId
                return (
                  <li
                    key={row.userId}
                    className={`flex items-center justify-between text-sm py-1.5 px-2 rounded ${
                      isMe ? 'bg-[#FFD700]/15 font-semibold' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                          i === 0
                            ? 'bg-[#FFD700] text-black'
                            : i === 1
                            ? 'bg-zinc-300 text-black'
                            : i === 2
                            ? 'bg-orange-300 text-black'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span>{row.name}{isMe && <span className="ml-1 text-xs">(you)</span>}</span>
                    </span>
                    <span className="tabular-nums">{formatScore(row.bestScore ?? 0)}</span>
                  </li>
                )
              })}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#FFD700]/40 bg-[#FFD700]/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">⭐ All-Time Record</CardTitle>
        </CardHeader>
        <CardContent>
          {!allTime ? (
            <p className="text-sm text-muted-foreground py-2">
              No record yet. Set the bar.
            </p>
          ) : (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-sm">{allTime.name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(allTime.dateLogged).toLocaleDateString()}
                  {allTime.seasonName && ` · ${allTime.seasonName}`}
                </p>
              </div>
              <span className="text-2xl font-bold tabular-nums">
                {formatScore(allTime.score)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
