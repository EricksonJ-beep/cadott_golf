import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AppHeader from '@/components/layout/AppHeader'
import TabNav from '@/components/layout/TabNav'
import { Suspense } from 'react'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/')
  if (session.user.mustChangePassword) redirect('/change-password')

  return (
    <div className="flex flex-col h-full min-h-screen">
      <AppHeader />
      <Suspense>
        <TabNav />
      </Suspense>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
