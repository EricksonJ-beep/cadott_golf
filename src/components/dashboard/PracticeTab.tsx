import Link from 'next/link'
import { getPracticePlans } from '@/app/actions/practice'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function PracticeTab() {
  const plans = await getPracticePlans()

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <span className="text-5xl">📋</span>
        <h2 className="text-xl font-bold">Practice Plans</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          No practice plans yet. Your coach will add them soon.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Practice Plans</h2>
      <div className="space-y-3">
        {plans.map((plan) => (
          <Link key={plan.id} href={`/practice/${plan.id}`}>
            <Card className="active:bg-zinc-50 transition-colors cursor-pointer hover:border-[#FFD700]">
              <CardContent className="py-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight">{plan.title}</p>
                    {plan.focusArea && (
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.focusArea}</p>
                    )}
                    {plan.theme && (
                      <p className="text-xs text-muted-foreground">{plan.theme}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {plan.totalDurationMinutes} min
                  </Badge>
                </div>
                {plan.blocks.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {plan.blocks.length} block{plan.blocks.length !== 1 ? 's' : ''} · {plan.blocks.map((b) => b.blockName).join(', ')}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
