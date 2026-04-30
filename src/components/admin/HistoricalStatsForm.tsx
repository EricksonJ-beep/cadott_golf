'use client'

import { useActionState, useState } from 'react'
import { upsertHistoricalStats, deleteHistoricalStats } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Player = { id: number; name: string; role: string }
type StatRow = {
  id: number
  season: number
  holesPlayed: number
  roundsPlayed: number | null
  lowestScore: number | null
  averageScore: number | null
  birdies: number | null
  eagles: number | null
  pars: number | null
  bogeys: number | null
  doubleBogeys: number | null
  notes: string | null
}

type Props = {
  players: Player[]
  initialStats: StatRow[]
  initialUserId: number | null
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)

export default function HistoricalStatsForm({ players, initialStats, initialUserId }: Props) {
  const [error, action, pending] = useActionState(upsertHistoricalStats, null)
  const selectedUserId = initialUserId ?? (players[0]?.id ?? 0)
  const [holes, setHoles] = useState<9 | 18>(9)
  const [season, setSeason] = useState(CURRENT_YEAR - 1)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const existing = initialStats.find((s) => s.season === season && s.holesPlayed === holes)

  function handlePlayerChange(id: number) {
    window.location.href = `/admin/history?userId=${id}`
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this season row?')) return
    setDeletingId(id)
    await deleteHistoricalStats(id)
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Player selector */}
      <div className="space-y-1">
        <Label htmlFor="playerSelect">Player</Label>
        <select
          id="playerSelect"
          value={selectedUserId}
          onChange={(e) => handlePlayerChange(Number(e.target.value))}
          className="w-full h-11 rounded-md border bg-white px-3 text-sm"
        >
          {players.filter((p) => p.role === 'player').map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Entry form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Add / Update Season Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <input type="hidden" name="userId" value={selectedUserId} />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Season Year</Label>
                <select
                  name="season"
                  value={season}
                  onChange={(e) => setSeason(Number(e.target.value))}
                  className="w-full h-11 rounded-md border bg-white px-3 text-sm"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Holes</Label>
                <div className="flex gap-2">
                  {([9, 18] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setHoles(n)}
                      className={`flex-1 h-11 rounded-lg text-sm font-medium border transition-colors ${
                        holes === n
                          ? 'bg-[#FFD700] border-[#FFD700] text-black'
                          : 'border-zinc-200 text-muted-foreground'
                      }`}
                    >
                      {n}-hole
                    </button>
                  ))}
                </div>
                <input type="hidden" name="holesPlayed" value={holes} />
              </div>
            </div>

            {existing && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                A row for {season} / {holes}-hole already exists — saving will overwrite it.
              </p>
            )}

            <div key={`${season}-${holes}`} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Rounds Played" name="roundsPlayed" defaultValue={existing?.roundsPlayed} />
                <NumberField label="Lowest Score" name="lowestScore" defaultValue={existing?.lowestScore} />
                <NumberField label="Average Score" name="averageScore" defaultValue={existing?.averageScore} step="0.01" />
                <NumberField label="Birdies" name="birdies" defaultValue={existing?.birdies} />
                <NumberField label="Eagles" name="eagles" defaultValue={existing?.eagles} />
                <NumberField label="Pars" name="pars" defaultValue={existing?.pars} />
                <NumberField label="Bogeys" name="bogeys" defaultValue={existing?.bogeys} />
                <NumberField label="Doubles+" name="doubleBogeys" defaultValue={existing?.doubleBogeys} />
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="e.g. 6 matches played, missed 2 with illness"
                  defaultValue={existing?.notes ?? ''}
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={pending}
              className="w-full h-11 bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
            >
              {pending ? 'Saving…' : existing ? 'Update Season' : 'Save Season'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing rows */}
      {initialStats.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Saved Seasons</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {initialStats.map((row) => (
              <div key={row.id} className="py-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{row.season} · {row.holesPlayed}-hole</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                    {row.roundsPlayed != null && <span>{row.roundsPlayed} rounds</span>}
                    {row.lowestScore != null && <span>Low: {row.lowestScore}</span>}
                    {row.averageScore != null && <span>Avg: {row.averageScore.toFixed(2)}</span>}
                    {row.eagles != null && row.eagles > 0 && <span>🦅 {row.eagles}</span>}
                    {row.birdies != null && <span>🐦 {row.birdies}</span>}
                    {row.pars != null && <span>⬜ {row.pars} pars</span>}
                  </div>
                  {row.notes && <p className="text-xs text-zinc-500 mt-1">{row.notes}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(row.id)}
                  disabled={deletingId === row.id}
                  className="text-xs text-red-500 hover:text-red-700 shrink-0 mt-0.5"
                >
                  {deletingId === row.id ? '…' : 'Remove'}
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function NumberField({
  label, name, defaultValue, step,
}: {
  label: string
  name: string
  defaultValue?: number | null
  step?: string
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type="number"
        inputMode="decimal"
        step={step ?? '1'}
        min="0"
        defaultValue={defaultValue ?? ''}
        placeholder="—"
        className="h-11"
      />
    </div>
  )
}
