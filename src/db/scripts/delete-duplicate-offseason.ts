import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { eq, sql } from 'drizzle-orm'
import * as schema from '../schema'

// Deletes the duplicate offseason season I created (id 3, "2026 Offseason").
// Guarded: refuses to delete unless the season is completely empty, so this
// can never touch live rounds/results/roster.
const TARGET_ID = 3
const EXPECTED_NAME = '2026 Offseason'

async function main() {
  const sqlc = neon(process.env.DATABASE_URL!)
  const db = drizzle(sqlc, { schema })

  const [season] = await db
    .select()
    .from(schema.seasons)
    .where(eq(schema.seasons.id, TARGET_ID))
    .limit(1)

  if (!season) {
    console.log(`No season with id ${TARGET_ID} found — nothing to do.`)
    return
  }

  if (season.name !== EXPECTED_NAME) {
    console.error(
      `❌ Safety check failed: season ${TARGET_ID} is named "${season.name}", expected "${EXPECTED_NAME}". Aborting.`,
    )
    process.exit(1)
  }

  const [rounds] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.rounds)
    .where(eq(schema.rounds.seasonId, TARGET_ID))
  const [results] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.challengeResults)
    .where(eq(schema.challengeResults.seasonId, TARGET_ID))
  const [roster] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.rosterEntries)
    .where(eq(schema.rosterEntries.seasonId, TARGET_ID))

  if (rounds.n > 0 || results.n > 0 || roster.n > 0) {
    console.error(
      `❌ Season ${TARGET_ID} is NOT empty (rounds=${rounds.n}, results=${results.n}, roster=${roster.n}). Aborting to protect data.`,
    )
    process.exit(1)
  }

  await db.delete(schema.seasons).where(eq(schema.seasons.id, TARGET_ID))
  console.log(`✅ Deleted duplicate season ${TARGET_ID} "${EXPECTED_NAME}" (was empty).`)
  console.log('   Kept: id 2 "2026–27 Offseason" (Jun 10, 2026 – Mar 30, 2027), unchanged.')
}

main()
