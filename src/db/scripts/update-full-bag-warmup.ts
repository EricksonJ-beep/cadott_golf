import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const NEW_BLOCKS = [
  {
    startMinute: 0,
    durationMinutes: 5,
    blockName: 'Dynamic Warm-Up',
    drillDescription: 'Light stretching and arm circles. Take 5 easy half-swings with a pitching wedge — no balls yet. Loosen your shoulders, hips, and back before you touch a ball.',
    orderIndex: 0,
  },
  {
    startMinute: 5,
    durationMinutes: 10,
    blockName: 'Short Irons & Wedges',
    drillDescription: 'Hit 10 balls with your short irons and wedges (pitching wedge, 9-iron). Focus on solid contact and picking a specific target every shot. No lazy swings.',
    orderIndex: 1,
  },
  {
    startMinute: 15,
    durationMinutes: 10,
    blockName: 'Mid Irons',
    drillDescription: 'Hit 10 balls with your mid irons (6-iron, 7-iron, 8-iron). Focus on tempo — same pace back as through. Pick two clubs and split the balls between them.',
    orderIndex: 2,
  },
  {
    startMinute: 25,
    durationMinutes: 10,
    blockName: 'Hybrids & Fairway Woods',
    drillDescription: 'Hit 10 balls with your hybrids and fairway woods. Pick a landing area and commit to it. These clubs should feel smooth — resist the urge to swing hard.',
    orderIndex: 3,
  },
  {
    startMinute: 35,
    durationMinutes: 10,
    blockName: 'Driver',
    drillDescription: 'Finish with 10 drives. Pick a fairway target — finding the short grass is the goal, not distance. If you miss, note which side and make one adjustment.',
    orderIndex: 4,
  },
]

async function main() {
  const [plan] = await db
    .select({ id: schema.practicePlans.id })
    .from(schema.practicePlans)
    .where(eq(schema.practicePlans.title, 'Full Bag Warm-Up'))

  if (!plan) {
    console.error('Plan not found')
    process.exit(1)
  }

  await db
    .update(schema.practicePlans)
    .set({
      theme: 'Get loose, cover the bag',
      totalDurationMinutes: 45,
      equipmentList: 'Full bag, 1 basket of range balls (~40 balls)',
    })
    .where(eq(schema.practicePlans.id, plan.id))

  await db
    .delete(schema.practicePlanBlocks)
    .where(eq(schema.practicePlanBlocks.planId, plan.id))

  await db.insert(schema.practicePlanBlocks).values(
    NEW_BLOCKS.map((b) => ({ ...b, planId: plan.id }))
  )

  console.log('Updated Full Bag Warm-Up successfully')
  process.exit(0)
}

main()
