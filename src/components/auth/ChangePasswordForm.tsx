'use client'

import { useActionState } from 'react'
import { changePassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export default function ChangePasswordForm() {
  const [error, action, pending] = useActionState(changePassword, null)

  return (
    <Card className="border shadow">
      <CardContent className="pt-6">
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="h-12 text-base"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="w-full h-12 text-base bg-[#FFD700] text-black hover:bg-[#e6c200] font-semibold"
          >
            {pending ? 'Saving…' : 'Set Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
