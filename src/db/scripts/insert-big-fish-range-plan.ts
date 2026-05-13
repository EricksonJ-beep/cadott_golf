import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { eq } from 'drizzle-orm'

const db = drizzle(neon(process.env.DATABASE_URL!), { schema })

const PLAN_TITLE = 'Big Fish on the Range — 18 Holes'

const BLOCKS = [
  { startMinute: 0,  durationMinutes: 15, blockName: 'Warm-Up', drillDescription: `Loosen up with half-swings on a wedge, then build through 9-iron, 7-iron, and a hybrid. Hit 3-5 drivers to find your tee-shot shape. Don't skip this — you're about to "play" 18 holes at Big Fish.` },
  { startMinute: 15, durationMinutes: 5,  blockName: 'How to Play', drillDescription: `You're going to play Big Fish (blue tees) hole-by-hole on the range. For each hole:

• Hit your normal tee shot. Pick a fairway target on the range (two flags, or a defined width). Would your tee shot have hit the fairway? That's FIR. Par 3s don't count for FIR.

• Estimate your remaining yardage (hole yardage minus your tee carry). Play your approach with the right club. Pick a green target. Would your approach have hit the green? That's GIR.

• Par 5s: tee shot, then either a layup + wedge approach or a long approach if you can reach. Whatever your real play would be.

• Par 3s: the tee shot IS the approach — only GIR is in play.

You're not logging anything — just think about FIR and GIR after each shot. The point is to play with intent, not just hit balls.` },
  { startMinute: 20, durationMinutes: 20, blockName: 'Front 9 — Tee + Approach', drillDescription: `Play each hole in order. Take your time, hit your real club, commit to your target.

H1   Par 4   378y   tee + approach
H2   Par 5   525y   tee + layup + approach
H3   Par 3   149y   tee only (= approach)
H4   Par 4   437y   tee + approach
H5   Par 4   337y   tee + approach
H6   Par 4   410y   tee + approach
H7   Par 5   514y   tee + layup + approach (or carry water for green in 2)
H8   Par 4   385y   tee + approach
H9   Par 3   123y   tee only (= approach)

Front 9 par: 36.` },
  { startMinute: 40, durationMinutes: 20, blockName: 'Back 9 — Tee + Approach', drillDescription: `Same routine. Same focus. Don't rush.

H10  Par 4   362y   tee + approach
H11  Par 4   345y   tee + approach
H12  Par 3   174y   tee only (= approach)
H13  Par 5   487y   tee + layup + approach
H14  Par 4   398y   tee + approach
H15  Par 4   464y   tee + approach (Hcp 1 — bogey is a good score)
H16  Par 3   179y   tee only (= approach)
H17  Par 5   524y   tee + layup + approach
H18  Par 4   417y   tee + approach

Back 9 par: 36.

Goal: 50% fairways, 50% greens — anything above is gravy.` },
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

  const [plan] = await db
    .insert(schema.practicePlans)
    .values({
      title: PLAN_TITLE,
      focusArea: 'Course Simulation',
      theme: 'Play all 18 at Big Fish from the practice tee',
      totalDurationMinutes: 60,
      equipmentList: 'Full bag, range balls',
    })
    .returning({ id: schema.practicePlans.id })

  await db.insert(schema.practicePlanBlocks).values(
    BLOCKS.map((b, i) => ({ ...b, planId: plan.id, orderIndex: i }))
  )

  console.log(`✓ "${PLAN_TITLE}" inserted as plan id ${plan.id} with ${BLOCKS.length} blocks`)
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
