import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { asc, eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function main() {
  const plans = await db
    .select({ id: schema.practicePlans.id })
    .from(schema.practicePlans)
    .orderBy(asc(schema.practicePlans.createdAt))

  for (let i = 0; i < plans.length; i++) {
    await db
      .update(schema.practicePlans)
      .set({ orderIndex: i })
      .where(eq(schema.practicePlans.id, plans[i].id))
  }

  console.log(`Initialized orderIndex for ${plans.length} plans`)
  process.exit(0)
}

main()
