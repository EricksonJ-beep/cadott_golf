import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { eq, sql as dsql } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const NAME = 'Up & Down Streak'
const NEW_DESCRIPTION =
  'Chip from the rough (not the fringe), then make the next putt. Score is consecutive successful up-and-downs.'

async function countResults(challengeId: number) {
  const [{ n }] = await db
    .select({ n: dsql<number>`count(*)::int` })
    .from(schema.challengeResults)
    .where(eq(schema.challengeResults.challengeId, challengeId))
  return n
}

async function main() {
  const [existing] = await db
    .select({
      id: schema.challenges.id,
      name: schema.challenges.name,
      description: schema.challenges.description,
    })
    .from(schema.challenges)
    .where(eq(schema.challenges.name, NAME))
    .limit(1)

  if (!existing) {
    console.log(`✗ No challenge found with name "${NAME}". Aborting.`)
    process.exit(1)
  }

  if (existing.description === NEW_DESCRIPTION) {
    const n = await countResults(existing.id)
    console.log(`• Description already up to date (id=${existing.id}). ${n} logged scores attached. Nothing to do.`)
    process.exit(0)
  }

  const before = await countResults(existing.id)
  console.log(`Before: challenge id=${existing.id} "${existing.name}" — ${before} logged scores.`)

  await db
    .update(schema.challenges)
    .set({ description: NEW_DESCRIPTION })
    .where(eq(schema.challenges.id, existing.id))

  const after = await countResults(existing.id)
  console.log(`After:  challenge id=${existing.id} description updated — ${after} logged scores.`)

  if (after !== before) {
    console.error(`✗ COUNT MISMATCH: ${before} → ${after}. Investigate immediately.`)
    process.exit(1)
  }
  console.log(`✓ Update succeeded. All ${after} scores still attached.`)
  process.exit(0)
}

main()
