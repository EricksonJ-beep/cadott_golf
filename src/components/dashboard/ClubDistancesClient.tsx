'use client'

import { useState, useTransition } from 'react'
import { saveClubDistance, toggleClubHidden } from '@/app/actions/clubs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Distance = {
  id: number
  swingType: string
  carryYards: number | null
  totalYards: number | null
  typicalMiss: string | null
  isGoTo: boolean
  isAvoid: boolean
  dateLogged: string
}

type Club = {
  id: number
  clubId: number | null
  customName: string | null
  isHidden: boolean
  orderIndex: number
  defaultClub: { id: number; name: string; type: string } | null
  distances: Distance[]
}

const SWING_LABELS: Record<string, string> = {
  full: 'Full',
  three_quarter: '¾',
  half: '½',
  quarter: '¼',
}

function latestDistance(distances: Distance[], swingType: string) {
  return distances.find((d) => d.swingType === swingType) ?? null
}

function ClubRow({ club, onEdit }: { club: Club; onEdit: (club: Club) => void }) {
  const name = club.customName || club.defaultClub?.name || 'Club'
  const fullDist = latestDistance(club.distances, 'full')

  if (club.isHidden) return null

  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-sm truncate">{name}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-muted-foreground shrink-0"
          onClick={() => onEdit(club)}
        >
          Edit
        </Button>
      </div>
      {fullDist ? (
        <div className="mt-1 text-sm text-muted-foreground">
          <div className="flex gap-4 flex-wrap">
            {fullDist.carryYards && (
              <span>Carry <strong className="text-foreground">{fullDist.carryYards}y</strong></span>
            )}
            {fullDist.totalYards && (
              <span>Total <strong className="text-foreground">{fullDist.totalYards}y</strong></span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-0.5">No distances logged yet</p>
      )}
    </div>
  )
}

const WEDGE_SWINGS = ['quarter', 'half', 'three_quarter', 'full'] as const

function WedgeGrid({
  wedges,
  onEdit,
}: {
  wedges: Club[]
  onEdit: (club: Club, swingType: string) => void
}) {
  if (wedges.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Wedges</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="grid grid-cols-[1fr_repeat(4,minmax(40px,1fr))] gap-x-1 gap-y-0.5 text-sm">
          <div />
          {WEDGE_SWINGS.map((s) => (
            <div
              key={s}
              className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pb-1"
            >
              {SWING_LABELS[s]}
            </div>
          ))}

          {wedges.map((wedge) => {
            const name = wedge.customName || wedge.defaultClub?.name || 'Wedge'
            return (
              <FragmentRow
                key={wedge.id}
                name={name}
                wedge={wedge}
                onEdit={onEdit}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function FragmentRow({
  name,
  wedge,
  onEdit,
}: {
  name: string
  wedge: Club
  onEdit: (club: Club, swingType: string) => void
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onEdit(wedge, 'full')}
        className="text-left text-sm font-medium truncate py-2 px-1 hover:bg-zinc-50 rounded"
      >
        {name}
      </button>
      {WEDGE_SWINGS.map((swing) => {
        const d = latestDistance(wedge.distances, swing)
        const yards = d?.carryYards ?? null
        return (
          <button
            key={swing}
            type="button"
            onClick={() => onEdit(wedge, swing)}
            className={`h-10 rounded text-sm font-semibold tabular-nums transition-colors ${
              yards !== null
                ? 'bg-zinc-50 hover:bg-zinc-100 text-foreground'
                : 'bg-transparent hover:bg-zinc-50 text-muted-foreground'
            }`}
          >
            {yards !== null ? yards : '—'}
          </button>
        )
      })}
    </>
  )
}

function EditClubModal({
  club,
  initialSwingType = 'full',
  onClose,
}: {
  club: Club
  initialSwingType?: string
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [swingType, setSwingType] = useState(initialSwingType)
  const name = club.customName || club.defaultClub?.name || 'Club'
  const isWedge = club.defaultClub?.type === 'wedge'
  const existing = latestDistance(club.distances, swingType)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('playerClubId', String(club.id))
    fd.set('swingType', swingType)
    startTransition(async () => {
      await saveClubDistance(fd)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-base">{name}</h3>
          <button onClick={onClose} className="text-muted-foreground text-xl leading-none">&times;</button>
        </div>
        <div className="p-4 space-y-4">
          {isWedge && (
            <div className="flex gap-2">
              {(['full', 'three_quarter', 'half', 'quarter'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSwingType(s)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    swingType === s
                      ? 'bg-[#FFD700] border-[#FFD700] text-black'
                      : 'border-zinc-200 text-muted-foreground'
                  }`}
                >
                  {SWING_LABELS[s]}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="carryYards">Carry (yds)</Label>
                <Input
                  id="carryYards"
                  name="carryYards"
                  type="number"
                  inputMode="numeric"
                  defaultValue={existing?.carryYards ?? ''}
                  className="h-11"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="totalYards">Total (yds)</Label>
                <Input
                  id="totalYards"
                  name="totalYards"
                  type="number"
                  inputMode="numeric"
                  defaultValue={existing?.totalYards ?? ''}
                  className="h-11"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={pending}
              className="w-full h-11 bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
            >
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ClubDistancesClient({ clubs }: { clubs: Club[] }) {
  const [editing, setEditing] = useState<{ club: Club; swingType: string } | null>(null)
  const [showHidden, setShowHidden] = useState(false)
  const visible = clubs.filter((c) => !c.isHidden)
  const hidden = clubs.filter((c) => c.isHidden)
  const visibleNonWedges = visible.filter((c) => c.defaultClub?.type !== 'wedge')
  const visibleWedges = visible.filter((c) => c.defaultClub?.type === 'wedge')

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Club Distances</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-zinc-100">
          {visibleNonWedges.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Tap a club to add distances.
            </p>
          )}
          {visibleNonWedges.map((club) => (
            <ClubRow
              key={club.id}
              club={club}
              onEdit={(c) => setEditing({ club: c, swingType: 'full' })}
            />
          ))}
          {hidden.length > 0 && (
            <div className="pt-3">
              <button
                onClick={() => setShowHidden((v) => !v)}
                className="text-xs text-muted-foreground underline"
              >
                {showHidden ? 'Hide' : 'Show'} {hidden.length} hidden club{hidden.length !== 1 ? 's' : ''}
              </button>
              {showHidden &&
                hidden.map((club) => (
                  <div key={club.id} className="py-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {club.customName || club.defaultClub?.name}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => toggleClubHidden(club.id, false)}
                    >
                      Unhide
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WedgeGrid
        wedges={visibleWedges}
        onEdit={(club, swingType) => setEditing({ club, swingType })}
      />

      {editing && (
        <EditClubModal
          club={editing.club}
          initialSwingType={editing.swingType}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
