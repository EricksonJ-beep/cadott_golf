import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AppHeader from '@/components/layout/AppHeader'
import BottomNav from '@/components/layout/BottomNav'
import { Suspense } from 'react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/')
  if (session.user.mustChangePassword) redirect('/change-password')

  return (
    <div className="flex flex-col h-full min-h-screen">
      <AppHeader />
      <main className="flex-1 overflow-y-auto pb-[72px]">
        {children}
      </main>
      <Suspense>
        <BottomNav />
      </Suspense>
    </div>
  )
}
