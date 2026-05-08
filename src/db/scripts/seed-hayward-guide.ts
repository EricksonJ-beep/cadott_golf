import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { and, eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const COURSE_ID = 'hayward-golf-club-hayward'

type HoleGuide = {
  holeNumber: number
  generalStrategy: string | null
  teeShotNotes: string | null
  approachNotes: string | null
  aroundGreenNotes: string | null
  missAvoidNotes: string | null
}

const HOLES: HoleGuide[] = [
  {
    holeNumber: 1,
    generalStrategy:
      'Par 4, 376 yds | Hcp 11. Dogleg-left opener. The green slopes back-to-front, so the goal is simple: fairway, then leave it below the hole. A confident start sets the tone.',
    teeShotNotes:
      'Aim right-center and let the dogleg work. A draw shape is rewarded — but don\'t blow it through the corner into trouble left.',
    approachNotes:
      'Below the hole is the only place to putt from. Center of the green is the smart number.',
    aroundGreenNotes:
      'Steep back-to-front slope. Above the hole runs out fast.',
    missAvoidNotes:
      'Overcooking the draw leaves trouble left of the fairway.',
  },
  {
    holeNumber: 2,
    generalStrategy:
      'Par 4, 330 yds | Hcp 15. Short dogleg right with bunkers left AND right of the fairway. Favor the LEFT half of the fairway off the tee — it opens the cleanest angle in.',
    teeShotNotes:
      '3-wood or hybrid down left-center. Driver brings the right fairway bunkers into play.',
    approachNotes:
      'Short wedge — pick a number, commit, fly it to the center.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Bunkers left and right are the entire defense — center fairway, center green is the formula.',
  },
  {
    holeNumber: 3,
    generalStrategy:
      'Par 3, 167 yds | Hcp 13. The green is 33 yards deep — pin position is everything. Confirm the pin before you pull a club; front to back can be a 2-club difference.',
    teeShotNotes:
      'Front pin: subtract a club. Back pin: add a club. Aim middle of the green and trust the number.',
    approachNotes: null,
    aroundGreenNotes:
      'Deep green = long lag putts are real. Two-putt par is a great score.',
    missAvoidNotes:
      'Wrong-club mistakes (too much for a front pin or too little for a back pin) leave 30+ yard putts on the same green.',
  },
  {
    holeNumber: 4,
    generalStrategy:
      'Par 5, 496 yds | Hcp 5. Reachable in two for big hitters but barely — two fairway bunkers in the landing area and pine forest behind the green. Three smart shots is the percentage play.',
    teeShotNotes:
      'Find the fairway. The two bunkers are sized to catch off-line drives — pick a target between them.',
    approachNotes:
      'Lay up to a wedge yardage you love. If you\'re going for it, commit fully — pine forest behind the green is no place to be.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Fairway bunkers in the landing zone. Long misses end up against the pine wall behind the green.',
  },
  {
    holeNumber: 5,
    generalStrategy:
      'Par 4, 360 yds | Hcp 7. Recently redesigned with fairway bunkers in play. The green slopes back-right to front-left — pin location dictates aggression.',
    teeShotNotes:
      'Position over distance. Pick a club that gets you past the fairway bunkers but leaves a comfortable wedge in.',
    approachNotes:
      'Match the slope — aim toward back-right and let it feed to a front-left pin, or just go straight at the center.',
    aroundGreenNotes:
      'Green feeds back-right to front-left. Read the slope into every chip and putt line.',
    missAvoidNotes:
      'Fairway bunkers on the rebuilt landing area.',
  },
  {
    holeNumber: 6,
    generalStrategy:
      'Par 4, 427 yds | Hcp 3. Long dogleg left and one of the toughest on the course. OB left and severe bunkers at the dogleg corner. From the blue tees the hole stretches long — patience here saves a card.',
    teeShotNotes:
      'Aim center-right and let the dogleg shape your line. Don\'t chase it left — OB is a scorecard killer.',
    approachNotes:
      'Long iron or hybrid. Center of the green. Walk off with par or bogey and move on.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'OB LEFT is the killer. Severe bunkers at the dogleg corner punish anyone cutting too much.',
  },
  {
    holeNumber: 7,
    generalStrategy:
      'Par 4, 409 yds | Hcp 1. The #1 handicap and a 400+ yard test from the blue tees. Multiple fairway bunkers off the tee, three greenside bunkers, and a green sloping back-left to front-right. Treat it like a par 5 in your head — bogey is a great score.',
    teeShotNotes:
      'Find the fairway through the bunker cluster. Position over power — don\'t compound a mistake.',
    approachNotes:
      'Center of the green. Below the hole. Don\'t chase a tucked pin.',
    aroundGreenNotes:
      'Three greenside bunkers; green slopes back-left to front-right. Below-the-hole is the only place to putt from.',
    missAvoidNotes:
      'Bunkers everywhere — fairway and greenside. Avoid them and bogey here is a stroke gained.',
  },
  {
    holeNumber: 8,
    generalStrategy:
      'Par 3, 174 yds | Hcp 17. Mid-iron par 3 with a water carry and a lateral hazard right. Pick the right club, commit, and never finish above the hole.',
    teeShotNotes:
      'Take enough club to fly the water clean — at 174 from the blues this is a confident mid-iron, not a wedge. Aim middle of the green. Below the hole is critical.',
    approachNotes: null,
    aroundGreenNotes:
      'Above-the-hole putts are downhill and slick. Anything below the hole is your friend.',
    missAvoidNotes:
      'Water carry front; lateral hazard right. Above the hole leaves a downhill, scary putt.',
  },
  {
    holeNumber: 9,
    generalStrategy:
      'Par 5, 519 yds | Hcp 9. Water hazard and a beach bunker guard the green. Three-shot par 5 is the smart play — birdies live in lay-up wedge yardages, not hero second shots.',
    teeShotNotes:
      'Big drive in the fairway sets up the lay-up choice. Don\'t try to overpower the hole.',
    approachNotes:
      'Lay up to your favorite wedge yardage. Going for it asks you to clear water and a beach bunker — high-risk, low-reward for a high schooler.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Water and beach bunker guarding the green make any "go-for-it" miss a compounding mistake.',
  },
  {
    holeNumber: 10,
    generalStrategy:
      'Par 4, 430 yds | Hcp 10. Long, tree-lined par 4 with a depression in front of the green and an uphill approach. The blue tees stretch this into a true 2-shot test — take one extra club on the second shot.',
    teeShotNotes:
      'Find the fairway through the tree-lined corridor.',
    approachNotes:
      'Uphill approach plays one extra club. The depression in front of the green eats anything a half-club short — fly it to the middle.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Trees both sides off the tee. The front-of-green depression catches anything short.',
  },
  {
    holeNumber: 11,
    generalStrategy:
      'Par 4, 389 yds | Hcp 6. Dogleg right with a large green. A tee shot favoring the LEFT fairway opens the angle in past the right fairway bunker.',
    teeShotNotes:
      'Aim left-center. The right fairway bunker is the entire defense off the tee.',
    approachNotes:
      'Large green — center is generous. Match your tier/level to the pin.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Right fairway bunker eats aggressive driver lines.',
  },
  {
    holeNumber: 12,
    generalStrategy:
      'Par 3, 197 yds | Hcp 14. Uphill par 3 to a severely pitched green. Plays one club longer than the number — from the blue tees that\'s a long iron or hybrid for most of the team.',
    teeShotNotes:
      'One extra club, no exceptions. Aim center of the green — pin-hunting is risky on the slope. A long iron or hybrid that finds putting surface is a great result.',
    approachNotes: null,
    aroundGreenNotes:
      'Severely pitched green — putts move fast. Below the hole is mandatory.',
    missAvoidNotes:
      'Underclubbing leaves a long uphill putt or worse, short of the green. Going above the hole leaves a slick downhill comebacker.',
  },
  {
    holeNumber: 13,
    generalStrategy:
      'Par 5, 488 yds | Hcp 8. A 2.2-acre pond down the right (added 2020), a depression left of the fairway, and a two-tiered green ringed by sand and mounds. Patience wins this hole.',
    teeShotNotes:
      'Stay LEFT of the pond — center-fairway is the safer line. The depression left is recoverable; the pond is not.',
    approachNotes:
      'Lay up to a wedge yardage you love. Match your tier to the pin — wrong tier = long lag putt.',
    aroundGreenNotes:
      'Two-tiered green with mounding around it. Tier match is critical to a close putt.',
    missAvoidNotes:
      'Pond right is the killer. Depression left is annoying but playable.',
  },
  {
    holeNumber: 14,
    generalStrategy:
      'Par 3, 155 yds | Hcp 16. SIGNATURE HOLE. Forced water carry tee-to-green to a wide but narrow green. Take a breath, take the moment in, and commit to the swing.',
    teeShotNotes:
      'Fly the water clean. Take one extra club into wind. Aim center of the green — par on the signature hole is a memory.',
    approachNotes: null,
    aroundGreenNotes:
      'Wide but narrow green — green geometry rewards a center landing.',
    missAvoidNotes:
      'Water tee-to-green. Short = wet. Long = trouble. Center is the only smart aim.',
  },
  {
    holeNumber: 15,
    generalStrategy:
      'Par 5, 504 yds | Hcp 4. Long dogleg-left par 5 down a tree-lined fairway. From the blue tees this is a true 3-shot par 5 — accuracy off the tee sets up everything.',
    teeShotNotes:
      'Center of the fairway. Trees both sides will eat anything off-line.',
    approachNotes:
      'Lay up to your favorite wedge yardage. Position over power.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Trees both sides — there\'s no recovery shot in there.',
  },
  {
    holeNumber: 16,
    generalStrategy:
      'Par 4, 280 yds | Hcp 18. Short par 4 with a dogleg left. Two routes: carry the trees left for a chance at the green, or play safe past the right fairway bunkers and wedge in.',
    teeShotNotes:
      'Smart play: hybrid or 3-wood past the right bunkers, then wedge in. Aggressive: driver over the left trees if you\'ve got the carry.',
    approachNotes:
      'Wedge in to a challenging green — pick a number and commit.',
    aroundGreenNotes:
      'Challenging green — read slope on every chip and putt.',
    missAvoidNotes:
      'Right fairway bunkers off the tee; trees left if you don\'t carry them clean.',
  },
  {
    holeNumber: 17,
    generalStrategy:
      'Par 4, 388 yds | Hcp 12. A lone Norway Pine sits in the fairway. Mid-iron approach to a small green surrounded by trees.',
    teeShotNotes:
      'Position your tee shot to the SIDE of the lone pine — don\'t end up directly behind it.',
    approachNotes:
      'Small target — center of the green is the smart number. Don\'t get cute with the pin.',
    aroundGreenNotes:
      'Trees surround the green — short-siding leaves no recovery.',
    missAvoidNotes:
      'Behind the lone Norway Pine = no shot. Trees around the green = no recovery from a short-side miss.',
  },
  {
    holeNumber: 18,
    generalStrategy:
      'Par 4, 370 yds | Hcp 2. Uphill dogleg-left finisher with a water hazard fronting the green and an undulating putting surface that demands a lofted approach.',
    teeShotNotes:
      'Center of the fairway. The dogleg-left is gentle — don\'t try to cut too much.',
    approachNotes:
      'Uphill — take one extra club. A LOFTED shot is required to hold the undulating green. Carry the water; never leave it short.',
    aroundGreenNotes:
      'Undulating green — lag with care. Long, breaking putts are the norm.',
    missAvoidNotes:
      'Water hazard fronts the green. Short = wet. Don\'t bail out with a low approach.',
  },
]

async function main() {
  const [coach] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.username, 'coach'))
    .limit(1)
  const updatedBy = coach?.id ?? null

  let inserted = 0
  let updated = 0
  for (const h of HOLES) {
    const [existing] = await db
      .select({ id: schema.courseHoleGuides.id })
      .from(schema.courseHoleGuides)
      .where(
        and(
          eq(schema.courseHoleGuides.courseId, COURSE_ID),
          eq(schema.courseHoleGuides.holeNumber, h.holeNumber),
        ),
      )
      .limit(1)

    const values = {
      teeShotNotes: h.teeShotNotes,
      approachNotes: h.approachNotes,
      aroundGreenNotes: h.aroundGreenNotes,
      missAvoidNotes: h.missAvoidNotes,
      generalStrategy: h.generalStrategy,
      updatedBy,
      updatedAt: new Date(),
    }

    if (existing) {
      await db
        .update(schema.courseHoleGuides)
        .set(values)
        .where(eq(schema.courseHoleGuides.id, existing.id))
      updated += 1
    } else {
      await db.insert(schema.courseHoleGuides).values({
        courseId: COURSE_ID,
        holeNumber: h.holeNumber,
        ...values,
      })
      inserted += 1
    }
  }

  console.log(
    `✓ Hayward Golf Club guide seeded: ${inserted} inserted, ${updated} updated (${HOLES.length} holes)`,
  )
  process.exit(0)
}

main()
