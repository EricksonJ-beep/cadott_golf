import Link from 'next/link'
import { db } from '@/db'
import { users, practicePlans } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminOverviewPage() {
  const [[{ playerCount }], [{ planCount }]] = await Promise.all([
    db.select({ playerCount: count() }).from(users).where(eq(users.role, 'player')),
    db.select({ planCount: count() }).from(practicePlans).where(eq(practicePlans.isActive, true)),
  ])

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold">Admin Overview</h1>
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-sm text-muted-foreground font-normal">Players</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-3xl font-bold">{playerCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-sm text-muted-foreground font-normal">Practice Plans</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-3xl font-bold">{planCount}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-2">
        <Link href="/admin/roster" className="block p-4 rounded-xl border hover:border-[#FFD700] transition-colors">
          <p className="font-semibold text-sm">Roster Management</p>
          <p className="text-xs text-muted-foreground mt-0.5">Create accounts, reset passwords, disable players</p>
        </Link>
        <Link href="/admin/practice-plans" className="block p-4 rounded-xl border hover:border-[#FFD700] transition-colors">
          <p className="font-semibold text-sm">Practice Plans</p>
          <p className="text-xs text-muted-foreground mt-0.5">Build and manage the practice plan library</p>
        </Link>
      </div>
    </div>
  )
}
