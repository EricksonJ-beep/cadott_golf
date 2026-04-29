import Image from 'next/image'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const session = await auth()
  if (session?.user) {
    if (session.user.mustChangePassword) redirect('/change-password')
    else redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/logo/hornet.png"
            alt="Cadott Hornets"
            width={140}
            height={140}
            className="object-contain"
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Cadott Golf</h1>
            <p className="text-sm text-muted-foreground">Cadott High School</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
