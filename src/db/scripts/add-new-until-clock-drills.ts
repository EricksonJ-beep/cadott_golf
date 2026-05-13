import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { inArray } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const NEW_UNTIL = '2026-05-27'
const CLOCK_DRILLS = ['Clock Drill (3 Feet)', 'Clock Drill (4 Feet)', 'Clock Drill (5 Feet)']

async function main() {
  // Add the column if it doesn't exist yet
  await sql`ALTER TABLE challenges ADD COLUMN IF NOT EXISTS new_until date`
  console.log('✓ new_until column ensured on challenges')

  // Set newUntil on the three Clock Drill challenges
  await db
    .update(schema.challenges)
    .set({ newUntil: NEW_UNTIL })
    .where(inArray(schema.challenges.name, CLOCK_DRILLS))
  console.log(`✓ Set new_until = ${NEW_UNTIL} on ${CLOCK_DRILLS.join(', ')}`)

  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
