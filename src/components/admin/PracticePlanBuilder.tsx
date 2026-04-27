'use client'

import { useActionState, useState } from 'react'
import { savePracticePlan } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Block = {
  blockName: string
  startMinute: number
  durationMinutes: number
  drillDescription: string
}

const emptyBlock = (): Block => ({ blockName: '', startMinute: 0, durationMinutes: 15, drillDescription: '' })

export default function PracticePlanBuilder() {
  const [open, setOpen] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([emptyBlock()])
  const [error, formAction, pending] = useActionState(savePracticePlan, null)

  function addBlock() {
    setBlocks((prev) => {
      const last = prev[prev.length - 1]
      const nextStart = last ? last.startMinute + last.durationMinutes : 0
      return [...prev, { ...emptyBlock(), startMinute: nextStart }]
    })
  }

  function updateBlock(i: number, key: keyof Block, value: string | number) {
    setBlocks((prev) => prev.map((b, idx) => idx === i ? { ...b, [key]: value } : b))
  }

  function removeBlock(i: number) {
    setBlocks((prev) => prev.filter((_, idx) => idx !== i))
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold">
        + New Practice Plan
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">New Practice Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={async (fd) => {
            fd.set('blocks', JSON.stringify(blocks))
            await formAction(fd)
            if (!error) {
              setOpen(false)
              setBlocks([emptyBlock()])
            }
          }}
          className="space-y-4"
        >
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required placeholder="Tuesday Range Session" className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="totalDuration">Total Duration (min) *</Label>
                <Input id="totalDuration" name="totalDuration" type="number" inputMode="numeric" required placeholder="90" className="h-11" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="focusArea">Focus Area</Label>
                <Input id="focusArea" name="focusArea" placeholder="Short Game" className="h-11" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="theme">Theme</Label>
              <Input id="theme" name="theme" placeholder="Pre-tournament sharpener" className="h-11" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="equipmentList">Equipment Needed</Label>
              <Input id="equipmentList" name="equipmentList" placeholder="Wedges, putter, 20 balls" className="h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time Blocks</Label>
            {blocks.map((block, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2 bg-zinc-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Block {i + 1}</span>
                  {blocks.length > 1 && (
                    <button type="button" onClick={() => removeBlock(i)} className="text-xs text-destructive">
                      Remove
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>Block Name</Label>
                  <Input
                    value={block.blockName}
                    onChange={(e) => updateBlock(i, 'blockName', e.target.value)}
                    placeholder="Warm-up / Putting / Wedges…"
                    className="h-10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Start (min)</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={block.startMinute}
                      onChange={(e) => updateBlock(i, 'startMinute', Number(e.target.value))}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={block.durationMinutes}
                      onChange={(e) => updateBlock(i, 'durationMinutes', Number(e.target.value))}
                      className="h-10"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Drill Description</Label>
                  <Textarea
                    value={block.drillDescription}
                    onChange={(e) => updateBlock(i, 'drillDescription', e.target.value)}
                    placeholder="Describe the drills for this block…"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addBlock}>
              + Add Block
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending} className="bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold">
              {pending ? 'Saving…' : 'Save Plan'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
