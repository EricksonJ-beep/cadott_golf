'use client'

import { useActionState, useState } from 'react'
import { updatePlayerNote, deletePlayerNote } from '@/app/actions/course-guide'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  id: number
  noteText: string
  noteDate: string | null
  updatedAt: Date
  canEdit: boolean
}

function formatDate(d: string | null): string | null {
  if (!d) return null
  const dt = new Date(d + 'T00:00:00')
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function PlayerNoteItem({ id, noteText, noteDate, updatedAt, canEdit }: Props) {
  const [error, action, pending] = useActionState(updatePlayerNote, null)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(noteText)
  const [date, setDate] = useState(noteDate ?? '')

  if (!editing) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-3 space-y-1.5">
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{noteText}</p>
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>
            {noteDate
              ? formatDate(noteDate)
              : `Added ${updatedAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
          </span>
          {canEdit && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-zinc-600 hover:text-black underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this note?')) deletePlayerNote(id)
                }}
                className="text-destructive hover:underline"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <form
      action={async (fd) => {
        const result = await action(fd)
        if (result === null) setEditing(false)
      }}
      className="rounded-lg bg-zinc-50 p-3 space-y-2"
    >
      <input type="hidden" name="id" value={id} />

      <div className="space-y-1">
        <Label htmlFor={`edit-noteText-${id}`} className="text-xs">
          Note
        </Label>
        <Textarea
          id={`edit-noteText-${id}`}
          name="noteText"
          rows={3}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="text-sm"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`edit-noteDate-${id}`} className="text-xs">
          Date (optional)
        </Label>
        <Input
          id={`edit-noteDate-${id}`}
          name="noteDate"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
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
          {pending ? 'Saving…' : 'Save'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setText(noteText)
            setDate(noteDate ?? '')
            setEditing(false)
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
