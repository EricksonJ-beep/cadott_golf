import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const DEFAULT_CLUBS = [
  { name: 'Driver',    type: 'driver' as const, defaultOrder: 1 },
  { name: '3 Wood',   type: 'wood' as const,   defaultOrder: 2 },
  { name: '5 Wood',   type: 'wood' as const,   defaultOrder: 3 },
  { name: '2 Hybrid', type: 'hybrid' as const, defaultOrder: 4 },
  { name: '3 Hybrid', type: 'hybrid' as const, defaultOrder: 5 },
  { name: '3 Iron',   type: 'iron' as const,   defaultOrder: 6 },
  { name: '4 Iron',   type: 'iron' as const,   defaultOrder: 7 },
  { name: '5 Iron',   type: 'iron' as const,   defaultOrder: 8 },
  { name: '6 Iron',   type: 'iron' as const,   defaultOrder: 9 },
  { name: '7 Iron',   type: 'iron' as const,   defaultOrder: 10 },
  { name: '8 Iron',   type: 'iron' as const,   defaultOrder: 11 },
  { name: '9 Iron',   type: 'iron' as const,   defaultOrder: 12 },
  { name: 'Pitching Wedge', type: 'wedge' as const, defaultOrder: 13 },
  { name: 'Gap Wedge',      type: 'wedge' as const, defaultOrder: 14 },
  { name: 'Sand Wedge',     type: 'wedge' as const, defaultOrder: 15 },
  { name: 'Lob Wedge',      type: 'wedge' as const, defaultOrder: 16 },
  { name: 'Putter',         type: 'putter' as const, defaultOrder: 17 },
]

async function main() {
  console.log('Seeding database…')

  // Default clubs
  const existingClubs = await db.select().from(schema.clubsDefault)
  if (existingClubs.length === 0) {
    await db.insert(schema.clubsDefault).values(DEFAULT_CLUBS)
    console.log('✓ Default clubs inserted')
  } else {
    console.log('  Default clubs already exist, skipping')
  }

  // Coach account
  const existing = await db.select().from(schema.users).where(eq(schema.users.username, 'coach')).limit(1)
  if (existing.length === 0) {
    const hash = await bcrypt.hash('Cadott2026!', 12)
    await db.insert(schema.users).values({
      username: 'coach',
      passwordHash: hash,
      role: 'coach',
      name: 'Coach Erickson',
      mustChangePassword: false,
    })
    console.log('✓ Coach account created: username=coach  password=Cadott2026!')
    console.log('  IMPORTANT: Change this password after first login.')
  } else {
    console.log('  Coach account already exists, skipping')
  }

  // Active season
  const existingSeasons = await db.select().from(schema.seasons)
  if (existingSeasons.length === 0) {
    await db.insert(schema.seasons).values({
      name: 'Spring 2026',
      startDate: '2026-03-01',
      endDate: '2026-06-30',
      isActive: true,
    })
    console.log('✓ Spring 2026 season created')
  } else {
    console.log('  Season already exists, skipping')
  }

  // Placeholder practice plans
  const existingPlans = await db.select().from(schema.practicePlans)
  if (existingPlans.length === 0) {
    const plans = [
      {
        title: 'Full Bag Warm-Up',
        focusArea: 'Warm-Up',
        theme: 'Get loose, build tempo',
        totalDurationMinutes: 60,
        equipmentList: 'Full bag, range balls',
        blocks: [
          { startMinute: 0,  durationMinutes: 10, blockName: 'Dynamic Warm-Up',       drillDescription: 'Light stretching and arm circles. Start with half-swings using a pitching wedge. Build to full swings over 10 minutes — no forcing it.' },
          { startMinute: 10, durationMinutes: 15, blockName: 'Short Irons',            drillDescription: 'Hit 20 balls with a 9-iron and pitching wedge. Focus on solid contact and consistent alignment. Pick a specific target for every shot.' },
          { startMinute: 25, durationMinutes: 15, blockName: 'Mid & Long Irons',       drillDescription: 'Work through your 5-iron to 7-iron. Focus on tempo — same pace back as through. Hit 5 balls per club.' },
          { startMinute: 40, durationMinutes: 15, blockName: 'Driver',                 drillDescription: 'Pick a fairway target and hit 15 drives. Goal is finding the fairway, not max distance. If you miss, note which side and adjust.' },
          { startMinute: 55, durationMinutes: 5,  blockName: 'Putting Warm-Up',        drillDescription: '5-foot putts from all four sides of the hole. Get the feel of the green before you leave the range.' },
        ],
      },
      {
        title: 'Short Game Lab',
        focusArea: 'Short Game',
        theme: 'Putting & chipping',
        totalDurationMinutes: 90,
        equipmentList: 'Wedges, putter, chipping mat, tees',
        blocks: [
          { startMinute: 0,  durationMinutes: 15, blockName: 'Gate Drill — Putting',   drillDescription: 'Set two tees just wider than your putter head, 2 feet from the hole. Make 20 putts without clipping the gates. Then move to 3 feet and repeat.' },
          { startMinute: 15, durationMinutes: 15, blockName: 'Lag Putting',            drillDescription: 'Lag putts from 20, 30, and 40 feet. Goal: every putt finishes within 3 feet. Hit 5 from each distance. Count how many you nail.' },
          { startMinute: 30, durationMinutes: 20, blockName: 'One-Club Chipping',      drillDescription: 'Pick one spot around the green. Chip 20 balls with a 7-iron — bump and run style. Track how many finish within 6 feet of the hole.' },
          { startMinute: 50, durationMinutes: 20, blockName: 'Chipping Variety',       drillDescription: 'Move to 5 different spots around the green. Chip 3 balls from each spot using different clubs and landing zones. Find what works best.' },
          { startMinute: 70, durationMinutes: 20, blockName: 'Up-and-Down Challenge',  drillDescription: 'Drop 5 balls in random spots around the green. Try to get up and down every time. Keep score — can you go 5 for 5?' },
        ],
      },
      {
        title: 'Iron Sharpening',
        focusArea: 'Ball Striking',
        theme: 'Consistency & trajectory control',
        totalDurationMinutes: 60,
        equipmentList: '5-iron through pitching wedge, range balls',
        blocks: [
          { startMinute: 0,  durationMinutes: 10, blockName: 'Warm-Up',               drillDescription: 'Start with half-swings using an 8-iron. Focus on making crisp contact. Build to full swings over 10 balls before moving on.' },
          { startMinute: 10, durationMinutes: 15, blockName: '9-Iron Stock Shot',      drillDescription: 'Hit 20 balls with your 9-iron. Same target, same swing, every time. Note your average carry. This is your baseline for the iron.' },
          { startMinute: 25, durationMinutes: 15, blockName: '7-Iron Trajectory',      drillDescription: 'Hit 10 low shots (ball back in stance, hands forward) and 10 high shots (ball forward, full finish). Feel the difference in trajectory and landing.' },
          { startMinute: 40, durationMinutes: 15, blockName: '5-Iron Pressure Shots', drillDescription: 'Pick a specific target and imagine this is a par-3 tee shot in a match. Hit 15 balls using your full pre-shot routine. Commit to each one.' },
          { startMinute: 55, durationMinutes: 5,  blockName: 'Feel Finish',           drillDescription: '5 easy wedge swings. No target. Focus only on the feel of a balanced finish. End on a good note.' },
        ],
      },
      {
        title: 'Drive & Survive',
        focusArea: 'Driving',
        theme: 'Tee shots & fairway woods',
        totalDurationMinutes: 60,
        equipmentList: 'Driver, 3-wood, tees, range balls',
        blocks: [
          { startMinute: 0,  durationMinutes: 10, blockName: 'Warm-Up',               drillDescription: 'Wedge half-swings to mid-iron full swings. Build tempo gradually. Never start with the driver cold.' },
          { startMinute: 10, durationMinutes: 15, blockName: 'Fairway Woods',          drillDescription: '3-wood off a tee, then off the mat. Focus on sweeping through the ball — not hitting down. Hit 5 off a tee, then 10 off the mat.' },
          { startMinute: 25, durationMinutes: 20, blockName: 'Driver — Fairways First', drillDescription: 'Pick two range flags as your imaginary fairway. Hit 20 drives. Count how many land between the flags. Goal: 12 out of 20 in the fairway.' },
          { startMinute: 45, durationMinutes: 10, blockName: 'Shape It',              drillDescription: 'Hit 5 intentional draws (close stance, swing out to the right) and 5 fades (open stance, swing left). Feel the difference in your setup and impact.' },
          { startMinute: 55, durationMinutes: 5,  blockName: 'Confidence Finish',     drillDescription: '5 driver swings with one simple swing thought. Trust your move. Let it go.' },
        ],
      },
      {
        title: 'Competition Prep',
        focusArea: 'Pre-Round Readiness',
        theme: 'Simulate match conditions',
        totalDurationMinutes: 90,
        equipmentList: 'Full bag, range balls',
        blocks: [
          { startMinute: 0,  durationMinutes: 15, blockName: 'Full Bag Warm-Up',      drillDescription: '5 balls each: pitching wedge, 8-iron, 5-iron, hybrid, driver. Focus on your routine — not your results. Breathe and get loose.' },
          { startMinute: 15, durationMinutes: 20, blockName: 'Target Practice',        drillDescription: 'Pick 5 different targets at varying distances. Hit 3 balls to each with a full pre-shot routine. No practice swings between shots — simulate real play.' },
          { startMinute: 35, durationMinutes: 20, blockName: 'Short Game Circuit',     drillDescription: '5 minutes each: lag putting, 10-foot putts, chipping from the fringe, pitching from 30 yards. Move briskly — keep the pace.' },
          { startMinute: 55, durationMinutes: 20, blockName: 'Hole Simulation',        drillDescription: 'Pick a hole from a local course you know. Play 5 "holes" in your head: tee shot, approach, chip, putt — using your real routine for each shot.' },
          { startMinute: 75, durationMinutes: 15, blockName: 'Focus & Commit',         drillDescription: 'Hit 15 balls with ONE swing thought only. If your mind wanders or you rush, stop, reset, and start the count over. Finish at 15 clean, committed swings.' },
        ],
      },
    ]

    for (const plan of plans) {
      const { blocks, ...planData } = plan
      const [inserted] = await db
        .insert(schema.practicePlans)
        .values(planData)
        .returning({ id: schema.practicePlans.id })

      await db.insert(schema.practicePlanBlocks).values(
        blocks.map((b, i) => ({ ...b, planId: inserted.id, orderIndex: i }))
      )
    }

    console.log('✓ 5 placeholder practice plans inserted')
  } else {
    console.log('  Practice plans already exist, skipping')
  }

  console.log('\nSeed complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
