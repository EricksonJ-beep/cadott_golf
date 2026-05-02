import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flag, Navigation, Circle } from 'lucide-react'

type Props = {
  girPct: number | null
  firPct: number | null
  avgPutts18: number | null
  avgPutts9: number | null
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

export default function CourseStatsCard({ girPct, firPct, avgPutts18, avgPutts9 }: Props) {
  const avgPutts = avgPutts18 ?? avgPutts9
  const puttsLabel = avgPutts18 != null ? 'Avg Putts (18)' : 'Avg Putts (9)'
  const hasAny = girPct != null || firPct != null || avgPutts != null
  if (!hasAny) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">📐 Course Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <StatBlock
            icon={<Flag className="h-5 w-5 text-green-700" />}
            value={girPct != null ? `${Math.round(girPct * 100)}%` : '—'}
            label="GIR"
            sub="Greens in Reg"
            color="bg-green-50"
          />
          <StatBlock
            icon={<Navigation className="h-5 w-5 text-blue-600" />}
            value={firPct != null ? `${Math.round(firPct * 100)}%` : '—'}
            label="Fairways"
            sub="Fairways Hit"
            color="bg-blue-50"
          />
          <StatBlock
            icon={<Circle className="h-5 w-5 text-purple-600" />}
            value={avgPutts != null ? avgPutts.toFixed(1) : '—'}
            label={puttsLabel}
            sub="Per Round"
            color="bg-purple-50"
          />
        </div>

        <div className="mt-4 space-y-1.5">
          {girPct != null && <GoalBar label="GIR Goal: 33%" value={girPct} target={0.33} color="bg-green-500" />}
          {firPct != null && <GoalBar label="FIR Goal: 50%" value={firPct} target={0.50} color="bg-blue-500" />}
          {avgPutts18 != null && (
            <GoalBar
              label="Putts Goal: ≤32"
              value={Math.max(0, 1 - (avgPutts18 - 28) / 12)}
              target={1 - (32 - 28) / 12}
              color="bg-purple-500"
              invert
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function GoalBar({
  label,
  value,
  target,
  color,
  invert = false,
}: {
  label: string
  value: number
  target: number
  color: string
  invert?: boolean
}) {
  const pct = Math.min(1, Math.max(0, value))
  const targetPct = Math.min(1, Math.max(0, target))
  const met = invert ? value >= targetPct : value >= target

  return (
    <div>
      <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
        <span>{label}</span>
        <span className={met ? 'text-green-600 font-semibold' : ''}>{met ? '✓ Met' : 'In Progress'}</span>
      </div>
      <div className="relative h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all ${met ? color : 'bg-zinc-300'}`}
          style={{ width: `${pct * 100}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-zinc-400"
          style={{ left: `${targetPct * 100}%` }}
        />
      </div>
    </div>
  )
}
