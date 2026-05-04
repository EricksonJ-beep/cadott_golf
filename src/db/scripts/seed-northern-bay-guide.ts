import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { and, eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const COURSE_ID = 'northern-bay-golf-resort-arkdale'

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
      'Par 4, 317 yds | Hcp 17. Flat, welcoming opener bracketed by resort condos. Bunker right of the fairway and a pair of bunkers left. Green has a steep back-to-front slope. Great chance to start with a confident par or birdie.',
    teeShotNotes:
      'Lay up short of all bunkers for a comfortable wedge in, or take an aggressive line clearing the left pair if you\'re feeling bold.',
    approachNotes:
      'Approach into a back-to-front green — leave it below the hole for an uphill putt.',
    aroundGreenNotes:
      'Steep back-to-front slope. Below the hole is the only place you want to putt from.',
    missAvoidNotes:
      'Right fairway bunker and the pair of left bunkers all in play off the tee.',
  },
  {
    holeNumber: 2,
    generalStrategy:
      'Par 3, 154 yds | Hcp 9. Solid mid-iron par 3. A slight ridge protects the front portion of the green — take enough club to fly it. A solid swing here gets the round off to a strong start.',
    teeShotNotes:
      'Trust your distance and grab one extra club. Aim for the middle of the green.',
    approachNotes: null,
    aroundGreenNotes: null,
    missAvoidNotes:
      'Coming up short leaves the front ridge in play. Don\'t underclub.',
  },
  {
    holeNumber: 3,
    generalStrategy:
      'Par 3, 164 yds | Hcp 5. REPLICA: Augusta National #16 ("Redbud") — site of Tiger\'s iconic 2005 chip. Mid-iron from elevated tees over a long, narrow pond to a beautifully undulating green framed by three large traps. Take your par and enjoy walking off Augusta\'s most famous par 3.',
    teeShotNotes:
      'Aim for the fat part of the green — the front-left section. Center is the smart, satisfying play.',
    approachNotes: null,
    aroundGreenNotes:
      'Below the hole leaves the best putt on the course.',
    missAvoidNotes:
      'Long, narrow pond fronting the green. Three large traps frame the green.',
  },
  {
    holeNumber: 4,
    generalStrategy:
      'Par 4, 442 yds | Hcp 1. REPLICA: Oakland Hills #5 ("The Monster") — Donald Ross\'s 1951 U.S. Open course Hogan tamed. The #1 handicap and a true championship test. Play it like a par 5 in your head — three shots to the green, two putts, walk off with a great score. Par here is a stroke gained on the field.',
    teeShotNotes:
      'Fairway first. Don\'t try to power through it — position over distance.',
    approachNotes:
      'Advance the ball, then knock it on. Center of green is the smart number.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Don\'t compound a mistake. Bogey is a fine score; double is the real enemy.',
  },
  {
    holeNumber: 5,
    generalStrategy:
      'Par 4, 347 yds | Hcp 15. Dogleg with bunkers left and right of the green. The smart line — right edge of the first bunker beyond the fairway — pays off; cutting the dogleg isn\'t worth the risk. Approach plays slightly longer than the actual yardage.',
    teeShotNotes:
      '3-wood off the tee, right edge of that first bunker is your target. The dogleg isn\'t worth cutting.',
    approachNotes:
      'Take one extra club to account for the play-up. Center of green is the smart play.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Bunkers left and right of the green frame the approach — center is the safest landing spot.',
  },
  {
    holeNumber: 6,
    generalStrategy:
      'Par 5, 565 yds | Hcp 3. REPLICA: Firestone South #16 ("The Monster") — Bert Way\'s 1929 design. 565-yard tree-lined par 5 that plays mostly downhill. Three good shots wins this hole — position over power. Bogey is a strong score; par is a celebration.',
    teeShotNotes:
      'Center of the fairway. Narrow tree-lined corridor — don\'t try to overpower it.',
    approachNotes:
      'Advance with a fairway metal, then approach with a confident wedge.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Trees both sides the entire hole. Stay in the fairway and you\'ll have a chance.',
  },
  {
    holeNumber: 7,
    generalStrategy:
      'Par 4, 399 yds | Hcp 7. Slight dogleg right. Tee shot favoring the left side of the fairway sets up the best angle in. Pin position guides how aggressive your second can be.',
    teeShotNotes:
      'Tee shot left-center for the best angle in.',
    approachNotes:
      'Check the pin — middle pin invites attack, edge pin calls for the fat part of the green.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Bookend bunkers protect both sides of the green. Don\'t short-side yourself.',
  },
  {
    holeNumber: 8,
    generalStrategy:
      'Par 5, 479 yds | Hcp 13. A reachable par 5 from the white tees and a real birdie opportunity. Left-center tee shot is ideal. Birdies are very available here.',
    teeShotNotes:
      'Left-center off the tee.',
    approachNotes:
      'If laying up: pick a comfortable wedge yardage you love. If going for it: aim right of the four pot bunkers for a safer angle in.',
    aroundGreenNotes:
      'Elevated, two-tiered green — match your tier to the pin.',
    missAvoidNotes:
      'Four pot bunkers guard the left side of the green for those going for it. Wrong tier on the two-tiered green = a long, lag-it-close putt.',
  },
  {
    holeNumber: 9,
    generalStrategy:
      'Par 4, 378 yds | Hcp 11. Straightforward par 4 — two solid shots get you home. A solid par hole to finish a strong front nine.',
    teeShotNotes:
      'Right-center of a generous landing area.',
    approachNotes:
      'Center of the green — keep it right of the bunkering.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Green is well-framed front and left — bail short and right is the forgiving miss.',
  },
  {
    holeNumber: 10,
    generalStrategy:
      'Par 3, 127 yds | Hcp 4. REPLICA: TPC Sawgrass #17 — THE ISLAND GREEN. The signature hole. Pete Dye\'s island green replica — voted one of Wisconsin\'s best par 3s. From 127 yds, this is a comfortable wedge. Wind typically blows into the tee. Take your time and enjoy the moment — this is THE hole.',
    teeShotNotes:
      'Read the wind carefully and trust one extra club if it\'s into your face. Aim for the center of the green — a tap-in par here is one of the best feelings in golf. Commit to the swing and watch it land.',
    approachNotes: null,
    aroundGreenNotes: null,
    missAvoidNotes:
      'Water surrounds the entire green. Wind into the tee is the norm — extra club, never a soft swing.',
  },
  {
    holeNumber: 11,
    generalStrategy:
      'Par 5, 455 yds | Hcp 10. REPLICA: Augusta National #13 ("Azalea") — the final hole of "Amen Corner," Bobby Jones\'s favorite. Very reachable in two from the white tees. Wide fairway with a big advantage if you can drive to the LEFT side. Classic risk/reward — birdies and eagles live here.',
    teeShotNotes:
      'Drive aggressively to the LEFT side for the best angle in.',
    approachNotes:
      'From the left side you\'ll likely have a mid-iron or hybrid to the green. If you have the shot, go for it. If laying up, pick a wedge yardage you love and play for birdie that way.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'A stream guards the front of the green. If you\'re going for it, commit to carrying it.',
  },
  {
    holeNumber: 12,
    generalStrategy:
      'Par 4, 392 yds | Hcp 8. REPLICA: Oakmont #3 (Henry Fownes — home of the famous "Furrowed" and "Church Pew" bunkers). A demanding par 4 with strategic bunkering. Fairway and green is the formula. Two-putt par walks off feeling earned.',
    teeShotNotes:
      'Fairway. The bunkers are there to be avoided — confident swing keeps you out of them.',
    approachNotes:
      'Center of the green — don\'t chase pins tucked near sand.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'The strategic bunkering is the entire hazard — if you avoid the sand, you have a chance.',
  },
  {
    holeNumber: 13,
    generalStrategy:
      'Par 4, 360 yds | Hcp 14. Slight dogleg left from a highly elevated tee. Reviewers call this one of the best non-replica holes on the course — enjoy it.',
    teeShotNotes:
      'Left-center off the tee to take the right fairway bunkers out of play. Driver can cut the corner if you\'re feeling confident.',
    approachNotes:
      'Approach plays from a downhill lie — aim left-center of the green.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Right-hand fairway bunkers reach into the landing zone. Two bunkers right of the green — left-center approach takes them out of play.',
  },
  {
    holeNumber: 14,
    generalStrategy:
      'Par 4, 336 yds | Hcp 16. Short, picturesque par 4 with a tree-lined fairway down the left. A well-placed tee shot carries the corner and sets up a short-iron birdie chance. Best birdie hole on the back nine.',
    teeShotNotes:
      'Aggressive tee shot to carry the left corner = real scoring chance.',
    approachNotes:
      'Wedge in. Favor the LEFT side of the green to keep the four pot bunkers out of play.',
    aroundGreenNotes: null,
    missAvoidNotes:
      '4 BLIND pot bunkers sit right of the green — favor the left side on approach.',
  },
  {
    holeNumber: 15,
    generalStrategy:
      'Par 5, 566 yds | Hcp 2. Long 3-shot par 5. Accuracy off the tee sets up the whole hole. Narrow tree-lined fairway, with the fairway narrowing further around the second-shot landing zone. Three controlled shots — patience wins. Bogey is a strong score; par is a victory.',
    teeShotNotes:
      'Position over power. Find the fairway — narrow tree-lined corridor.',
    approachNotes:
      'Aim left of the kidney bunker. Trust your yardage on the partially blind shot — center of the green is your friend.',
    aroundGreenNotes:
      'Far side of the green is partially blind over a hill — center is the percentage play.',
    missAvoidNotes:
      'Kidney-shaped bunker frames the right side of the green. The fairway narrows in the second-shot landing zone — long-and-loose tee shots get punished.',
  },
  {
    holeNumber: 16,
    generalStrategy:
      'Par 4, 377 yds | Hcp 12. Long par 4, slight dogleg right. Tee shot favoring the left corner sets up the best angle past the two right bunkers. Mid-iron second plays downhill through a chute to a narrow green sloping back-to-front.',
    teeShotNotes:
      'Left corner off the tee.',
    approachNotes:
      'Mid-iron, downhill — your club may carry a touch further. Leave it below the hole for an uphill putt at birdie.',
    aroundGreenNotes:
      'Back-to-front slope — keep putts below the hole.',
    missAvoidNotes:
      'Two bunkers right off the tee. Going long of this narrow green leaves a treacherous downhill putt.',
  },
  {
    holeNumber: 17,
    generalStrategy:
      'Par 3, 131 yds | Hcp 18. Picturesque short par 3 with two large white pines guarding the right side. Birdie opportunities live here. A confidence-builder heading into 18.',
    teeShotNotes:
      'Comfortable wedge or short iron. Read the wind and pick the right club to fly the pines clean. Aim left-center of the green and you\'ll have a putt at birdie. Commit to the swing.',
    approachNotes: null,
    aroundGreenNotes: null,
    missAvoidNotes:
      'Two large white pines guard the right side. Bunker right of the green — left-center is the smart play.',
  },
  {
    holeNumber: 18,
    generalStrategy:
      'Par 4, 430 yds | Hcp 6. REPLICA: Bay Hill #18 — Arnie\'s home course finishing hole, built in 1961, where Palmer fell in love with Bay Hill in an exhibition match. Considered the best replica on the course and one of the great finishing holes in golf. The grand finale — a fitting end to a memorable round.',
    teeShotNotes:
      'Drive aggressively — trouble is far enough from the tee that the fairway is reachable with a good swing.',
    approachNotes:
      'Pick your number and commit fully. If the match calls for safety, play short-left of the bunkers and chip on for a great look at par. If you need birdie, trust your yardage and go right at the green.',
    aroundGreenNotes:
      'Long, bending green rewards a smart, committed swing.',
    missAvoidNotes:
      'Water sits right of the green; three deep bunkers guard the left.',
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
    `✓ Northern Bay Golf Resort guide seeded: ${inserted} inserted, ${updated} updated (${HOLES.length} holes)`,
  )
  process.exit(0)
}

main()
