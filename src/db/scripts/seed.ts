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
    description: 'Chip from the rough (not the fringe), then make the next putt. Score is consecutive successful up-and-downs.',
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
    name: 'Around-the-World (4 x 3)',
    type: 'range' as const,
    category: 'putting' as const,
    scoringType: 'count' as const,
    unit: 'rounds',
    description: 'Set 4 balls in a circle at 3 feet. You must make all 4 consecutively to complete one round. Score is the most full times around the world completed before a miss.',
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

  // Active season (regular)
  const existingSeasons = await db.select().from(schema.seasons)
  if (existingSeasons.length === 0) {
    await db.insert(schema.seasons).values({
      name: 'Spring 2026',
      startDate: '2026-03-01',
      endDate: '2026-06-09',
      isActive: true,
      kind: 'regular',
    })
    console.log('✓ Spring 2026 season created')
  } else {
    // Normalize Spring 2026 end-date so it doesn't overlap the new offseason window
    await db
      .update(schema.seasons)
      .set({ endDate: '2026-06-09' })
      .where(eq(schema.seasons.name, 'Spring 2026'))
    console.log('  Season already exists, normalized Spring 2026 end date to 2026-06-09')
  }

  // Offseason (2026–27)
  const offseasonExists = await db
    .select()
    .from(schema.seasons)
    .where(eq(schema.seasons.name, '2026–27 Offseason'))
    .limit(1)
  if (offseasonExists.length === 0) {
    await db.insert(schema.seasons).values({
      name: '2026–27 Offseason',
      startDate: '2026-06-10',
      endDate: '2027-03-30',
      isActive: true,
      kind: 'offseason',
    })
    console.log('✓ 2026–27 Offseason created')
  } else {
    console.log('  Offseason already exists, skipping')
  }

  // Placeholder practice plans
  const existingPlans = await db.select({ title: schema.practicePlans.title }).from(schema.practicePlans)
  const existingPlanTitles = new Set(existingPlans.map((p) => p.title))
  const allPlans = [
      {
        title: 'Full Bag Warm-Up',
        focusArea: 'Warm-Up',
        theme: 'Get loose, cover the bag',
        totalDurationMinutes: 45,
        equipmentList: 'Full bag, 1 basket of range balls (~40 balls)',
        blocks: [
          { startMinute: 0,  durationMinutes: 5,  blockName: 'Dynamic Warm-Up',          drillDescription: 'Light stretching and arm circles. Take 5 easy half-swings with a pitching wedge — no balls yet. Loosen your shoulders, hips, and back before you touch a ball.' },
          { startMinute: 5,  durationMinutes: 10, blockName: 'Short Irons & Wedges',     drillDescription: 'Hit 10 balls with your short irons and wedges (pitching wedge, 9-iron). Focus on solid contact and picking a specific target every shot. No lazy swings.' },
          { startMinute: 15, durationMinutes: 10, blockName: 'Mid Irons',                drillDescription: 'Hit 10 balls with your mid irons (6-iron, 7-iron, 8-iron). Focus on tempo — same pace back as through. Pick two clubs and split the balls between them.' },
          { startMinute: 25, durationMinutes: 10, blockName: 'Hybrids & Fairway Woods',  drillDescription: 'Hit 10 balls with your hybrids and fairway woods. Pick a landing area and commit to it. These clubs should feel smooth — resist the urge to swing hard.' },
          { startMinute: 35, durationMinutes: 10, blockName: 'Driver',                   drillDescription: 'Finish with 10 drives. Pick a fairway target — finding the short grass is the goal, not distance. If you miss, note which side and make one adjustment.' },
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
        totalDurationMinutes: 45,
        equipmentList: 'Driver, 3-wood, tees, range balls',
        blocks: [
          { startMinute: 0,  durationMinutes: 10, blockName: 'Warm-Up',               drillDescription: 'Wedge half-swings to mid-iron full swings. Build tempo gradually. Never start with the driver cold.' },
          { startMinute: 10, durationMinutes: 10, blockName: 'Fairway Woods',          drillDescription: 'Hit 10 balls with your 3-wood off a tee. Focus on sweeping through the ball — not hitting down. Pick a target for every swing.' },
          { startMinute: 20, durationMinutes: 10, blockName: 'Driver — Fairways First', drillDescription: 'Pick two range flags as your imaginary fairway. Hit 10 drives. Count how many land between the flags. Goal: 7 out of 10 in the fairway.' },
          { startMinute: 30, durationMinutes: 10, blockName: 'Shape It',              drillDescription: 'Hit 5 intentional draws (close stance, swing out to the right) and 5 fades (open stance, swing left). Feel the difference in your setup and impact.' },
          { startMinute: 40, durationMinutes: 5,  blockName: 'Confidence Finish',     drillDescription: '5 driver swings with one simple swing thought. Trust your move. Let it go.' },
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
      title: '5–10 Minute Putting Warm-Up',
      focusArea: 'Putting',
      theme: 'Quick pre-round putting prep',
      totalDurationMinutes: 10,
      equipmentList: 'Putter, 1 ball',
      blocks: [
        { startMinute: 0, durationMinutes: 3, blockName: 'Long Putts — Move Around', drillDescription: 'Hit 5 different putts from outside 30 feet, each to a new hole. Get a feel for the green speed and your stroke length on the longer putts.' },
        { startMinute: 3, durationMinutes: 2, blockName: 'Mid-Range Angles', drillDescription: 'At one hole, hit a 20-foot, 15-foot, and 10-foot putt — change the angle to the hole each putt by walking around the cup.' },
        { startMinute: 5, durationMinutes: 2, blockName: 'Short-Range Angles', drillDescription: 'Move to a new hole and hit an 8-foot, 6-foot, and 4-foot putt, changing the angle to the hole for each putt. Focus on a confident stroke.' },
        { startMinute: 7, durationMinutes: 3, blockName: 'Pressure Finish', drillDescription: 'Finish with two 5-foot putts (one left-to-right break and one right-to-left break) and finally two 3-foot putts: one downhill and one uphill. Leave the green confident.' },
      ],
    },
    {
      title: '30 Minute Putting Warm-Up',
      focusArea: 'Putting',
      theme: 'Full pre-round putting routine',
      totalDurationMinutes: 30,
      equipmentList: 'Putter, 3 balls, aim reference (optional)',
      blocks: [
        { startMinute: 0,  durationMinutes: 5,  blockName: 'Calibrate Start Line', drillDescription: 'Find a straight putt inside 8 feet. Hit multiple putts, stepping out of and back into your set-up between each putt. Rehearse getting into your set-up and getting comfortable. Use an aim reference for the first 10 putts (if you have one), then remove it.' },
        { startMinute: 5,  durationMinutes: 10, blockName: 'Ladder Drill — Speed Control', drillDescription: 'Block practice speed with a ladder drill using 3 balls. Move away from a hole putting uphill at 10 feet, 20 feet, 30 feet, and 40 feet. Then putt downhill to a hole at the same distance ranges (24 putts total).' },
        { startMinute: 15, durationMinutes: 5,  blockName: 'Random Speed — One Ball', drillDescription: 'Move around the green with one ball. Hit different putts from outside 20 feet using different slopes, changing the hole for every putt.' },
        { startMinute: 20, durationMinutes: 10, blockName: 'Routine Finish — 10 to 3 Feet', drillDescription: 'Putts from 10 feet down to 3 feet with one ball and your full routine. This is your time to mentally prepare for the first tee. Start with a putt from 10 feet, then move around the hole, changing the putt angle each time. Move closer to the hole one foot at a time, finishing at 3 feet. Aim to hole all putts from 6 feet and inside (take another go if you miss — you have time with 10 minutes allowed for 8 putts). You’ve calibrated your start line, got a feel for the green speed, read and hit different breaking putts, and warmed up your routine — you’re good to go!' },
      ],
    },
    {
      title: 'Whispering Pines on the Range — 9 Holes',
      focusArea: 'Course Simulation',
      theme: 'Play the front 9 at Whispering Pines from the practice tee',
      totalDurationMinutes: 35,
      equipmentList: 'Full bag, range balls',
      blocks: [
        { startMinute: 0, durationMinutes: 10, blockName: 'Warm-Up', drillDescription: `Loosen up with half-swings on a wedge, then build through 9-iron, 7-iron, and a hybrid. Hit 3-5 drivers to find your tee-shot shape. Don't skip this — you're about to "play" 9 holes.` },
        { startMinute: 10, durationMinutes: 5, blockName: 'How to Play', drillDescription: `You're going to play the front 9 at Whispering Pines (white tees) hole-by-hole on the range. For each hole:

• Hit your normal tee shot. Pick a fairway target on the range (two flags, or a defined width). Would your tee shot have hit the fairway? That's FIR. Par 3s don't count for FIR.

• Estimate your remaining yardage (hole yardage minus your tee carry). Play your approach with the right club. Pick a green target. Would your approach have hit the green? That's GIR.

• Par 5s: tee shot, then either a layup + wedge approach or a long approach if you can reach. Whatever your real play would be.

• Par 3s: the tee shot IS the approach — only GIR is in play.

You're not logging anything — just think about FIR and GIR after each shot. The point is to play with intent, not just hit balls.` },
        { startMinute: 15, durationMinutes: 20, blockName: 'Front 9 — Tee + Approach', drillDescription: `Play each hole in order. Take your time, hit your real club, commit to your target.

H1   Par 4   379y   tee + approach
H2   Par 4   333y   tee + approach
H3   Par 4   385y   tee + approach
H4   Par 3   153y   tee only (= approach)
H5   Par 4   330y   tee + approach
H6   Par 3   129y   tee only
H7   Par 5   378y   tee + approach (reachable)
H8   Par 4   229y   tee + approach (short par 4)
H9   Par 5   525y   tee + layup + approach

Front 9 par: 36.` },
      ],
    },
    {
      title: 'Whispering Pines on the Range — 18 Holes',
      focusArea: 'Course Simulation',
      theme: 'Play all 18 at Whispering Pines from the practice tee',
      totalDurationMinutes: 60,
      equipmentList: 'Full bag, range balls',
      blocks: [
        { startMinute: 0, durationMinutes: 10, blockName: 'Warm-Up', drillDescription: `Loosen up with half-swings on a wedge, then build through 9-iron, 7-iron, and a hybrid. Hit 3-5 drivers to find your tee-shot shape. Don't skip this — you're about to "play" 18 holes.` },
        { startMinute: 10, durationMinutes: 5, blockName: 'How to Play', drillDescription: `You're going to play Whispering Pines (white tees) hole-by-hole on the range. For each hole:

• Hit your normal tee shot. Pick a fairway target on the range (two flags, or a defined width). Would your tee shot have hit the fairway? That's FIR. Par 3s don't count for FIR.

• Estimate your remaining yardage (hole yardage minus your tee carry). Play your approach with the right club. Pick a green target. Would your approach have hit the green? That's GIR.

• Par 5s: tee shot, then either a layup + wedge approach or a long approach if you can reach. Whatever your real play would be.

• Par 3s: the tee shot IS the approach — only GIR is in play.

You're not logging anything — just think about FIR and GIR after each shot. The point is to play with intent, not just hit balls.` },
        { startMinute: 15, durationMinutes: 20, blockName: 'Front 9 — Tee + Approach', drillDescription: `Play each hole in order. Take your time, hit your real club, commit to your target.

H1   Par 4   379y   tee + approach
H2   Par 4   333y   tee + approach
H3   Par 4   385y   tee + approach
H4   Par 3   153y   tee only (= approach)
H5   Par 4   330y   tee + approach
H6   Par 3   129y   tee only
H7   Par 5   378y   tee + approach (reachable)
H8   Par 4   229y   tee + approach (short par 4)
H9   Par 5   525y   tee + layup + approach

Front 9 par: 36.` },
        { startMinute: 35, durationMinutes: 25, blockName: 'Back 9 — Tee + Approach', drillDescription: `Same routine. Same focus. Don't rush.

H10  Par 4   319y   tee + approach
H11  Par 3   153y   tee only
H12  Par 4   333y   tee + approach
H13  Par 4   329y   tee + approach
H14  Par 5   545y   tee + layup + approach
H15  Par 3   142y   tee only
H16  Par 4   393y   tee + approach
H17  Par 5   459y   tee + approach (reachable)
H18  Par 4   400y   tee + approach

Back 9 par: 36.

Goal: 50% fairways, 50% greens — anything above is gravy.` },
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
    {
      title: 'Mini Combine',
      focusArea: 'Game',
      theme: 'Weekly skills test — track the trend, not the day',
      totalDurationMinutes: 40,
      equipmentList: 'Wedge through 5-iron, range balls, paper or notes app',
      blocks: [
        { startMinute: 0, durationMinutes: 10, blockName: 'Warm-Up', drillDescription: 'Loosen up with half-swings on a wedge, then build through your irons. Get to a place where you trust your contact before starting the combine.' },
        { startMinute: 10, durationMinutes: 5, blockName: 'How to Score', drillDescription: `Pick a target flag on the range for each distance. After each shot, score it 0-3 based on how close you finished to that flag:

3 pts — Stiff. Inside ~5 yards of your target flag.
2 pts — In the target area. Inside ~15 yards of the flag.
1 pt — On the right line, just outside the area. Inside ~25 yards.
0 pts — Missed. Off line, off distance, or bad contact.

15 shots total. 45 points max.

PROGRESS BENCHMARKS
• Below 18 = work in progress. Focus on contact and direction first.
• 18-27 = solid high school player. You'll break 90 consistently.
• 28-33 = top of high school golf. You'll break 80.
• 34+ = college-level scoring zone. Keep grinding.

Same drill every week. Track the trend, not the day.` },
        { startMinute: 15, durationMinutes: 25, blockName: 'The Combine — 15 Shots', drillDescription: `Hit 3 shots at each distance. Pick a target flag on the range that matches each yardage. Score each shot 0-3 and total it up.

50 yds    ____  ____  ____   = ___ / 9
75 yds    ____  ____  ____   = ___ / 9
100 yds   ____  ____  ____   = ___ / 9
150 yds   ____  ____  ____   = ___ / 9
175 yds   ____  ____  ____   = ___ / 9

TOTAL: ____ / 45

Write down your club for each distance and any notes (what went well, what didn't). Save the score so you can compare next week.` },
      ],
    },
    {
      title: "'21 in a Row' Pressure Putting",
      focusArea: 'Game',
      theme: 'Two-player short-range pressure putting',
      totalDurationMinutes: 25,
      equipmentList: 'Putter, ball, one hole on a flat section of green',
      blocks: [
        { startMinute: 0, durationMinutes: 5, blockName: 'Warm-Up', drillDescription: 'Roll a few putts at the chosen hole to dial in green speed. Hit 5 putts each from 3, 4, and 5 feet without keeping score — just get the feel and find your line.' },
        { startMinute: 5, durationMinutes: 20, blockName: "'21 in a Row' — The Game", drillDescription: `Two players. Each player gets 7 putts at 3 feet, 7 putts at 4 feet, and 7 putts at 5 feet — 21 putts total. First player to make all 21 in a row wins.

Miss a putt? Your streak resets to 0 — start over from 3 feet.

Use the same flat hole for both players. Alternate turns within each distance so you both feel the pressure of watching the other player make putts.

Bring your full pre-shot routine on every putt. The whole point is to make pressure putts feel like normal putts.` },
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
