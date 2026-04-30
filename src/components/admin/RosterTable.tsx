'use client'

import { useActionState, useState } from 'react'
import { resetPlayerPassword, togglePlayerActive, updateUserInfo } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

type Person = {
  id: number
  username: string
  name: string
  role: string
  grade: number | null
  isActive: boolean
  mustChangePassword: boolean
  createdAt: Date
}

function ResetPasswordForm({ userId, onClose }: { userId: number; onClose: () => void }) {
  const [error, action, pending] = useActionState(resetPlayerPassword, null)

  return (
    <form
      action={async (fd) => {
        fd.set('userId', String(userId))
        await action(fd)
        if (!error) onClose()
      }}
      className="space-y-2"
    >
      <div className="space-y-1">
        <Label htmlFor={`pw-${userId}`}>New Temporary Password</Label>
        <Input id={`pw-${userId}`} name="newPassword" required className="h-10" placeholder="Cadott2026" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} className="bg-[#FFD700] text-black hover:bg-[#e6c200]">
          {pending ? 'Resetting…' : 'Reset Password'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

function EditInfoForm({ person, onClose }: { person: Person; onClose: () => void }) {
  const [error, action, pending] = useActionState(updateUserInfo, null)
  const isPlayer = person.role === 'player'

  return (
    <form
      action={async (fd) => {
        fd.set('userId', String(person.id))
        await action(fd)
        if (!error) onClose()
      }}
      className="space-y-2"
    >
      <div className="space-y-1">
        <Label htmlFor={`name-${person.id}`}>Name</Label>
        <Input id={`name-${person.id}`} name="name" defaultValue={person.name} required className="h-10" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor={`uname-${person.id}`}>Username</Label>
          <Input
            id={`uname-${person.id}`}
            name="username"
            defaultValue={person.username}
            required
            className="h-10"
            autoCapitalize="none"
          />
        </div>
        {isPlayer && (
          <div className="space-y-1">
            <Label htmlFor={`grade-${person.id}`}>Grade</Label>
            <Input
              id={`grade-${person.id}`}
              name="grade"
              type="number"
              inputMode="numeric"
              min={9}
              max={12}
              defaultValue={person.grade ?? ''}
              className="h-10"
            />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} className="bg-[#FFD700] text-black hover:bg-[#e6c200]">
          {pending ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

type Panel = 'edit' | 'password' | null

function PersonCard({ person }: { person: Person }) {
  const [panel, setPanel] = useState<Panel>(null)

  return (
    <Card className={`border ${!person.isActive ? 'opacity-60' : ''}`}>
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-sm">{person.name}</p>
              {person.role === 'coach' && <Badge>Coach</Badge>}
              {!person.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
              {person.mustChangePassword && (
                <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">
                  Temp password
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              @{person.username}{person.grade ? ` · Grade ${person.grade}` : ''}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs shrink-0"
            onClick={() => setPanel(panel ? null : 'edit')}
          >
            {panel ? 'Close' : 'Manage'}
          </Button>
        </div>

        {panel && (
          <div className="mt-3 pt-3 border-t space-y-3">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPanel('edit')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  panel === 'edit' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                Edit Info
              </button>
              <button
                type="button"
                onClick={() => setPanel('password')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  panel === 'password' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                Reset Password
              </button>
            </div>

            {panel === 'edit' && <EditInfoForm person={person} onClose={() => setPanel(null)} />}
            {panel === 'password' && <ResetPasswordForm userId={person.id} onClose={() => setPanel(null)} />}

            <div className="pt-1 border-t">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={() => togglePlayerActive(person.id, !person.isActive)}
              >
                {person.isActive ? 'Disable Account' : 'Enable Account'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function RosterTable({ roster }: { roster: Person[] }) {
  if (roster.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No accounts yet. Add one above.</p>
  }

  const players = roster.filter((u) => u.role === 'player')
  const coaches = roster.filter((u) => u.role === 'coach')

  return (
    <div className="space-y-4">
      {coaches.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Coaches ({coaches.length})</h3>
          <div className="space-y-2">
            {coaches.map((u) => (
              <PersonCard key={u.id} person={u} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Players ({players.length})</h3>
        <div className="space-y-2">
          {players.map((player) => (
            <PersonCard key={player.id} person={player} />
          ))}
        </div>
      </div>
    </div>
  )
}
