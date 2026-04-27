'use client'

import { useActionState, useState } from 'react'
import { createPlayer } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CreatePlayerForm() {
  const [error, action, pending] = useActionState(createPlayer, null)
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
      >
        + Add Player
      </Button>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Add New Player</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={async (fd) => {
            await action(fd)
            if (!error) setOpen(false)
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required className="h-11" placeholder="Jane Smith" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required className="h-11" placeholder="jsmith" autoCapitalize="none" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="grade">Grade</Label>
              <Input id="grade" name="grade" type="number" inputMode="numeric" min={9} max={12} className="h-11" placeholder="10" />
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="tempPassword">Temporary Password</Label>
              <Input id="tempPassword" name="tempPassword" required className="h-11" placeholder="Cadott2026" />
              <p className="text-xs text-muted-foreground">Player will be prompted to change this on first login.</p>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending} className="bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold">
              {pending ? 'Creating…' : 'Create Account'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
