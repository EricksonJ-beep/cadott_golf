'use client'

import { useActionState, useState } from 'react'
import { logChallengeResult } from '@/app/actions/challenges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  challengeId: number
  scoringType: 'score_out_of' | 'makes_in_a_row' | 'pass_fail' | 'count'
  maxScore: number | null
  unit: string | null
}

export default function LogResultForm({ challengeId, scoringType, maxScore, unit }: Props) {
  const [error, action, pending] = useActionState(logChallengeResult, null)
  const [open, setOpen] = useState(false)
  const [passValue, setPassValue] = useState<string>('1')

  const scoreLabel = (() => {
    switch (scoringType) {
      case 'score_out_of':   return maxScore ? `Score (out of ${maxScore})` : 'Score'
      case 'makes_in_a_row': return 'Makes in a Row'
      case 'count':          return unit ? `Count (${unit})` : 'Count'
      case 'pass_fail':      return 'Result'
      default:               return 'Score'
    }
  })()

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="w-full h-12 bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
      >
        Log Score
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Log Your Score</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={async (fd) => {
            const result = await action(fd)
            if (result === null) setOpen(false)
          }}
          className="space-y-3"
        >
          <input type="hidden" name="challengeId" value={challengeId} />

          {scoringType === 'pass_fail' ? (
            <div className="space-y-1">
              <Label>{scoreLabel}</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={passValue === '1' ? 'default' : 'outline'}
                  className={passValue === '1' ? 'flex-1 bg-[#FFD700] text-black hover:bg-[#e6c200]' : 'flex-1'}
                  onClick={() => setPassValue('1')}
                >
                  Pass
                </Button>
                <Button
                  type="button"
                  variant={passValue === '0' ? 'default' : 'outline'}
                  className={passValue === '0' ? 'flex-1 bg-zinc-800 text-white hover:bg-zinc-700' : 'flex-1'}
                  onClick={() => setPassValue('0')}
                >
                  Fail
                </Button>
              </div>
              <input type="hidden" name="score" value={passValue} />
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="score">{scoreLabel}</Label>
              <Input
                id="score"
                name="score"
                type="number"
                inputMode="numeric"
                min={0}
                max={maxScore ?? undefined}
                required
                className="h-12 text-base"
                autoFocus
              />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Conditions, club used, etc."
              className="text-sm"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={pending}
              className="flex-1 h-11 bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
            >
              {pending ? 'Saving…' : 'Save Score'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
