'use client'

import { useState, useRef, useTransition } from 'react'
import { deletePracticePlan } from '@/app/actions/admin'
import { reorderPracticePlans } from '@/app/actions/practice'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GripVertical } from 'lucide-react'

type Plan = {
  id: number
  title: string
  theme: string | null
  focusArea: string | null
  totalDurationMinutes: number
  blocks: { id: number; blockName: string }[]
}

export default function AdminPlanList({ plans: initialPlans }: { plans: Plan[] }) {
  const [plans, setPlans] = useState(initialPlans)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [reordering, startReorder] = useTransition()
  const dragIndex = useRef<number | null>(null)
  const dragOverIndex = useRef<number | null>(null)

  function handleDragStart(index: number) {
    dragIndex.current = index
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    dragOverIndex.current = index
  }

  function handleDrop() {
    const from = dragIndex.current
    const to = dragOverIndex.current
    if (from === null || to === null || from === to) return

    const reordered = [...plans]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(to, 0, moved)
    setPlans(reordered)
    dragIndex.current = null
    dragOverIndex.current = null

    startReorder(() => reorderPracticePlans(reordered.map((p) => p.id)))
  }

  if (plans.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No practice plans yet. Create one above.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Existing Plans ({plans.length})
        </h2>
        {reordering && (
          <span className="text-xs text-muted-foreground">Saving order…</span>
        )}
      </div>
      {plans.map((plan, index) => (
        <Card
          key={plan.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={handleDrop}
          className="cursor-default select-none"
        >
          <CardContent className="py-3 px-3">
            <div className="flex items-start gap-2">
              <div
                className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground shrink-0 touch-none"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">{plan.title}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">{plan.totalDurationMinutes} min</Badge>
                  {plan.focusArea && <Badge variant="outline" className="text-xs">{plan.focusArea}</Badge>}
                </div>
                {plan.blocks.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.blocks.map((b) => b.blockName).join(' · ')}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-destructive hover:text-destructive h-7 px-2 shrink-0"
                disabled={deleting === plan.id}
                onClick={async () => {
                  if (!confirm(`Delete "${plan.title}"?`)) return
                  setDeleting(plan.id)
                  await deletePracticePlan(plan.id)
                  setDeleting(null)
                }}
              >
                {deleting === plan.id ? '…' : 'Delete'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <p className="text-xs text-muted-foreground pt-1">Drag the grip icon to reorder plans.</p>
    </div>
  )
}
