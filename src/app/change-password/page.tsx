import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ChangePasswordForm from '@/components/auth/ChangePasswordForm'

export default async function ChangePasswordPage() {
  const session = await auth()
  if (!session?.user) redirect('/')
  if (!session.user.mustChangePassword) redirect('/dashboard')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Set Your Password</h1>
          <p className="text-sm text-muted-foreground">
            Choose a new password to continue.
          </p>
        </div>
        <ChangePasswordForm />
      </div>
    </main>
  )
}
