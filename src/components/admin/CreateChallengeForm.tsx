'use client'

import { useActionState, useState } from 'react'
import { createChallenge } from '@/app/actions/challenges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function CreateChallengeForm() {
  const [error, action, pending] = useActionState(createChallenge, null)
  const [open, setOpen] = useState(false)
  const [scoringType, setScoringType] = useState<string>('score_out_of')

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
      >
        + New Challenge
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Create Challenge</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={async (fd) => {
            const res = await action(fd)
            if (res === null) setOpen(false)
          }}
          className="space-y-3"
        >
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="10 from 5 feet" className="h-11" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="type">Type</Label>
              <Select name="type" defaultValue="range">
                <SelectTrigger id="type" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="range">Range</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="putting">
                <SelectTrigger id="category" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="putting">Putting</SelectItem>
                  <SelectItem value="chipping">Chipping</SelectItem>
                  <SelectItem value="bunker">Bunker</SelectItem>
                  <SelectItem value="driving">Driving</SelectItem>
                  <SelectItem value="approach">Approach</SelectItem>
                  <SelectItem value="wedges">Wedges</SelectItem>
                  <SelectItem value="course_stats">Course Stats</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="scoringType">Scoring</Label>
            <Select
              name="scoringType"
              value={scoringType}
              onValueChange={(v) => setScoringType(v ?? 'score_out_of')}
            >
              <SelectTrigger id="scoringType" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score_out_of">Score out of (e.g. 8/10)</SelectItem>
                <SelectItem value="makes_in_a_row">Makes in a row</SelectItem>
                <SelectItem value="count">Count (longest drive, etc.)</SelectItem>
                <SelectItem value="pass_fail">Pass / Fail</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scoringType === 'score_out_of' && (
            <div className="space-y-1">
              <Label htmlFor="maxScore">Max Score (out of)</Label>
              <Input
                id="maxScore"
                name="maxScore"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="10"
                className="h-11"
              />
            </div>
          )}

          {scoringType === 'count' && (
            <div className="space-y-1">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" placeholder="yards, balls, etc." className="h-11" />
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              placeholder="How to perform this challenge…"
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
              {pending ? 'Creating…' : 'Create'}
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
