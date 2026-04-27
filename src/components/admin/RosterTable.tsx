'use client'

import { useActionState, useState } from 'react'
import { resetPlayerPassword, togglePlayerActive } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

type Player = {
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
      className="space-y-2 mt-2"
    >
      <div className="space-y-1">
        <Label htmlFor={`pw-${userId}`}>New Temporary Password</Label>
        <Input id={`pw-${userId}`} name="newPassword" required className="h-10" placeholder="Cadott2026" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending} className="bg-[#FFD700] text-black hover:bg-[#e6c200]">
          {pending ? 'Resetting…' : 'Reset'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}

export default function RosterTable({ roster }: { roster: Player[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  if (roster.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No players yet. Add one above.</p>
  }

  const players = roster.filter((u) => u.role === 'player')
  const coaches = roster.filter((u) => u.role === 'coach')

  return (
    <div className="space-y-4">
      {coaches.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Coaches</h3>
          <div className="space-y-2">
            {coaches.map((u) => (
              <Card key={u.id} className="border">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                    <Badge>Coach</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Players ({players.length})</h3>
        <div className="space-y-2">
          {players.map((player) => (
            <Card key={player.id} className={`border ${!player.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{player.name}</p>
                      {!player.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                      {player.mustChangePassword && <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-300">Temp password</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      @{player.username}{player.grade ? ` · Grade ${player.grade}` : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-xs shrink-0"
                    onClick={() => setExpandedId(expandedId === player.id ? null : player.id)}
                  >
                    {expandedId === player.id ? 'Close' : 'Manage'}
                  </Button>
                </div>

                {expandedId === player.id && (
                  <div className="mt-3 pt-3 border-t space-y-3">
                    <ResetPasswordForm
                      userId={player.id}
                      onClose={() => setExpandedId(null)}
                    />
                    <div className="pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8"
                        onClick={() => togglePlayerActive(player.id, !player.isActive)}
                      >
                        {player.isActive ? 'Disable Account' : 'Enable Account'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
