'use client'

import { useState, useTransition } from 'react'
import { saveClubDistance, toggleClubHidden } from '@/app/actions/clubs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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

const WEDGE_TYPES = ['wedge']

function latestDistance(distances: Distance[], swingType: string) {
  return distances.find((d) => d.swingType === swingType) ?? null
}

function ClubRow({ club, onEdit }: { club: Club; onEdit: (club: Club) => void }) {
  const [, startTransition] = useTransition()
  const name = club.customName || club.defaultClub?.name || 'Club'
  const isWedge = club.defaultClub?.type === 'wedge'
  const fullDist = latestDistance(club.distances, 'full')

  if (club.isHidden) return null

  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-sm truncate">{name}</span>
          {fullDist?.isGoTo && (
            <Badge className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">✓ Go-To</Badge>
          )}
          {fullDist?.isAvoid && (
            <Badge className="bg-red-100 text-red-800 text-[10px] px-1.5 py-0">✗ Avoid</Badge>
          )}
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
        <div className="mt-1 text-sm text-muted-foreground space-y-0.5">
          <div className="flex gap-4 flex-wrap">
            {fullDist.carryYards && (
              <span>Carry <strong className="text-foreground">{fullDist.carryYards}y</strong></span>
            )}
            {fullDist.totalYards && (
              <span>Total <strong className="text-foreground">{fullDist.totalYards}y</strong></span>
            )}
            {fullDist.typicalMiss && (
              <span>Miss: <strong className="text-foreground">{fullDist.typicalMiss}</strong></span>
            )}
          </div>
          {isWedge && (
            <div className="flex gap-3 text-xs mt-1">
              {(['three_quarter', 'half', 'quarter'] as const).map((swing) => {
                const d = latestDistance(club.distances, swing)
                return d?.carryYards ? (
                  <span key={swing}>
                    {SWING_LABELS[swing]}: <strong className="text-foreground">{d.carryYards}y</strong>
                  </span>
                ) : null
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-0.5">No distances logged yet</p>
      )}
    </div>
  )
}

function EditClubModal({
  club,
  onClose,
}: {
  club: Club
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [swingType, setSwingType] = useState('full')
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
            <div className="space-y-1">
              <Label htmlFor="typicalMiss">Typical Miss</Label>
              <Input
                id="typicalMiss"
                name="typicalMiss"
                type="text"
                placeholder="e.g. fade right"
                defaultValue={existing?.typicalMiss ?? ''}
                className="h-11"
              />
            </div>
            {swingType === 'full' && (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="isGoTo"
                    value="true"
                    defaultChecked={existing?.isGoTo ?? false}
                    className="accent-[#FFD700] w-4 h-4"
                  />
                  Go-To club
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    name="isAvoid"
                    value="true"
                    defaultChecked={existing?.isAvoid ?? false}
                    className="accent-[#FFD700] w-4 h-4"
                  />
                  Avoid
                </label>
              </div>
            )}
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
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [showHidden, setShowHidden] = useState(false)
  const visible = clubs.filter((c) => !c.isHidden)
  const hidden = clubs.filter((c) => c.isHidden)

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Club Distances</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-zinc-100">
          {visible.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Tap a club to add distances.
            </p>
          )}
          {visible.map((club) => (
            <ClubRow key={club.id} club={club} onEdit={setEditingClub} />
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

      {editingClub && (
        <EditClubModal club={editingClub} onClose={() => setEditingClub(null)} />
      )}
    </>
  )
}
