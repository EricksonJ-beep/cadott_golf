import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { and, eq, sql } from 'drizzle-orm'

const db = drizzle(neon(process.env.DATABASE_URL!), { schema })

// Append badge markers to two blocks in the Putt, Chip, Range plan.
// The UI parses [Challenge: ...] and [Log: ...] to render colored badges.

async function main() {
  const [plan] = await db
    .select({ id: schema.practicePlans.id })
    .from(schema.practicePlans)
    .where(eq(schema.practicePlans.title, 'Putt, Chip, Range'))
    .limit(1)

  if (!plan) {
    console.log('! Plan not found')
    process.exit(1)
  }

  const updates: { blockName: string; append: string }[] = [
    { blockName: 'Clock Drill',             append: '\n[Challenge: log your best streak]' },
    { blockName: 'Driver — Fairway Finder', append: '\n[Log: fairways hit out of 5]' },
  ]

  for (const { blockName, append } of updates) {
    const result = await db
      .update(schema.practicePlanBlocks)
      .set({ drillDescription: sql`${schema.practicePlanBlocks.drillDescription} || ${append}` })
      .where(
        and(
          eq(schema.practicePlanBlocks.planId, plan.id),
          eq(schema.practicePlanBlocks.blockName, blockName),
        ),
      )
    console.log(`✓ Updated "${blockName}"`)
  }

  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
