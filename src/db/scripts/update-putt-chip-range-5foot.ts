import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { and, eq } from 'drizzle-orm'

const db = drizzle(neon(process.env.DATABASE_URL!), { schema })

async function main() {
  const [plan] = await db
    .select({ id: schema.practicePlans.id })
    .from(schema.practicePlans)
    .where(eq(schema.practicePlans.title, 'Putt, Chip, Range'))
    .limit(1)

  if (!plan) {
    console.error('Plan "Putt, Chip, Range" not found')
    process.exit(1)
  }

  const result = await db
    .update(schema.practicePlanBlocks)
    .set({
      drillDescription: 'Equipment: 5 balls and a tee or ball mark to mark out 5 feet. Hit 5-foot putts and count how many you can make in a row. Score is your longest consecutive streak.',
    })
    .where(
      and(
        eq(schema.practicePlanBlocks.planId, plan.id),
        eq(schema.practicePlanBlocks.blockName, '5-Foot Putt Challenge'),
      )
    )

  console.log(`✓ 5-Foot Putt Challenge description updated (plan id ${plan.id})`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
