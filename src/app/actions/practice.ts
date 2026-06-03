'use server'

import { db } from '@/db'
import { practicePlans, practicePlanBlocks } from '@/db/schema'
import { eq, asc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function requireCoach() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'coach') redirect('/dashboard')
  return session
}

export async function getPracticePlans() {
  return db.query.practicePlans.findMany({
    where: eq(practicePlans.isActive, true),
    with: { blocks: { orderBy: asc(practicePlanBlocks.orderIndex) } },
    orderBy: asc(practicePlans.orderIndex),
  })
}

export async function reorderPracticePlans(orderedIds: number[]) {
  await requireCoach()
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(practicePlans)
        .set({ orderIndex: i })
        .where(eq(practicePlans.id, orderedIds[i]))
    }
  })
  revalidatePath('/dashboard')
  revalidatePath('/admin/practice-plans')
}

export async function getPracticePlan(id: number) {
  return db.query.practicePlans.findFirst({
    where: eq(practicePlans.id, id),
    with: { blocks: { orderBy: asc(practicePlanBlocks.orderIndex) } },
  })
}
