'use client'

import { useActionState, useMemo, useState } from 'react'
import { saveRound } from '@/app/actions/rounds'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

type Hole = {
  holeNumber: number
  par: number
  score: number
  fairwayHit: boolean | null
  gir: boolean
  putts: number
}

function defaultHoles(count: number): Hole[] {
  return Array.from({ length: count }, (_, i) => ({
    holeNumber: i + 1,
    par: 4,
    score: 4,
    fairwayHit: null,
    gir: false,
    putts: 2,
  }))
}

export default function RoundForm() {
  const [error, action, pending] = useActionState(saveRound, null)
  const [holesCount, setHolesCount] = useState<9 | 18>(18)
  const [holes, setHoles] = useState<Hole[]>(defaultHoles(18))

  function changeHolesCount(n: 9 | 18) {
    setHolesCount(n)
    setHoles(defaultHoles(n))
  }

  function update<K extends keyof Hole>(idx: number, key: K, value: Hole[K]) {
    setHoles((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [key]: value }
      // If switching to par 3, fairwayHit becomes N/A
      if (key === 'par' && value === 3) next[idx].fairwayHit = null
      return next
    })
  }

  const totals = useMemo(
    () => ({
      score: holes.reduce((s, h) => s + h.score, 0),
      par: holes.reduce((s, h) => s + h.par, 0),
      putts: holes.reduce((s, h) => s + h.putts, 0),
    }),
    [holes],
  )

  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={action} className="space-y-4 pb-24">
      <input type="hidden" name="holes" value={JSON.stringify(holes)} />
      <input type="hidden" name="holesPlayed" value={holesCount} />

      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="courseName">Course</Label>
            <Input
              id="courseName"
              name="courseName"
              required
              placeholder="Whispering Pines"
              className="h-12 text-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={today}
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-1">
              <Label>Holes</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={holesCount === 9 ? 'default' : 'outline'}
                  className={holesCount === 9 ? 'flex-1 bg-[#FFD700] text-black hover:bg-[#e6c200]' : 'flex-1'}
                  onClick={() => changeHolesCount(9)}
                >
                  9
                </Button>
                <Button
                  type="button"
                  variant={holesCount === 18 ? 'default' : 'outline'}
                  className={holesCount === 18 ? 'flex-1 bg-[#FFD700] text-black hover:bg-[#e6c200]' : 'flex-1'}
                  onClick={() => changeHolesCount(18)}
                >
                  18
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="grid grid-cols-[28px_56px_56px_44px_44px_56px] gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
            <span>#</span>
            <span>Par</span>
            <span>Score</span>
            <span className="text-center">Fwy</span>
            <span className="text-center">GIR</span>
            <span>Putts</span>
          </div>
          <div className="divide-y">
            {holes.map((h, i) => (
              <HoleRow
                key={i}
                hole={h}
                onChange={(key, value) => update(i, key, value)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="weatherNotes">Weather (optional)</Label>
            <Input
              id="weatherNotes"
              name="weatherNotes"
              placeholder="Sunny, light wind"
              className="h-11"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="freeTextNotes">Notes (optional)</Label>
            <Textarea
              id="freeTextNotes"
              name="freeTextNotes"
              rows={3}
              placeholder="Anything memorable from the round…"
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t safe-area-pb">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="text-sm">
            <div className="font-semibold tabular-nums">
              {totals.score} <span className="text-muted-foreground font-normal">({totals.score - totals.par >= 0 ? '+' : ''}{totals.score - totals.par})</span>
            </div>
            <div className="text-[11px] text-muted-foreground tabular-nums">
              Par {totals.par} · {totals.putts} putts
            </div>
          </div>
          <Button
            type="submit"
            disabled={pending}
            className="flex-1 h-12 bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
          >
            {pending ? 'Saving…' : 'Save Round'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function HoleRow({
  hole,
  onChange,
}: {
  hole: Hole
  onChange: <K extends keyof Hole>(key: K, value: Hole[K]) => void
}) {
  const diff = hole.score - hole.par
  const diffColor =
    diff <= -2 ? 'text-amber-600 font-bold'
    : diff === -1 ? 'text-red-600 font-semibold'
    : diff === 0 ? 'text-zinc-900'
    : 'text-zinc-500'

  return (
    <div className="grid grid-cols-[28px_56px_56px_44px_44px_56px] gap-1.5 items-center py-1.5">
      <span className="text-sm font-semibold tabular-nums">{hole.holeNumber}</span>

      <select
        value={hole.par}
        onChange={(e) => onChange('par', Number(e.target.value))}
        className="h-9 rounded border bg-white text-sm px-1 tabular-nums"
      >
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>5</option>
        <option value={6}>6</option>
      </select>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange('score', Math.max(1, hole.score - 1))}
          className="w-6 h-9 rounded bg-zinc-100 text-sm leading-none"
        >−</button>
        <span className={`flex-1 text-center text-sm tabular-nums ${diffColor}`}>{hole.score}</span>
        <button
          type="button"
          onClick={() => onChange('score', Math.min(15, hole.score + 1))}
          className="w-6 h-9 rounded bg-zinc-100 text-sm leading-none"
        >+</button>
      </div>

      {hole.par === 3 ? (
        <span className="text-center text-xs text-muted-foreground">—</span>
      ) : (
        <button
          type="button"
          onClick={() =>
            onChange(
              'fairwayHit',
              hole.fairwayHit === null ? true : hole.fairwayHit ? false : null,
            )
          }
          className={`h-9 rounded text-xs font-semibold ${
            hole.fairwayHit === true
              ? 'bg-green-100 text-green-700'
              : hole.fairwayHit === false
              ? 'bg-red-100 text-red-700'
              : 'bg-zinc-100 text-zinc-400'
          }`}
        >
          {hole.fairwayHit === true ? '✓' : hole.fairwayHit === false ? '✗' : '·'}
        </button>
      )}

      <button
        type="button"
        onClick={() => onChange('gir', !hole.gir)}
        className={`h-9 rounded text-xs font-semibold ${
          hole.gir ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-400'
        }`}
      >
        {hole.gir ? '✓' : '·'}
      </button>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange('putts', Math.max(0, hole.putts - 1))}
          className="w-6 h-9 rounded bg-zinc-100 text-sm leading-none"
        >−</button>
        <span className="flex-1 text-center text-sm tabular-nums">{hole.putts}</span>
        <button
          type="button"
          onClick={() => onChange('putts', Math.min(10, hole.putts + 1))}
          className="w-6 h-9 rounded bg-zinc-100 text-sm leading-none"
        >+</button>
      </div>
    </div>
  )
}
