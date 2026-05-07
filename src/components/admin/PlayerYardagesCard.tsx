import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Distance = {
  swingType: string
  carryYards: number | null
  totalYards: number | null
}

type Club = {
  id: number
  customName: string | null
  isHidden: boolean
  defaultClub: { name: string; type: string } | null
  distances: Distance[]
}

const SWING_LABELS: Record<string, string> = {
  full: 'Full',
  three_quarter: '¾',
  half: '½',
  quarter: '¼',
}

const WEDGE_SWINGS = ['quarter', 'half', 'three_quarter', 'full'] as const

function latest(distances: Distance[], swingType: string) {
  return distances.find((d) => d.swingType === swingType) ?? null
}

function clubName(c: Club) {
  return c.customName || c.defaultClub?.name || 'Club'
}

export default function PlayerYardagesCard({ clubs }: { clubs: Club[] }) {
  const visible = clubs.filter((c) => !c.isHidden)
  const wedges = visible.filter((c) => c.defaultClub?.type === 'wedge')
  const others = visible.filter((c) => c.defaultClub?.type !== 'wedge')

  const hasAnyDistances = visible.some((c) =>
    c.distances.some((d) => d.carryYards != null || d.totalYards != null)
  )

  if (!hasAnyDistances) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Yardages</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-2">
            Player hasn&apos;t logged any club distances yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {wedges.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Wedges</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <div className="grid grid-cols-[1fr_repeat(4,minmax(48px,1fr))] gap-x-1 gap-y-1">
              <div />
              {WEDGE_SWINGS.map((s) => (
                <div
                  key={s}
                  className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-1"
                >
                  {SWING_LABELS[s]}
                </div>
              ))}
              {wedges.map((wedge) => (
                <div key={wedge.id} className="contents">
                  <div className="text-base font-semibold truncate py-3 px-1">
                    {clubName(wedge)}
                  </div>
                  {WEDGE_SWINGS.map((swing) => {
                    const yards = latest(wedge.distances, swing)?.carryYards ?? null
                    return (
                      <div
                        key={swing}
                        className={`h-12 rounded-lg text-base font-bold tabular-nums flex items-center justify-center ${
                          yards !== null
                            ? 'bg-zinc-100 text-foreground'
                            : 'bg-zinc-50 text-muted-foreground'
                        }`}
                      >
                        {yards !== null ? yards : '—'}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {others.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Club Distances</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-zinc-100 px-4">
            {others.map((club) => {
              const full = latest(club.distances, 'full')
              const hasDist = full && (full.carryYards != null || full.totalYards != null)
              return (
                <div key={club.id} className="py-3">
                  <div className="font-semibold text-base leading-tight">{clubName(club)}</div>
                  {hasDist ? (
                    <div className="flex gap-4 mt-1 flex-wrap">
                      {full.carryYards != null && (
                        <span className="text-sm text-muted-foreground">
                          Carry{' '}
                          <span className="font-bold text-foreground text-base">
                            {full.carryYards}y
                          </span>
                        </span>
                      )}
                      {full.totalYards != null && (
                        <span className="text-sm text-muted-foreground">
                          Total{' '}
                          <span className="font-bold text-foreground text-base">
                            {full.totalYards}y
                          </span>
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-0.5">No distance logged</p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
