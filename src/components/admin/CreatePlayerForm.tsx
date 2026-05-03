'use client'

import { useActionState, useState } from 'react'
import { createPlayer } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Role = 'player' | 'coach'

export default function CreatePlayerForm() {
  const [error, action, pending] = useActionState(createPlayer, null)
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<Role>('player')

  if (!open) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={() => {
            setRole('player')
            setOpen(true)
          }}
          className="bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
        >
          + Add Player
        </Button>
        <Button
          onClick={() => {
            setRole('coach')
            setOpen(true)
          }}
          variant="outline"
        >
          + Add Coach
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Add New {role === 'coach' ? 'Coach' : 'Player'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={async (fd) => {
            fd.set('role', role)
            await action(fd)
            if (!error) setOpen(false)
          }}
          className="space-y-3"
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                role === 'player'
                  ? 'bg-[#FFD700] border-[#FFD700] text-black'
                  : 'border-zinc-200 text-muted-foreground'
              }`}
            >
              Player
            </button>
            <button
              type="button"
              onClick={() => setRole('coach')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                role === 'coach'
                  ? 'bg-[#FFD700] border-[#FFD700] text-black'
                  : 'border-zinc-200 text-muted-foreground'
              }`}
            >
              Coach
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required className="h-11" placeholder="Jane Smith" />
            </div>
            <div className={role === 'coach' ? 'space-y-1 col-span-2' : 'space-y-1'}>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" required className="h-11" placeholder="jsmith" autoCapitalize="none" />
            </div>
            {role === 'player' && (
              <div className="space-y-1">
                <Label htmlFor="grade">Grade</Label>
                <Input id="grade" name="grade" type="number" inputMode="numeric" min={9} max={12} className="h-11" placeholder="10" />
              </div>
            )}
            <div className="col-span-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Temporary password will be <span className="font-mono font-semibold text-zinc-900">cadottgolf</span>.
                {' '}{role === 'coach' ? 'Coach' : 'Player'} will be prompted to change it on first login.
              </p>
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
