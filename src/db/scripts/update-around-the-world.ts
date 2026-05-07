import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { eq, sql as dsql } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const OLD_NAME = 'Around-the-World (4x4 Drill)'
const NEW_NAME = 'Around-the-World (4 x 3)'
const NEW_DESCRIPTION =
  'Set 4 balls in a circle at 3 feet. You must make all 4 consecutively to complete one round. Score is the most full times around the world completed before a miss.'

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
    .where(eq(schema.challenges.name, OLD_NAME))
    .limit(1)

  if (!existing) {
    const [already] = await db
      .select({ id: schema.challenges.id })
      .from(schema.challenges)
      .where(eq(schema.challenges.name, NEW_NAME))
      .limit(1)
    if (already) {
      const n = await countResults(already.id)
      console.log(
        `• Challenge already named "${NEW_NAME}" (id=${already.id}). ${n} logged scores still attached. Nothing to do.`,
      )
      process.exit(0)
    }
    console.log(`✗ No challenge found with name "${OLD_NAME}" or "${NEW_NAME}". Aborting.`)
    process.exit(1)
  }

  const before = await countResults(existing.id)
  console.log(`Before: challenge id=${existing.id} "${existing.name}" — ${before} logged scores.`)

  await db
    .update(schema.challenges)
    .set({ name: NEW_NAME, description: NEW_DESCRIPTION })
    .where(eq(schema.challenges.id, existing.id))

  const after = await countResults(existing.id)
  console.log(`After:  challenge id=${existing.id} "${NEW_NAME}" — ${after} logged scores.`)

  if (after !== before) {
    console.error(`✗ COUNT MISMATCH: ${before} → ${after}. Investigate immediately.`)
    process.exit(1)
  }
  console.log(`✓ Update succeeded. All ${after} scores still attached.`)
  process.exit(0)
}

main()
