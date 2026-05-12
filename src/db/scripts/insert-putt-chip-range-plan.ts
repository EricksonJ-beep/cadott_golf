import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { eq, sql } from 'drizzle-orm'

const db = drizzle(neon(process.env.DATABASE_URL!), { schema })

const PLAN_TITLE = 'Putt, Chip, Range'

const BLOCKS = [
  // Block 1 — Putting
  { startMinute: 0,  durationMinutes: 5,  blockName: 'Warm-Up Rolls',               drillDescription: 'No pressure, just feel. Roll 5–6 putts from 15–20 feet to each quadrant of the hole. Focus on pace — get the speed of the green before anything else.' },
  { startMinute: 5,  durationMinutes: 10, blockName: '5-Foot Putt Challenge',        drillDescription: 'Place a ball at 5 feet on four sides of the hole (N, S, E, W). Must make all 4 in a row to advance. If you miss, start over. Goal: complete the loop twice. Builds consistency under repetition pressure.' },
  { startMinute: 15, durationMinutes: 8,  blockName: 'Clock Drill',                  drillDescription: 'Place 12 balls around the hole at 3 feet like a clock face. Putt all 12 consecutively — miss one and restart from that position. Goal: complete the full clock without missing. Builds short-putt confidence from all angles.' },
  { startMinute: 23, durationMinutes: 7,  blockName: 'Lag Putting — Speed Control',  drillDescription: 'From 30, 40, and 50 feet, hit 2 putts from each distance. Goal: finish within a 3-foot circle (use a tee as a marker). Focus on getting the pace right — if you\'re consistently short or long, make one adjustment and stick with it.' },
  // Block 2 — Chipping
  { startMinute: 30, durationMinutes: 7,  blockName: 'Guided Warm-Up — One Club, One Spot', drillDescription: 'Use a pitching wedge or 9-iron. Chip 10 balls from the same spot to the same target. Focus on a quiet lower body, hands leading the club, and watching where the ball lands — not where it ends up. Reset between each chip.' },
  { startMinute: 37, durationMinutes: 10, blockName: 'Landing Zone Drill',           drillDescription: 'Place a towel or bag cover 3–4 feet onto the green as a landing target. Chip 10 balls from light rough (3–4 yards off green) trying to land ON the towel. Switch clubs after 5 balls — try a higher-lofted wedge and compare roll-out. Develops landing zone awareness.' },
  { startMinute: 47, durationMinutes: 7,  blockName: 'Uphill / Downhill Chip',       drillDescription: 'Find an uphill lie and a downhill lie if available. Hit 5 chips from each. On downhill chips, play the ball back and expect more run. On uphill, open face and swing through. Focus on adjusting to slope, not fighting it.' },
  { startMinute: 54, durationMinutes: 6,  blockName: 'Up-and-Down Challenge',        drillDescription: 'Pick 4 different spots around a practice green — two easy, two harder. Chip and then putt out (count strokes). Goal: get up-and-down (chip + 1 putt) on at least 2 of 4. This simulates real course pressure.' },
  // Block 3 — Range
  { startMinute: 60, durationMinutes: 5,  blockName: 'Wedge Warm-Up',               drillDescription: '5 balls — pitching wedge or 9-iron. Half swings first, then full. Pick a specific target and commit to it every shot. These are warm-up swings, but not lazy ones.' },
  { startMinute: 65, durationMinutes: 7,  blockName: 'Short Irons',                  drillDescription: '7 balls — alternate between 9-iron and 8-iron. Pick a target for each shot. Focus on solid contact and a full finish. Resist the urge to steer the ball — trust your swing and let the club do the work.' },
  { startMinute: 72, durationMinutes: 8,  blockName: 'Mid Irons',                    drillDescription: '8 balls — split between 7-iron and 6-iron. Focus on tempo: same pace back as through. Pick two different targets and alternate clubs between them. Notice which club feels more consistent today.' },
  { startMinute: 80, durationMinutes: 5,  blockName: 'Fairway Wood or Hybrid',       drillDescription: '5 balls — sweep the ball, don\'t hit down on it. Pick a wide landing zone target. These clubs reward smooth tempo over power. If you\'re pushing or pulling, check your ball position — it likely moved back.' },
  { startMinute: 85, durationMinutes: 5,  blockName: 'Driver — Fairway Finder',      drillDescription: '5 balls — pick a fairway target, not max distance. Each drive: pre-shot routine, one waggle, commit. Note which side you miss and make one small adjustment for the next ball only. Finding the fairway is the goal.' },
]

async function main() {
  const existing = await db
    .select({ id: schema.practicePlans.id })
    .from(schema.practicePlans)
    .where(eq(schema.practicePlans.title, PLAN_TITLE))
    .limit(1)

  if (existing.length > 0) {
    console.log(`⚠ Plan already exists (id ${existing[0].id}) — skipping`)
    process.exit(0)
  }

  // Shift all existing plans up to make room at index 0
  await db
    .update(schema.practicePlans)
    .set({ orderIndex: sql`${schema.practicePlans.orderIndex} + 1` })

  const [plan] = await db
    .insert(schema.practicePlans)
    .values({
      title: PLAN_TITLE,
      theme: 'Full practice coverage',
      focusArea: 'Putting + Chipping + Range',
      totalDurationMinutes: 90,
      equipmentList: 'Putter, wedges, full bag, ~30 range balls per player, tees, alignment sticks (optional)',
      orderIndex: 0,
    })
    .returning({ id: schema.practicePlans.id })

  await db.insert(schema.practicePlanBlocks).values(
    BLOCKS.map((b, i) => ({ ...b, planId: plan.id, orderIndex: i }))
  )

  console.log(`✓ "${PLAN_TITLE}" inserted as plan id ${plan.id} with ${BLOCKS.length} blocks`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
