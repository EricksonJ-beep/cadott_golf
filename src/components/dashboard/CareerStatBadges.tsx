import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  bestScore18: number | null
  bestPutts18: number | null
  bestGirPct: number | null
  bestFirPct: number | null
  totalRounds: number
  scores70s: number
  scores80s: number
  scores90s: number
  mostPars: number | null
  mostBirdies: number | null
  mostEagles: number | null
  most1Putts: number | null
}

function ShieldBadge({ value, label }: { value: string | number | null; label: string }) {
  const active = value !== null
  const str = active ? String(value) : '—'
  const fontSize = str.length >= 4 ? 11 : str.length === 3 ? 13 : 15

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center" style={{ width: 64, height: 72 }}>
        <svg width="64" height="72" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5 5 L59 5 L59 50 L32 67 L5 50 Z"
            fill={active ? '#1a4a4a' : '#f1f5f9'}
            stroke={active ? '#FFD700' : '#cbd5e1'}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="absolute font-bold tabular-nums leading-none"
          style={{ color: active ? '#ffffff' : '#94a3b8', fontSize, marginTop: -4 }}
        >
          {str}
        </span>
      </div>
      <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground text-center leading-tight max-w-[64px]">
        {label}
      </p>
    </div>
  )
}

function pct(v: number | null): string | null {
  if (v === null) return null
  return `${Math.round(v * 100)}%`
}

export default function CareerStatBadges({
  bestScore18, bestPutts18, bestGirPct, bestFirPct,
  totalRounds, scores70s, scores80s, scores90s,
  mostPars, mostBirdies, mostEagles, most1Putts,
}: Props) {
  if (totalRounds === 0 && bestScore18 === null) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">🛡️ Trophy Room</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Personal Records
          </p>
          <div className="grid grid-cols-4 gap-1 justify-items-center">
            <ShieldBadge value={bestScore18} label="Best Score" />
            <ShieldBadge value={bestPutts18} label="Best Putts" />
            <ShieldBadge value={pct(bestGirPct)} label="Best GIR" />
            <ShieldBadge value={pct(bestFirPct)} label="Best FIR" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Career Totals
          </p>
          <div className="grid grid-cols-4 gap-1 justify-items-center">
            <ShieldBadge value={totalRounds > 0 ? totalRounds : null} label="Rounds" />
            <ShieldBadge value={scores70s > 0 ? scores70s : null} label="70s" />
            <ShieldBadge value={scores80s > 0 ? scores80s : null} label="80s" />
            <ShieldBadge value={scores90s > 0 ? scores90s : null} label="90s" />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Most in a Round
          </p>
          <div className="grid grid-cols-4 gap-1 justify-items-center">
            <ShieldBadge value={mostPars} label="Pars" />
            <ShieldBadge value={mostBirdies} label="Birdies" />
            <ShieldBadge value={mostEagles} label="Eagles" />
            <ShieldBadge value={most1Putts} label="1-Putts" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
