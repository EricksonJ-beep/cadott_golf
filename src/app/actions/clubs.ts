'use server'

import { db } from '@/db'
import { playerClubs, clubDistances, clubsDefault } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function getMyClubs() {
  const session = await auth()
  if (!session?.user) redirect('/')
  const userId = Number(session.user.id)

  return db.query.playerClubs.findMany({
    where: eq(playerClubs.userId, userId),
    with: {
      defaultClub: true,
      distances: {
        orderBy: (d, { desc }) => [desc(d.dateLogged), desc(d.id)],
      },
    },
    orderBy: (c, { asc }) => [asc(c.orderIndex)],
  })
}

export async function initializePlayerClubs(userId: number) {
  const defaults = await db.select().from(clubsDefault).orderBy(clubsDefault.defaultOrder)
  const existing = await db.select().from(playerClubs).where(eq(playerClubs.userId, userId))
  if (existing.length > 0) return

  await db.insert(playerClubs).values(
    defaults.map((c, i) => ({
      userId,
      clubId: c.id,
      orderIndex: i,
    }))
  )
}

type SwingType = 'full' | 'three_quarter' | 'half' | 'quarter'

export async function saveClubEdits(input: {
  playerClubId: number
  customName?: string | null
  distances: Array<{
    swingType: SwingType
    carryYards: number | null
    totalYards: number | null
  }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/')
  const userId = Number(session.user.id)

  const [owned] = await db
    .select({ id: playerClubs.id })
    .from(playerClubs)
    .where(and(eq(playerClubs.id, input.playerClubId), eq(playerClubs.userId, userId)))
    .limit(1)
  if (!owned) return

  if (input.customName !== undefined) {
    await db
      .update(playerClubs)
      .set({ customName: input.customName?.trim() || null })
      .where(eq(playerClubs.id, input.playerClubId))
  }

  if (input.distances.length > 0) {
    await db.insert(clubDistances).values(
      input.distances.map((d) => ({
        userId,
        playerClubId: input.playerClubId,
        swingType: d.swingType,
        carryYards: d.carryYards,
        totalYards: d.totalYards,
      }))
    )
  }

  revalidatePath('/dashboard')
}

export async function toggleClubHidden(playerClubId: number, hidden: boolean) {
  const session = await auth()
  if (!session?.user) redirect('/')
  const userId = Number(session.user.id)

  const [owned] = await db
    .select({ id: playerClubs.id })
    .from(playerClubs)
    .where(and(eq(playerClubs.id, playerClubId), eq(playerClubs.userId, userId)))
    .limit(1)
  if (!owned) return

  await db
    .update(playerClubs)
    .set({ isHidden: hidden })
    .where(eq(playerClubs.id, playerClubId))

  revalidatePath('/dashboard')
}
