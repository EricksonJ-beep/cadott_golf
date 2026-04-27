'use client'

import { useActionState, useState } from 'react'
import { updateProfile, changeOwnPassword } from '@/app/actions/profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Profile = { id: number; name: string; grade: number | null; username: string }

export default function ProfileCard({ profile }: { profile: Profile }) {
  const [editing, setEditing] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [profileError, profileAction, profilePending] = useActionState(updateProfile, null)
  const [pwError, pwAction, pwPending] = useActionState(changeOwnPassword, null)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing && !changingPw && (
          <div className="space-y-1">
            <p className="font-semibold">{profile.name}</p>
            <p className="text-sm text-muted-foreground">
              @{profile.username}{profile.grade ? ` · Grade ${profile.grade}` : ''}
            </p>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
              <Button size="sm" variant="outline" onClick={() => setChangingPw(true)}>
                Change Password
              </Button>
            </div>
          </div>
        )}

        {editing && (
          <form
            action={async (fd) => {
              await profileAction(fd)
              setEditing(false)
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={profile.name} required className="h-11" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                name="grade"
                type="number"
                inputMode="numeric"
                defaultValue={profile.grade ?? ''}
                min={9}
                max={12}
                className="h-11"
              />
            </div>
            {profileError && <p className="text-sm text-destructive">{profileError}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={profilePending} className="bg-[#FFD700] text-black hover:bg-[#e6c200]">
                Save
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {changingPw && (
          <form
            action={async (fd) => {
              const result = await pwAction(fd)
              if (result === null) setChangingPw(false)
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required className="h-11" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" name="newPassword" type="password" required className="h-11" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required className="h-11" />
            </div>
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pwPending} className="bg-[#FFD700] text-black hover:bg-[#e6c200]">
                Update
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setChangingPw(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
