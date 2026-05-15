'use client'

import { useState, useTransition } from 'react'
import { saveClubEdits, toggleClubHidden } from '@/app/actions/clubs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronRight } from 'lucide-react'

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

const SECTION_THEME = {
  wedges: {
    card: 'border-orange-200/90 hover:border-orange-300 shadow-[0_1px_0_rgba(0,0,0,0.03)]',
    stripe: 'from-orange-300 to-amber-200',
    title: 'text-orange-800',
  },
  clubs: {
    card: 'border-sky-200/90 hover:border-sky-300 shadow-[0_1px_0_rgba(0,0,0,0.03)]',
    stripe: 'from-sky-300 to-cyan-200',
    title: 'text-sky-800',
  },
} as const

function latestDistance(distances: Distance[], swingType: string) {
  return distances.find((d) => d.swingType === swingType) ?? null
}

function ClubRow({ club, onEdit }: { club: Club; onEdit: (club: Club) => void }) {
  const name = club.customName || club.defaultClub?.name || 'Club'
  const fullDist = latestDistance(club.distances, 'full')

  if (club.isHidden) return null

  return (
    <button
      type="button"
      onClick={() => onEdit(club)}
      className="w-full py-4 flex items-center justify-between text-left hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-base leading-tight">{name}</div>
        {fullDist && (fullDist.carryYards != null || fullDist.totalYards != null) ? (
          <div className="flex gap-4 mt-1 flex-wrap">
            {fullDist.carryYards != null && (
              <span className="text-sm text-muted-foreground">
                Carry <span className="font-bold text-foreground text-base">{fullDist.carryYards}y</span>
              </span>
            )}
            {fullDist.totalYards != null && (
              <span className="text-sm text-muted-foreground">
                Total <span className="font-bold text-foreground text-base">{fullDist.totalYards}y</span>
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-0.5">Tap to add distances</p>
        )}
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
    </button>
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
    <Card
      className={`relative overflow-hidden bg-white transition-colors ${SECTION_THEME.wedges.card}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${SECTION_THEME.wedges.stripe}`} />
      <CardHeader className="pb-2">
        <CardTitle className={`text-base ${SECTION_THEME.wedges.title}`}>Wedges</CardTitle>
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
        className="text-left text-base font-semibold truncate py-3 px-1 hover:bg-zinc-50 active:bg-zinc-100 rounded transition-colors"
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
            className={`h-12 rounded-lg text-base font-bold tabular-nums transition-colors ${
              yards !== null
                ? 'bg-zinc-100 hover:bg-zinc-200 text-foreground'
                : 'bg-zinc-50 hover:bg-zinc-100 text-muted-foreground'
            }`}
          >
            {yards !== null ? yards : '—'}
          </button>
        )
      })}
    </>
  )
}

const ALL_SWINGS = ['full', 'three_quarter', 'half', 'quarter'] as const
type SwingType = (typeof ALL_SWINGS)[number]
type SwingDraft = { carry: string; total: string }

function buildInitialDrafts(club: Club): Record<SwingType, SwingDraft> {
  const out = {} as Record<SwingType, SwingDraft>
  for (const s of ALL_SWINGS) {
    const d = latestDistance(club.distances, s)
    out[s] = {
      carry: d?.carryYards != null ? String(d.carryYards) : '',
      total: d?.totalYards != null ? String(d.totalYards) : '',
    }
  }
  return out
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
  const isWedge = club.defaultClub?.type === 'wedge'
  const [swingType, setSwingType] = useState<SwingType>(
    (ALL_SWINGS as readonly string[]).includes(initialSwingType)
      ? (initialSwingType as SwingType)
      : 'full'
  )
  const currentName = club.customName ?? club.defaultClub?.name ?? ''
  const [nameDraft, setNameDraft] = useState(currentName)
  const [drafts, setDrafts] = useState<Record<SwingType, SwingDraft>>(() =>
    buildInitialDrafts(club)
  )
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const initialDrafts = buildInitialDrafts(club)
  const nameDirty = nameDraft.trim() !== currentName.trim()
  const swingsToTrack: readonly SwingType[] = isWedge ? ALL_SWINGS : (['full'] as const)
  const distancesDirty = swingsToTrack.some(
    (s) =>
      drafts[s].carry !== initialDrafts[s].carry ||
      drafts[s].total !== initialDrafts[s].total
  )
  const dirty = nameDirty || distancesDirty

  function updateDraft(swing: SwingType, field: 'carry' | 'total', value: string) {
    setDrafts((prev) => ({ ...prev, [swing]: { ...prev[swing], [field]: value } }))
  }

  function parseYards(s: string): number | null {
    const trimmed = s.trim()
    if (trimmed === '') return null
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : null
  }

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!dirty) {
      onClose()
      return
    }
    const distances = swingsToTrack
      .filter(
        (s) =>
          drafts[s].carry !== initialDrafts[s].carry ||
          drafts[s].total !== initialDrafts[s].total
      )
      .map((s) => ({
        swingType: s,
        carryYards: parseYards(drafts[s].carry),
        totalYards: parseYards(drafts[s].total),
      }))

    startTransition(async () => {
      await saveClubEdits({
        playerClubId: club.id,
        customName: nameDirty ? nameDraft.trim() || null : undefined,
        distances,
      })
      onClose()
    })
  }

  function handleRemove() {
    startTransition(async () => {
      await toggleClubHidden(club.id, true)
      onClose()
    })
  }

  const current = drafts[swingType]

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-base truncate">{currentName || 'Club'}</h3>
          <button onClick={onClose} className="text-muted-foreground text-xl leading-none shrink-0">&times;</button>
        </div>
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="customName">Club name</Label>
            <Input
              id="customName"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder={club.defaultClub?.name ?? ''}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Rename your club (e.g. 5 Wood → 7 Wood). Leave blank to use the default.
            </p>
          </div>

          <div className="border-t pt-4 space-y-3">
            {isWedge && (
              <div className="flex gap-2">
                {ALL_SWINGS.map((s) => (
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="carryYards">Carry (yds)</Label>
                <Input
                  id="carryYards"
                  name="carryYards"
                  type="number"
                  inputMode="numeric"
                  value={current.carry}
                  onChange={(e) => updateDraft(swingType, 'carry', e.target.value)}
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
                  value={current.total}
                  onChange={(e) => updateDraft(swingType, 'total', e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
            {isWedge && (
              <p className="text-xs text-muted-foreground">
                Switch swings above to enter all yardages, then save once.
              </p>
            )}
            <Button
              type="submit"
              disabled={pending || !dirty}
              className="w-full h-11 bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save'}
            </Button>
          </div>

          <div className="border-t pt-3">
            {confirmingRemove ? (
              <div className="space-y-2">
                <p className="text-sm">
                  Remove <strong>{currentName}</strong> from your bag?
                </p>
                <p className="text-xs text-muted-foreground">
                  You can restore it later from the &quot;hidden clubs&quot; list.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleRemove}
                    disabled={pending}
                    variant="destructive"
                    className="flex-1 h-10"
                  >
                    {pending ? 'Removing…' : 'Yes, remove'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmingRemove(false)}
                    className="flex-1 h-10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingRemove(true)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove from my bag
              </button>
            )}
          </div>
        </form>
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
      <WedgeGrid
        wedges={visibleWedges}
        onEdit={(club, swingType) => setEditing({ club, swingType })}
      />

      <Card
        className={`relative overflow-hidden bg-white transition-colors ${SECTION_THEME.clubs.card}`}
      >
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${SECTION_THEME.clubs.stripe}`} />
        <CardHeader className="pb-2">
          <CardTitle className={`text-base ${SECTION_THEME.clubs.title}`}>Club Distances</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-zinc-100 px-4">
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
            <div className="pt-3 pb-1">
              <button
                onClick={() => setShowHidden((v) => !v)}
                className="text-sm text-muted-foreground underline"
              >
                {showHidden ? 'Hide' : 'Show'} {hidden.length} hidden club{hidden.length !== 1 ? 's' : ''}
              </button>
              {showHidden &&
                hidden.map((club) => (
                  <div key={club.id} className="py-3 flex items-center justify-between">
                    <span className="text-base font-medium text-muted-foreground">
                      {club.customName || club.defaultClub?.name}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 px-3 text-sm"
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
