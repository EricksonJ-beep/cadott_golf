'use server'

import { db } from '@/db'
import { practicePlans, practicePlanBlocks } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function getPracticePlans() {
  return db.query.practicePlans.findMany({
    where: eq(practicePlans.isActive, true),
    with: { blocks: { orderBy: asc(practicePlanBlocks.orderIndex) } },
    orderBy: asc(practicePlans.createdAt),
  })
}

export async function getPracticePlan(id: number) {
  return db.query.practicePlans.findFirst({
    where: eq(practicePlans.id, id),
    with: { blocks: { orderBy: asc(practicePlanBlocks.orderIndex) } },
  })
}
