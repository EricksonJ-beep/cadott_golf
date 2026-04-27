import { getPracticePlan } from '@/app/actions/practice'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type Props = { params: Promise<{ id: string }> }

export default async function PracticePlanPage({ params }: Props) {
  const { id } = await params
  const plan = await getPracticePlan(Number(id))
  if (!plan) notFound()

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-40 bg-black text-white h-14 flex items-center px-4 gap-3">
        <Link href="/dashboard?tab=practice" className="text-[#FFD700] text-sm font-medium">
          ← Back
        </Link>
        <span className="text-sm font-medium truncate">{plan.title}</span>
      </header>

      <div className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-xl font-bold">{plan.title}</h1>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <Badge variant="secondary">{plan.totalDurationMinutes} min</Badge>
            {plan.focusArea && <Badge variant="outline">{plan.focusArea}</Badge>}
            {plan.theme && <Badge variant="outline">{plan.theme}</Badge>}
          </div>
          {plan.equipmentList && (
            <p className="text-sm text-muted-foreground mt-2">
              <strong>Equipment:</strong> {plan.equipmentList}
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          {plan.blocks.map((block, i) => (
            <div key={block.id} className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-sm">{block.blockName}</h3>
                <span className="text-xs text-muted-foreground">
                  {block.startMinute}–{block.startMinute + block.durationMinutes} min
                  <span className="ml-1 text-[#7a6200] font-medium">({block.durationMinutes} min)</span>
                </span>
              </div>
              {block.drillDescription && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {block.drillDescription}
                </p>
              )}
              {i < plan.blocks.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
