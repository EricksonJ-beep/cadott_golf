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

const PLACEHOLDER_CHALLENGES = [
  {
    name: 'Up & Down Streak',
    type: 'range' as const,
    category: 'chipping' as const,
    scoringType: 'makes_in_a_row' as const,
    description: 'Chip, then make the next putt. Score is consecutive successful up-and-downs.',
  },
  {
    name: 'Chip Ladder',
    type: 'range' as const,
    category: 'chipping' as const,
    scoringType: 'count' as const,
    unit: 'balls',
    description: 'Land balls progressively farther onto the green. Each chip must land past the previous one — if it falls short, the challenge ends and that ball does not count. Score is the number of successful chips in a row.',
  },
  {
    name: '5 in 9 Drill',
    type: 'range' as const,
    category: 'chipping' as const,
    scoringType: 'score_out_of' as const,
    maxScore: 9,
    description: 'Chip from 5 different locations around the green. After each chip, putt out. Your total stroke count must be 9 or fewer to pass — and at least one chip must be holed out. Score is your total strokes (lower is better).',
  },
  {
    name: '5 Foot Drill',
    type: 'range' as const,
    category: 'putting' as const,
    scoringType: 'makes_in_a_row' as const,
    description: 'Hit 5-foot putts and count how many you can make in a row. Score is your longest consecutive streak.',
  },
  {
    name: '100-Foot Drill',
    type: 'range' as const,
    category: 'putting' as const,
    scoringType: 'score_out_of' as const,
    maxScore: 250,
    description: 'Set up 4 putts at 5, 10, 15, and 20 feet around a hole at varying angles. Use your full pre-shot routine on every putt. Tally total feet made, then move to a new hole and repeat for 5 holes total (20 putts, 250 possible feet). Goal: 100+ feet made.',
  },
  {
    name: 'Clock Drill',
    type: 'range' as const,
    category: 'putting' as const,
    scoringType: 'score_out_of' as const,
    maxScore: 12,
    description: 'Place 12 putts around the hole like a clock at 4-5 feet. Score is total putts made.',
  },
  {
    name: 'Around-the-World (4x4 Drill)',
    type: 'range' as const,
    category: 'putting' as const,
    scoringType: 'count' as const,
    unit: 'rounds',
    description: 'Set 4 balls in a circle at 4 feet. You must make all 4 consecutively to complete one round. Score is the most full times around the world completed before a miss.',
  },
  {
    name: 'One-Ball Survival',
    type: 'range' as const,
    category: 'putting' as const,
    scoringType: 'count' as const,
    unit: 'feet' as const,
    description: 'Start at 10 feet and move back 5 feet at a time. Keep putting from increasing distances until you 3-putt. Score is the farthest distance reached.',
  },
  {
    name: 'Red Flag Challenge',
    type: 'range' as const,
    category: 'approach' as const,
    scoringType: 'score_out_of' as const,
    maxScore: 10,
    description: 'Hit 10 shots to the red flag on the range. Ball must hit or come to rest on the raised green to count. Score is out of 10.',
  },
  {
    name: 'Yellow Flag Challenge',
    type: 'range' as const,
    category: 'approach' as const,
    scoringType: 'score_out_of' as const,
    maxScore: 10,
    description: 'Hit 10 shots to the yellow flag on the range. Ball must hit or come to rest on the raised green to count. Score is out of 10.',
  },
  {
    name: 'Green Flag Challenge',
    type: 'range' as const,
    category: 'approach' as const,
    scoringType: 'score_out_of' as const,
    maxScore: 10,
    description: 'Hit 10 shots to the green flag on the range. Ball must hit or come to rest on the raised green to count. Score is out of 10.',
  },
  {
    name: 'Fairways in a Row',
    type: 'range' as const,
    category: 'driving' as const,
    scoringType: 'score_out_of' as const,
    maxScore: 10,
    description: 'Hit 10 shots at a fairway target on the range. A fairway is defined as landing between the Yellow and Green flags. Score is total fairways hit out of 10.',
  },
  {
    name: '200 Yard Fairway Challenge',
    type: 'range' as const,
    category: 'driving' as const,
    scoringType: 'makes_in_a_row' as const,
    description: 'Using any club, hit shots that land in the fairway (between the Yellow and Green flags) AND carry between 180–220 yards. Both conditions must be met to count. Score is your longest streak of consecutive qualifying shots.',
  },
  {
    name: '14 out of 14 Challenge',
    type: 'range' as const,
    category: 'driving' as const,
    scoringType: 'score_out_of' as const,
    maxScore: 14,
    description: 'Simulate a full round of tee shots on the range. Hit 8 drivers, 4 fairway woods (3-wood or other woods), and 2 hybrids or long irons — in any order. Count how many land in the fairway out of 14. Can you go 14 for 14?',
  },
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
  const existingPlans = await db.select({ title: schema.practicePlans.title }).from(schema.practicePlans)
  const existingPlanTitles = new Set(existingPlans.map((p) => p.title))
  const allPlans = [
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
    {
      title: "Tiger Woods' Masters Range Warmup",
      focusArea: 'Range',
      theme: 'Pre-round warmup routine',
      totalDurationMinutes: 60,
      equipmentList: 'Wedge, 8-iron, 4-iron, 5-iron, 5-wood, 3-wood, driver',
      blocks: [
        { startMinute: 0,  durationMinutes: 10, blockName: 'Wedge — 18 Shots',       drillDescription: 'Begin with 18 wedge shots. Focus on solid contact and consistent ball-striking to get your swing warmed up and grooved.' },
        { startMinute: 10, durationMinutes: 8,  blockName: '8 Iron — 10 Shots',      drillDescription: 'Hit 10 shots with your 8-iron. Build on the tempo from the wedge and commit to a specific target for each shot.' },
        { startMinute: 18, durationMinutes: 8,  blockName: '4–5 Iron — 9 Shots',     drillDescription: 'Hit 9 shots with a 4 or 5-iron. Lengthen your swing and focus on solid contact through the ball.' },
        { startMinute: 26, durationMinutes: 5,  blockName: '5 Wood — 4 Shots',       drillDescription: 'Hit 4 shots with your 5-wood. Smooth tempo — sweep through the ball, no forcing it.' },
        { startMinute: 31, durationMinutes: 6,  blockName: '3 Wood — 6 Shots',       drillDescription: 'Hit 6 shots with your 3-wood. Focus on a controlled, repeatable swing. Pick a target and commit.' },
        { startMinute: 37, durationMinutes: 6,  blockName: 'Driver — 7 Shots',       drillDescription: 'Hit 7 driver shots. Find your fairway — stay in control and hit your shape.' },
        { startMinute: 43, durationMinutes: 4,  blockName: '8 Iron — 3 Shots',       drillDescription: 'Come back down to the 8-iron for 3 shots. Reconnect with your rhythm and feel the iron swing again.' },
        { startMinute: 47, durationMinutes: 5,  blockName: 'Wedge — 5 Shots',        drillDescription: '5 wedge shots to refocus on precision and feel. Lock in your distance control and trajectory.' },
        { startMinute: 52, durationMinutes: 4,  blockName: '3 Wood — 2 Shots',       drillDescription: '2 final 3-wood shots. Smooth and confident — trust your swing.' },
        { startMinute: 56, durationMinutes: 4,  blockName: 'Driver — 2 Shots',       drillDescription: 'Finish with 2 driver swings. End on a confident, committed tee shot. See your shape and trust it.' },
        { startMinute: 60, durationMinutes: 5,  blockName: 'Wedge — 5 Shots (Finish)', drillDescription: '5 final wedge shots to end the session. Come back to feel and precision. Leave the range on a high note.' },
      ],
    },
  ]

  const missingPlans = allPlans.filter((p) => !existingPlanTitles.has(p.title))
  if (missingPlans.length > 0) {
    for (const plan of missingPlans) {
      const { blocks, ...planData } = plan
      const [inserted] = await db
        .insert(schema.practicePlans)
        .values(planData)
        .returning({ id: schema.practicePlans.id })

      await db.insert(schema.practicePlanBlocks).values(
        blocks.map((b, i) => ({ ...b, planId: inserted.id, orderIndex: i }))
      )
    }
    console.log(`✓ ${missingPlans.length} practice plan${missingPlans.length === 1 ? '' : 's'} inserted`)
  } else {
    console.log('  Practice plans already exist, skipping')
  }

  // Placeholder challenges (insert any missing by name)
  const existingChallenges = await db
    .select({ name: schema.challenges.name })
    .from(schema.challenges)
  const existingNames = new Set(existingChallenges.map((c) => c.name))
  const missingChallenges = PLACEHOLDER_CHALLENGES.filter((c) => !existingNames.has(c.name))

  if (missingChallenges.length > 0) {
    await db.insert(schema.challenges).values(missingChallenges)
    console.log(`✓ ${missingChallenges.length} placeholder challenge${missingChallenges.length === 1 ? '' : 's'} inserted`)
  } else {
    console.log('  Placeholder challenges already exist, skipping')
  }

  console.log('\nSeed complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
