import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Props = {
  team: {
    seasonName: string
    avgPar3: number | null
    avgPar4: number | null
    avgPar5: number | null
    par3Holes: number
    par4Holes: number
    par5Holes: number
    birdies: number
    pars: number
    avgScore9: number | null
    avgScore18: number | null
    rounds9: number
    rounds18: number
    players: number
  }
}

export default function TeamStatsCard({ team }: Props) {
  const totalRounds = team.rounds9 + team.rounds18
  if (totalRounds === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🐝 {team.seasonName} Team Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold tabular-nums">
              {team.avgScore18 != null ? team.avgScore18.toFixed(1) : '—'}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase">Team Avg 18-hole</div>
            <div className="text-[10px] text-muted-foreground">
              {team.rounds18} round{team.rounds18 !== 1 ? 's' : ''}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">
              {team.avgScore9 != null ? team.avgScore9.toFixed(1) : '—'}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase">Team Avg 9-hole</div>
            <div className="text-[10px] text-muted-foreground">
              {team.rounds9} round{team.rounds9 !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider mb-2 text-center">
            Avg Score by Par
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold tabular-nums">
                {team.avgPar3 != null ? team.avgPar3.toFixed(2) : '—'}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">Par 3</div>
              <div className="text-[10px] text-muted-foreground">
                {team.par3Holes} hole{team.par3Holes !== 1 ? 's' : ''}
              </div>
            </div>
            <div>
              <div className="text-xl font-bold tabular-nums">
                {team.avgPar4 != null ? team.avgPar4.toFixed(2) : '—'}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">Par 4</div>
              <div className="text-[10px] text-muted-foreground">
                {team.par4Holes} hole{team.par4Holes !== 1 ? 's' : ''}
              </div>
            </div>
            <div>
              <div className="text-xl font-bold tabular-nums">
                {team.avgPar5 != null ? team.avgPar5.toFixed(2) : '—'}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">Par 5</div>
              <div className="text-[10px] text-muted-foreground">
                {team.par5Holes} hole{team.par5Holes !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary">
            <span className="text-red-600 mr-1">●</span>
            {team.birdies} Team Birdie{team.birdies !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary">{team.pars} Team Par{team.pars !== 1 ? 's' : ''}</Badge>
          {team.players > 0 && (
            <Badge variant="outline">{team.players} player{team.players !== 1 ? 's' : ''}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
