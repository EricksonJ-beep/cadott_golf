import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flag, Navigation, Circle } from 'lucide-react'

type Props = {
  bestGirPct: number | null
  bestFirPct: number | null
  lowestPutts18: number | null
  lowestPutts9: number | null
}

function StatBlock({
  icon,
  value,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode
  value: string
  label: string
  sub?: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1">
      <div className={`rounded-full p-2.5 ${color}`}>{icon}</div>
      <div className="text-2xl font-bold tabular-nums leading-tight">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">
        {label}
      </div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  )
}

export default function RoundBestsCard({ bestGirPct, bestFirPct, lowestPutts18, lowestPutts9 }: Props) {
  const lowestPutts = lowestPutts18 ?? lowestPutts9
  const puttsLabel = lowestPutts18 != null ? 'Low Putts (18)' : 'Low Putts (9)'
  const hasAny = bestGirPct != null || bestFirPct != null || lowestPutts != null
  if (!hasAny) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🥇 Best</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <StatBlock
            icon={<Navigation className="h-5 w-5 text-blue-600" />}
            value={bestFirPct != null ? `${Math.round(bestFirPct * 100)}%` : '—'}
            label="Best Fairways"
            sub="Single Round"
            color="bg-blue-50"
          />
          <StatBlock
            icon={<Flag className="h-5 w-5 text-green-700" />}
            value={bestGirPct != null ? `${Math.round(bestGirPct * 100)}%` : '—'}
            label="Best GIR"
            sub="Single Round"
            color="bg-green-50"
          />
          <StatBlock
            icon={<Circle className="h-5 w-5 text-purple-600" />}
            value={lowestPutts != null ? String(lowestPutts) : '—'}
            label={puttsLabel}
            sub="Single Round"
            color="bg-purple-50"
          />
        </div>
      </CardContent>
    </Card>
  )
}
