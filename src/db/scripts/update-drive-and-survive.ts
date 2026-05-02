import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { eq, and } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function main() {
  const [plan] = await db
    .select({ id: schema.practicePlans.id })
    .from(schema.practicePlans)
    .where(eq(schema.practicePlans.title, 'Drive & Survive'))

  if (!plan) {
    console.error('Plan not found')
    process.exit(1)
  }

  await db
    .update(schema.practicePlans)
    .set({ totalDurationMinutes: 45 })
    .where(eq(schema.practicePlans.id, plan.id))

  await db
    .update(schema.practicePlanBlocks)
    .set({
      durationMinutes: 10,
      drillDescription: 'Hit 10 balls with your 3-wood off a tee. Focus on sweeping through the ball — not hitting down. Pick a target for every swing.',
    })
    .where(
      and(
        eq(schema.practicePlanBlocks.planId, plan.id),
        eq(schema.practicePlanBlocks.blockName, 'Fairway Woods')
      )
    )

  await db
    .update(schema.practicePlanBlocks)
    .set({
      startMinute: 20,
      durationMinutes: 10,
      drillDescription: 'Pick two range flags as your imaginary fairway. Hit 10 drives. Count how many land between the flags. Goal: 7 out of 10 in the fairway.',
    })
    .where(
      and(
        eq(schema.practicePlanBlocks.planId, plan.id),
        eq(schema.practicePlanBlocks.blockName, 'Driver — Fairways First')
      )
    )

  await db
    .update(schema.practicePlanBlocks)
    .set({ startMinute: 30 })
    .where(
      and(
        eq(schema.practicePlanBlocks.planId, plan.id),
        eq(schema.practicePlanBlocks.blockName, 'Shape It')
      )
    )

  await db
    .update(schema.practicePlanBlocks)
    .set({ startMinute: 40 })
    .where(
      and(
        eq(schema.practicePlanBlocks.planId, plan.id),
        eq(schema.practicePlanBlocks.blockName, 'Confidence Finish')
      )
    )

  console.log('Updated Drive & Survive successfully')
  process.exit(0)
}

main()
