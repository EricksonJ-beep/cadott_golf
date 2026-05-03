'use client'

import { useActionState, useState } from 'react'
import { addPlayerNoteForUser } from '@/app/actions/course-guide'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  userId: number
  courseId: string
  holeNumber: number
}

export default function CoachAddPlayerNoteForm({ userId, courseId, holeNumber }: Props) {
  const [error, action, pending] = useActionState(addPlayerNoteForUser, null)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        onClick={() => setOpen(true)}
      >
        + Add note for player
      </Button>
    )
  }

  return (
    <form
      action={async (fd) => {
        const result = await action(fd)
        if (result === null) {
          setText('')
          setOpen(false)
        }
      }}
      className="space-y-2 rounded-lg bg-zinc-50 p-3"
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="holeNumber" value={holeNumber} />

      <div className="space-y-1">
        <Label htmlFor={`coach-noteText-${holeNumber}`} className="text-xs">
          Note
        </Label>
        <Textarea
          id={`coach-noteText-${holeNumber}`}
          name="noteText"
          rows={3}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="text-sm"
          autoFocus
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`coach-noteDate-${holeNumber}`} className="text-xs">
          Date (optional)
        </Label>
        <Input
          id={`coach-noteDate-${holeNumber}`}
          name="noteDate"
          type="date"
          className="h-9 text-sm"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={pending}
          className="bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
        >
          {pending ? 'Saving…' : 'Save note'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setText('')
            setOpen(false)
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
