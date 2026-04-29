import Link from 'next/link'
import { getTeamOverview } from '@/app/actions/team'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminTeamPage() {
  const players = await getTeamOverview()

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Team</h1>
        <p className="text-xs text-muted-foreground">
          Active roster with rounds and challenge activity
        </p>
      </div>

      {players.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No active players. Add players from the Roster tab.
        </p>
      ) : (
        <div className="space-y-2">
          {players.map((p) => (
            <Link key={p.id} href={`/admin/team/${p.id}`}>
              <Card className="active:bg-zinc-50 cursor-pointer hover:border-[#FFD700]">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">
                        {p.name}
                        {p.grade && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            Grade {p.grade}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {p.roundsPlayed} round{p.roundsPlayed !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {p.challengeLogs} challenge{p.challengeLogs !== 1 ? 's' : ''}
                        </Badge>
                        {p.eagles > 0 && (
                          <Badge variant="outline" className="text-[10px] border-amber-400">
                            🦅 {p.eagles}
                          </Badge>
                        )}
                        {p.birdies > 0 && (
                          <Badge variant="outline" className="text-[10px] border-red-400">
                            🐦 {p.birdies}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {p.avgScore != null && (
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold tabular-nums">
                          {p.avgScore.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          Avg/hole
                        </div>
                      </div>
                    )}
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
