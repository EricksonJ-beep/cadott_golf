import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { eq } from 'drizzle-orm'

const db = drizzle(neon(process.env.DATABASE_URL!), { schema })

async function main() {
  // Rename existing 'Clock Drill' → 'Clock Drill (3 Feet)' and update description
  await db
    .update(schema.challenges)
    .set({
      name: 'Clock Drill (3 Feet)',
      description: 'Place 12 balls around the hole at 3 feet like a clock face. Putt all 12 — score is total putts made out of 12.',
    })
    .where(eq(schema.challenges.name, 'Clock Drill'))
  console.log('✓ Renamed "Clock Drill" → "Clock Drill (3 Feet)"')

  // Insert Clock Drill (4 Feet) if not already present
  const existing4 = await db
    .select({ id: schema.challenges.id })
    .from(schema.challenges)
    .where(eq(schema.challenges.name, 'Clock Drill (4 Feet)'))
    .limit(1)
  if (existing4.length === 0) {
    await db.insert(schema.challenges).values({
      name: 'Clock Drill (4 Feet)',
      type: 'range',
      category: 'putting',
      scoringType: 'score_out_of',
      maxScore: 12,
      description: 'Place 12 balls around the hole at 4 feet like a clock face. Putt all 12 — score is total putts made out of 12.',
    })
    console.log('✓ Inserted "Clock Drill (4 Feet)"')
  } else {
    console.log('  "Clock Drill (4 Feet)" already exists — skipping')
  }

  // Insert Clock Drill (5 Feet) if not already present
  const existing5 = await db
    .select({ id: schema.challenges.id })
    .from(schema.challenges)
    .where(eq(schema.challenges.name, 'Clock Drill (5 Feet)'))
    .limit(1)
  if (existing5.length === 0) {
    await db.insert(schema.challenges).values({
      name: 'Clock Drill (5 Feet)',
      type: 'range',
      category: 'putting',
      scoringType: 'score_out_of',
      maxScore: 12,
      description: 'Place 12 balls around the hole at 5 feet like a clock face. Putt all 12 — score is total putts made out of 12.',
    })
    console.log('✓ Inserted "Clock Drill (5 Feet)"')
  } else {
    console.log('  "Clock Drill (5 Feet)" already exists — skipping')
  }

  console.log('\nDone.')
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
