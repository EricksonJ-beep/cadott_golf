import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Streaks = {
  roundsLogged: number
  currentWeeklyPlayStreak: number
  bestWeeklyPlayStreak: number
  currentBirdieRoundStreak: number
  bestBirdieRoundStreak: number
  currentParRoundStreak: number
  bestParRoundStreak: number
  currentImprovementStreak: number
  bestImprovementStreak: number
}

export default function StreaksCard({ streaks }: { streaks: Streaks }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🔥 Streaks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-2xl font-bold tabular-nums">{streaks.currentWeeklyPlayStreak}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Current Weekly Play</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{streaks.bestWeeklyPlayStreak}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Best Weekly Play</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{streaks.currentBirdieRoundStreak}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Birdie Rounds (Current)</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{streaks.bestBirdieRoundStreak}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Birdie Rounds (Best)</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{streaks.currentParRoundStreak}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Par Rounds (Current)</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">{streaks.bestParRoundStreak}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Par Rounds (Best)</div>
          </div>
        </div>

        <div className="pt-1 border-t flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Rounds Logged</span>
          <span className="font-semibold tabular-nums">{streaks.roundsLogged}</span>
        </div>

        <div className="text-[11px] text-muted-foreground">
          Improvement streak tracks consecutive rounds that were equal to or better than the previous round relative to par.
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-lg font-bold tabular-nums">{streaks.currentImprovementStreak}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Current Improvement</div>
          </div>
          <div>
            <div className="text-lg font-bold tabular-nums">{streaks.bestImprovementStreak}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Best Improvement</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
