'use client'

import { useTransition } from 'react'
import { toggleChallengeActive } from '@/app/actions/challenges'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

type Challenge = {
  id: number
  name: string
  type: 'range' | 'course'
  category: string
  scoringType: string
  maxScore: number | null
  unit: string | null
  description: string | null
  isActive: boolean
}

const CATEGORY_LABEL: Record<string, string> = {
  putting: 'Putting',
  chipping: 'Chipping',
  bunker: 'Bunker',
  driving: 'Driving',
  approach: 'Approach',
  wedges: 'Wedges',
  course_stats: 'Course Stats',
}

const SCORING_LABEL: Record<string, string> = {
  score_out_of: 'Score out of',
  makes_in_a_row: 'In a row',
  count: 'Count',
  pass_fail: 'Pass/Fail',
}

export default function ChallengeList({ challenges }: { challenges: Challenge[] }) {
  const [pending, startTransition] = useTransition()

  if (challenges.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No challenges yet. Create one above.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {challenges.map((c) => (
        <Card key={c.id} className={c.isActive ? '' : 'opacity-60'}>
          <CardContent className="py-3 px-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{c.name}</p>
                  {!c.isActive && (
                    <Badge variant="outline" className="text-[10px]">
                      Inactive
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <Badge variant="secondary" className="text-[10px]">
                    {c.type === 'range' ? 'Range' : 'Course'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {CATEGORY_LABEL[c.category]}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {SCORING_LABEL[c.scoringType]}
                    {c.scoringType === 'score_out_of' && c.maxScore ? ` ${c.maxScore}` : ''}
                    {c.scoringType === 'count' && c.unit ? ` (${c.unit})` : ''}
                  </Badge>
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {c.description}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() =>
                  startTransition(() => toggleChallengeActive(c.id, !c.isActive))
                }
                className="text-xs shrink-0"
              >
                {c.isActive ? 'Deactivate' : 'Reactivate'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
