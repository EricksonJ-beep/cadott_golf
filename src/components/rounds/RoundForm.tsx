'use client'

import { useActionState, useMemo, useState } from 'react'
import { saveRound, updateRound } from '@/app/actions/rounds'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  COURSE_SCORECARDS,
  DEFAULT_TEE_COLOR,
  TEE_OPTIONS,
  type TeeColor,
} from '@/lib/course-scorecards'

type Hole = {
  holeNumber: number
  par: number
  score: number
  fairwayHit: boolean | null
  gir: boolean
  putts: number
}

type InitialData = {
  roundId: number
  courseName: string
  date: string
  holesPlayed: 9 | 18
  holes: Hole[]
  weatherNotes: string | null
  freeTextNotes: string | null
}

type RoundSegment = 'front9' | 'back9' | 'full18'

function holesPlayedFromSegment(segment: RoundSegment): 9 | 18 {
  return segment === 'full18' ? 18 : 9
}

function holeStartFromSegment(segment: RoundSegment): number {
  return segment === 'back9' ? 10 : 1
}

function defaultHolesForSegment(segment: RoundSegment): Hole[] {
  const count = holesPlayedFromSegment(segment)
  const start = holeStartFromSegment(segment)
  return Array.from({ length: count }, (_, i) => ({
    holeNumber: start + i,
    par: 4,
    score: 4,
    fairwayHit: null,
    gir: false,
    putts: 2,
  }))
}

function buildTemplateHoles(parByHole: number[], segment: RoundSegment): Hole[] {
  const selectedPars =
    segment === 'full18'
      ? parByHole.slice(0, 18)
      : segment === 'back9'
      ? parByHole.slice(9, 18)
      : parByHole.slice(0, 9)

  const start = holeStartFromSegment(segment)

  return selectedPars.map((par, idx) => ({
    holeNumber: start + idx,
    par,
    score: par,
    fairwayHit: par === 3 ? null : false,
    gir: false,
    putts: 2,
  }))
}

function segmentValues(values: number[], segment: RoundSegment): number[] {
  if (segment === 'full18') return values.slice(0, 18)
  if (segment === 'back9') return values.slice(9, 18)
  return values.slice(0, 9)
}

function getInitialSegment(initialData?: InitialData): RoundSegment {
  if (!initialData) return 'full18'
  if (initialData.holesPlayed === 18) return 'full18'
  const firstHole = initialData.holes[0]?.holeNumber ?? 1
  return firstHole >= 10 ? 'back9' : 'front9'
}

export default function RoundForm({ initialData }: { initialData?: InitialData }) {
  const isEdit = !!initialData
  const boundAction = isEdit ? updateRound.bind(null, initialData!.roundId) : saveRound
  const [error, action, pending] = useActionState(boundAction, null)
  const initialSegment = getInitialSegment(initialData)
  const [courseName, setCourseName] = useState(initialData?.courseName ?? '')
  const [selectedPresetId, setSelectedPresetId] = useState<string>('')
  const [teeColor, setTeeColor] = useState<TeeColor>(DEFAULT_TEE_COLOR)
  const [roundSegment, setRoundSegment] = useState<RoundSegment>(initialSegment)
  const [holes, setHoles] = useState<Hole[]>(initialData?.holes ?? defaultHolesForSegment(initialSegment))

  const holesCount = holesPlayedFromSegment(roundSegment)

  const selectedPreset = useMemo(
    () => COURSE_SCORECARDS.find((course) => course.id === selectedPresetId) ?? null,
    [selectedPresetId],
  )

  const teeYardages = useMemo(() => {
    if (!selectedPreset) return null
    const tee = selectedPreset.yardageByTee[teeColor]
    if (!tee) return null
    return segmentValues(tee, roundSegment)
  }, [roundSegment, selectedPreset, teeColor])

  const segmentOptions = useMemo(() => {
    if (!selectedPreset) {
      return [
        { value: 'front9' as RoundSegment, label: 'Front 9' },
        { value: 'back9' as RoundSegment, label: 'Back 9' },
        { value: 'full18' as RoundSegment, label: '18 holes' },
      ]
    }

    if (selectedPreset.holes === 9) {
      return [{ value: 'front9' as RoundSegment, label: '9 holes' }]
    }

    return [
      { value: 'front9' as RoundSegment, label: 'Front 9' },
      { value: 'back9' as RoundSegment, label: 'Back 9' },
      { value: 'full18' as RoundSegment, label: '18 holes' },
    ]
  }, [selectedPreset])

  function applyPresetValues(presetId: string, segment: RoundSegment) {
    const preset = COURSE_SCORECARDS.find((course) => course.id === presetId)
    if (!preset) return

    const requiredLength = segment === 'full18' ? 18 : segment === 'back9' ? 18 : 9
    if (preset.parByHole && preset.parByHole.length >= requiredLength) {
      setHoles(buildTemplateHoles(preset.parByHole, segment))
      return
    }
    setHoles(defaultHolesForSegment(segment))
  }

  function changeSegment(nextSegment: RoundSegment) {
    setRoundSegment(nextSegment)
    if (selectedPresetId) {
      applyPresetValues(selectedPresetId, nextSegment)
      return
    }
    setHoles(defaultHolesForSegment(nextSegment))
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
      <input type="hidden" name="teeColor" value={teeColor} />
      <input type="hidden" name="roundSegment" value={roundSegment} />

      <Card>
        <CardContent className="pt-5 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="coursePreset">Course Preset (optional)</Label>
            <select
              id="coursePreset"
              value={selectedPresetId}
              onChange={(e) => {
                const presetId = e.target.value
                setSelectedPresetId(presetId)
                if (!presetId) return
                const preset = COURSE_SCORECARDS.find((course) => course.id === presetId)
                if (!preset) return
                setCourseName(preset.name)
                const nextSegment = preset.holes === 9 ? 'front9' : 'full18'
                setRoundSegment(nextSegment)
                applyPresetValues(presetId, nextSegment)
              }}
              className="w-full h-12 rounded-md border bg-white px-3 text-sm"
            >
              <option value="">Custom course (manual)</option>
              {COURSE_SCORECARDS.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.city})
                </option>
              ))}
            </select>
            {selectedPreset?.sourceUrl && (
              <p className="text-xs text-muted-foreground">
                Source: <a href={selectedPreset.sourceUrl} target="_blank" rel="noreferrer" className="underline">scorecard</a>
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="courseName">Course</Label>
            <Input
              id="courseName"
              name="courseName"
              required
              placeholder="Whispering Pines"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="h-12 text-base"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={initialData?.date ?? today}
                required
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="teeColor">Tee</Label>
              <select
                id="teeColor"
                value={teeColor}
                onChange={(e) => {
                  const next = e.target.value as TeeColor
                  setTeeColor(next)
                }}
                className="w-full h-12 rounded-md border bg-white px-3 text-sm"
              >
                {TEE_OPTIONS.map((tee) => (
                  <option key={tee.value} value={tee.value}>{tee.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="roundSegment">Play</Label>
              <select
                id="roundSegment"
                value={roundSegment}
                onChange={(e) => changeSegment(e.target.value as RoundSegment)}
                className="w-full h-12 rounded-md border bg-white px-3 text-sm"
              >
                {segmentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="grid grid-cols-[40px_56px_56px_44px_44px_56px] gap-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
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
                yardage={teeYardages?.[i] ?? null}
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
              defaultValue={initialData?.weatherNotes ?? ''}
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
              defaultValue={initialData?.freeTextNotes ?? ''}
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
            {pending ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Round'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function HoleRow({
  hole,
  yardage,
  onChange,
}: {
  hole: Hole
  yardage: number | null
  onChange: <K extends keyof Hole>(key: K, value: Hole[K]) => void
}) {
  const diff = hole.score - hole.par
  const diffColor =
    diff <= -2 ? 'text-amber-600 font-bold'
    : diff === -1 ? 'text-red-600 font-semibold'
    : diff === 0 ? 'text-zinc-900'
    : 'text-zinc-500'

  return (
    <div className="grid grid-cols-[40px_56px_56px_44px_44px_56px] gap-1.5 items-center py-1.5">
      <div>
        <div className="text-sm font-semibold tabular-nums">{hole.holeNumber}</div>
        <div className="text-[10px] text-muted-foreground tabular-nums">{yardage != null ? `${yardage}y` : '—'}</div>
      </div>

      <select
        value={hole.par}
        onChange={(e) => onChange('par', Number(e.target.value))}
        className="h-9 rounded border bg-white text-sm px-1 tabular-nums"
      >
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>5</option>
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
