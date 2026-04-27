'use client'

import { deletePracticePlan } from '@/app/actions/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

type Plan = {
  id: number
  title: string
  theme: string | null
  focusArea: string | null
  totalDurationMinutes: number
  blocks: { id: number; blockName: string }[]
}

export default function AdminPlanList({ plans }: { plans: Plan[] }) {
  const [deleting, setDeleting] = useState<number | null>(null)

  if (plans.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No practice plans yet. Create one above.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground">Existing Plans ({plans.length})</h2>
      {plans.map((plan) => (
        <Card key={plan.id}>
          <CardContent className="py-3 px-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
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
    </div>
  )
}
