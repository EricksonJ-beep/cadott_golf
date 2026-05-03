'use client'

import { useActionState, useState } from 'react'
import { saveCoachGuideHole, type CoachGuide } from '@/app/actions/course-guide'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  courseId: string
  holeNumber: number
  par: number | null
  yardage: number | null
  guide?: CoachGuide
}

const FIELDS: { name: keyof CoachGuide; label: string; placeholder: string }[] = [
  { name: 'teeShotNotes',     label: 'Tee shot',         placeholder: 'Club + landing zone (e.g. "3-wood up the right side, avoid bunker left")' },
  { name: 'approachNotes',    label: 'Approach',         placeholder: 'Club + target (e.g. "Play to fat part of green, miss right is dead")' },
  { name: 'aroundGreenNotes', label: 'Around the green', placeholder: 'Chip / pitch / bunker tips' },
  { name: 'missAvoidNotes',   label: 'Avoid / miss',     placeholder: 'Where NOT to miss — water, OB, penalty areas' },
  { name: 'generalStrategy',  label: 'General strategy', placeholder: 'Overall plan: aggressive / conservative, bail-out, etc.' },
]

export default function CoachGuideHoleForm({ courseId, holeNumber, par, yardage, guide }: Props) {
  const [error, action, pending] = useActionState(saveCoachGuideHole, null)
  const [open, setOpen] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(guide?.updatedAt ?? null)

  const filledCount = FIELDS.filter((f) => {
    const v = guide?.[f.name]
    return typeof v === 'string' && v.trim().length > 0
  }).length

  return (
    <div className="rounded-xl ring-1 ring-foreground/10 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold">Hole {holeNumber}</span>
          {par != null && <span className="text-xs text-muted-foreground">Par {par}</span>}
          {yardage != null && <span className="text-xs text-muted-foreground">· {yardage}y</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            {filledCount}/5 filled
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Close' : guide ? 'Edit' : 'Add notes'}
          </Button>
        </div>
      </div>

      {!open && filledCount > 0 && (
        <div className="space-y-2 text-sm">
          {FIELDS.map((f) => {
            const v = guide?.[f.name]
            if (typeof v !== 'string' || v.trim().length === 0) return null
            return (
              <div key={f.name as string}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{v}</p>
              </div>
            )
          })}
        </div>
      )}

      {open && (
        <form
          action={async (fd) => {
            const result = await action(fd)
            if (result === null) {
              setSavedAt(new Date())
              setOpen(false)
            }
          }}
          className="space-y-3"
        >
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="holeNumber" value={holeNumber} />

          {FIELDS.map((f) => (
            <div key={f.name as string} className="space-y-1">
              <Label htmlFor={`${f.name}-${holeNumber}`} className="text-xs">
                {f.label}
              </Label>
              <Textarea
                id={`${f.name}-${holeNumber}`}
                name={f.name as string}
                rows={2}
                defaultValue={(guide?.[f.name] as string) ?? ''}
                placeholder={f.placeholder}
                className="text-sm"
              />
            </div>
          ))}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={pending}
              className="bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
            >
              {pending ? 'Saving…' : 'Save hole'}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {savedAt && !open && (
        <p className="text-[10px] text-muted-foreground">
          Last updated {savedAt.toLocaleString(undefined, {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
          })}
        </p>
      )}
    </div>
  )
}
