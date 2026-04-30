import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Props = {
  summary: {
    seasonName: string
    avgScore9: number | null
    avgScore18: number | null
    rounds9: number
    rounds18: number
    eagles: number
    birdies: number
    pars: number
    bogeys: number
    doubles: number
  }
}

export default function SeasonAveragesCard({ summary }: Props) {
  const totalRounds = summary.rounds9 + summary.rounds18

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">📊 {summary.seasonName} Averages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {totalRounds === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            No rounds logged this season yet.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold tabular-nums">
                  {summary.avgScore18 != null ? summary.avgScore18.toFixed(1) : '—'}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">Avg 18-hole</div>
                <div className="text-[10px] text-muted-foreground">
                  {summary.rounds18} round{summary.rounds18 !== 1 ? 's' : ''}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">
                  {summary.avgScore9 != null ? summary.avgScore9.toFixed(1) : '—'}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase">Avg 9-hole</div>
                <div className="text-[10px] text-muted-foreground">
                  {summary.rounds9} round{summary.rounds9 !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center pt-1">
              {summary.eagles > 0 && (
                <Badge variant="secondary">
                  <span className="text-amber-600 mr-1">●</span>
                  {summary.eagles} Eagle{summary.eagles !== 1 ? 's' : ''}
                </Badge>
              )}
              <Badge variant="secondary">
                <span className="text-red-600 mr-1">●</span>
                {summary.birdies} Birdie{summary.birdies !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary">{summary.pars} Par{summary.pars !== 1 ? 's' : ''}</Badge>
              <Badge variant="secondary">{summary.bogeys} Bogey{summary.bogeys !== 1 ? 's' : ''}</Badge>
              {summary.doubles > 0 && (
                <Badge variant="secondary">{summary.doubles} Double+</Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
