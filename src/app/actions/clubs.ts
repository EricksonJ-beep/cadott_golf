'use server'

import { db } from '@/db'
import { playerClubs, clubDistances, clubsDefault } from '@/db/schema'
import { eq } from 'drizzle-orm'
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
        orderBy: (d, { desc }) => [desc(d.dateLogged)],
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

export async function saveClubDistance(formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect('/')
  const userId = Number(session.user.id)

  const playerClubId = Number(formData.get('playerClubId'))
  const swingType = (formData.get('swingType') as string) || 'full'
  const carryYards = formData.get('carryYards') ? Number(formData.get('carryYards')) : null
  const totalYards = formData.get('totalYards') ? Number(formData.get('totalYards')) : null
  const typicalMiss = (formData.get('typicalMiss') as string) || null
  const isGoTo = formData.get('isGoTo') === 'true'
  const isAvoid = formData.get('isAvoid') === 'true'

  await db.insert(clubDistances).values({
    userId,
    playerClubId,
    swingType: swingType as 'full' | 'three_quarter' | 'half' | 'quarter',
    carryYards,
    totalYards,
    typicalMiss,
    isGoTo,
    isAvoid,
  })

  revalidatePath('/dashboard')
}

export async function updateClubName(playerClubId: number, customName: string) {
  const session = await auth()
  if (!session?.user) redirect('/')

  await db
    .update(playerClubs)
    .set({ customName: customName.trim() || null })
    .where(eq(playerClubs.id, playerClubId))

  revalidatePath('/dashboard')
}

export async function toggleClubHidden(playerClubId: number, hidden: boolean) {
  const session = await auth()
  if (!session?.user) redirect('/')

  await db
    .update(playerClubs)
    .set({ isHidden: hidden })
    .where(eq(playerClubs.id, playerClubId))

  revalidatePath('/dashboard')
}
