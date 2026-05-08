import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { and, eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const COURSE_ID = 'big-fish-golf-club-hayward'

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
      'Par 4, 378 yds | Hcp 18. "Opening Act." Welcoming opener with a left-bending fairway and a generous driving target. The real test starts on the green — Big Fish surfaces are exceptionally fast.',
    teeShotNotes:
      'Aim for the generous left-bending landing area. Position over power — this is a fairway-first hole.',
    approachNotes:
      'Hit the CENTER of the green, not at the flag. The speed will surprise first-timers.',
    aroundGreenNotes:
      'Putts roll out fast. A back-left miss leaves the fringe entirely.',
    missAvoidNotes:
      'Back-left of the green is the worst miss — the slope sends it off the surface.',
  },
  {
    holeNumber: 2,
    generalStrategy:
      'Par 5, 525 yds | Hcp 8. "Rolling Thunder." Rolling fairway that filters right with significant mounding. The rightward tilt leaves a ball-below-feet stance for a long second — make tee shot position the priority.',
    teeShotNotes:
      'Favor the LEFT-CENTER of the fairway off the tee to find a flatter lie for your second.',
    approachNotes:
      'Three-shot approach is the smart play. Chasing the right side costs you the clean strike.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'The rightward mounding creates uneven lies and ball-below-feet seconds.',
  },
  {
    holeNumber: 3,
    generalStrategy:
      'Par 3, 149 yds | Hcp 10. "The Sand Moat." Short, charming-looking par 3 with a multi-tiered green and a bunker moat down the left. Center pin is manageable; an upper or lower shelf turns this into one of the trickiest one-shotters on the course.',
    teeShotNotes:
      'Identify the pin\'s tier before clubbing up. Playing to the wrong level is a two-putt minimum or worse.',
    approachNotes: null,
    aroundGreenNotes:
      'Multi-tiered green — match your tier to the pin or face a long lag.',
    missAvoidNotes:
      'Left-side bunker moat catches anything pulled.',
  },
  {
    holeNumber: 4,
    generalStrategy:
      'Par 4, 437 yds | Hcp 2. "Sandstorm." One of the longest par 4s in Wisconsin from the tips. From the blue tees this is a true 437-yard test — sand lines the entire left side of the fairway; right of the green is just as punishing. The green is long front-to-back but narrow laterally — par is a great score.',
    teeShotNotes:
      'Attack RIGHT-CENTER off the tee to take the left fairway bunkers out of play.',
    approachNotes:
      'Take enough club. Miss long before you miss short-right — the narrow green demands a committed strike.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Left fairway bunkers run the full length. Short-right of the green is the dead miss — the green is much narrower than it is long.',
  },
  {
    holeNumber: 5,
    generalStrategy:
      'Par 4, 337 yds | Hcp 14. "The Serpent." A serpentine bunker splits the approach, pointing players toward long and left. Follow the architecture\'s intent and this is a real birdie opportunity — the best on the front nine.',
    teeShotNotes:
      'Let the bunker dictate — hit to the LEFT side of the landing area.',
    approachNotes:
      'From the left side you\'ll have a short, clean wedge into birdie range.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'The serpentine bunker is the entire defense — fight the urge to bail right.',
  },
  {
    holeNumber: 6,
    generalStrategy:
      'Par 4, 410 yds | Hcp 6. "Dye-Abolical." A punishing Pete Dye classic. The fairway tilts hard left, so even a right-side drive rolls toward trouble. The elevated green dumps short approaches into bunkers below — par is a great score.',
    teeShotNotes:
      'Aim right of center; expect the slope to feed everything left. Don\'t fight the tilt.',
    approachNotes:
      'Take enough club to clear the front bunkers and aim at the CENTER of the green.',
    aroundGreenNotes:
      'An uphill flop is the only recovery from short — the slope and bunkers feed away from the green.',
    missAvoidNotes:
      'Short of the elevated green is the dead miss. Long is fine; short is dead.',
  },
  {
    holeNumber: 7,
    generalStrategy:
      'Par 5, 514 yds | Hcp 4. "The Signature." The most memorable hole on the front. Water lines the entire left side; the fairway slopes right-to-left toward the pond. Reachable in two if you can carry 230+ over the water threat.',
    teeShotNotes:
      'Stay RIGHT off the tee. The slope feeds left toward water — lean against it.',
    approachNotes:
      'Commit to right-of-center on the layup. Going for it in two requires a 230+ carry over the water.',
    aroundGreenNotes:
      'Front-left bunker is deep and craggy — long is far better than short-left.',
    missAvoidNotes:
      'Water down the entire left side. Avoid front-left at all costs.',
  },
  {
    holeNumber: 8,
    generalStrategy:
      'Par 4, 385 yds | Hcp 16. "Old Farmstead." Mid-length par 4 playing toward an old farm. Several deep pot bunkers guard the green — manageable from the fairway, but bunkered recovery is tough.',
    teeShotNotes:
      'Driver to a comfortable mid-iron. Find the fairway — the pot bunkers around the green are the entire defense.',
    approachNotes:
      'Mid-iron approach. Center of the green, not at flags near sand.',
    aroundGreenNotes:
      'Pot bunkers around the green make recovery tricky — accept par if you find one.',
    missAvoidNotes:
      'Driver risks running into the pot bunkers short of the green.',
  },
  {
    holeNumber: 9,
    generalStrategy:
      'Par 3, 123 yds | Hcp 12. "Mulligan\'s Farewell." Deceptive front-nine finisher. The green tilts sharply uphill front-to-back; surrounding bunkers are among the most treacherous on the course. Halfway house waits just beyond.',
    teeShotNotes:
      'One extra club — the upslope kills distance. Miss on the LOWER portion of the green rather than going long.',
    approachNotes: null,
    aroundGreenNotes:
      'A putt from above the hole on this surface is a nightmare. Below the hole only.',
    missAvoidNotes:
      'Surrounding bunkers are punishing. Long is the worst miss — speed control is nearly impossible from above the hole.',
  },
  {
    holeNumber: 10,
    generalStrategy:
      'Par 4, 362 yds | Hcp 15. "Wide Open." Welcoming back-nine opener. The left side of the fairway is generous; the green is slightly elevated. A confidence-builder before the real challenge starts.',
    teeShotNotes:
      'Aim for the wide LEFT landing zone — the approach plays better from there.',
    approachNotes:
      'Slightly uphill — take enough club to reach the green. Aim center.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'Two back-left bunkers catch more balls than they should — don\'t fly the green.',
  },
  {
    holeNumber: 11,
    generalStrategy:
      'Par 4, 345 yds | Hcp 17. "Tall Timber." Gorgeous par 4 tucked beyond the cart paths. Tee boxes sit deep among tall trees; both shots play through a narrower corridor than the yardage suggests.',
    teeShotNotes:
      'Plays longer than the yardage — straight, not big. Stay out of the trees.',
    approachNotes:
      'Carry the front-right bunker COMPLETELY. A half-carry hits the berm face and leaves a near-impossible recovery.',
    aroundGreenNotes:
      'Undulating green — match your tier to the pin.',
    missAvoidNotes:
      'Trees both sides; front-right berm-bunker is the dead miss.',
  },
  {
    holeNumber: 12,
    generalStrategy:
      'Par 3, 174 yds | Hcp 13. "High Wire." Highly elevated tee shot — plays shorter than the yardage. One of the best birdie opportunities on the course.',
    teeShotNotes:
      'AT LEAST one less club for the elevation drop. Find the center and let the slope work for you on the putt.',
    approachNotes: null,
    aroundGreenNotes: null,
    missAvoidNotes:
      'Underclub for the drop; over-clubbing long is the common miss.',
  },
  {
    holeNumber: 13,
    generalStrategy:
      'Par 5, 487 yds | Hcp 9. "Best in Wisconsin." Widely regarded as one of the finest par 5s in the state. The hole funnels left and drops dramatically downhill to a small green nestled between trees on three sides.',
    teeShotNotes:
      'Take advantage of the wide driving area — a big tee shot is rewarded.',
    approachNotes:
      'Don\'t rush home in two. Layup position matters enormously — fairway, not trees right.',
    aroundGreenNotes:
      'Third shot is 20+ feet below your feet to a small green framed by trees — disorienting but stunning.',
    missAvoidNotes:
      'Trees three sides of the green — center is your only target.',
  },
  {
    holeNumber: 14,
    generalStrategy:
      'Par 4, 398 yds | Hcp 3. "Uphill Battle." Trees border the left side the entire hole; the tee shot can go right — even well right — as long as you don\'t reach the right tree line. From the blue tees this stretches to nearly 400 yards uphill — a true 2-shot test. Crowned green repels edge approaches.',
    teeShotNotes:
      'Right side is fine — just stay short of the right tree line. Avoid the left trees at all costs.',
    approachNotes:
      'ONE FULL CLUB more — the uphill grade adds significant distance needed. Center of the green only.',
    aroundGreenNotes:
      'Crowned green complex deflects edges away. Center is the only target.',
    missAvoidNotes:
      'Pot bunkers in the uphill approach area. Edges of the crown leak off.',
  },
  {
    holeNumber: 15,
    generalStrategy:
      'Par 4, 464 yds | Hcp 1. "The Beast." The #1 handicap hole and one of the hardest par 4s in Wisconsin. From the blue tees the hole stretches to 464 yards — long, tight, and relentlessly punishing. Bogey is a victory for most — play it like a par 5 in your head.',
    teeShotNotes:
      'Grip it and rip it — you need every yard. The fairway doglegs, so commit to the line.',
    approachNotes:
      'Carry the ravine on the right and stay clear of the false front. There is no safe miss — fly it to the green.',
    aroundGreenNotes:
      'False front rejects anything short — this green doesn\'t accept timid.',
    missAvoidNotes:
      'Ravine right and short-right; false front short. There is no safe miss here.',
  },
  {
    holeNumber: 16,
    generalStrategy:
      'Par 3, 179 yds | Hcp 11. "Precision Required." Signature Pete Dye par 3. A long waste area and sand trap run the full length of the approach. Absolute precision required.',
    teeShotNotes:
      'Take enough club to find the putting surface. Short-and-in-sand is FAR better than long-and-right.',
    approachNotes: null,
    aroundGreenNotes:
      'Long-right run-off leaves a nearly impossible up-and-down.',
    missAvoidNotes:
      'Waste area + sand fronts the entire approach. Long-right is the dead miss.',
  },
  {
    holeNumber: 17,
    generalStrategy:
      'Par 5, 524 yds | Hcp 5. "The Penultimate." The right side of the fairway is much more open than it looks from the tee. Heavy mounding can leave awkward seconds. Pot bunkers guard front and right of the green.',
    teeShotNotes:
      'Drive RIGHT — don\'t be intimidated by the trees on that side. It\'s the correct play.',
    approachNotes:
      'Lay up short of the pot bunkers if needed. Back-right pin is a trap — take an extra club and putt from the back fringe rather than short-side yourself.',
    aroundGreenNotes:
      'Back-right approaches slip off the back. Front and right pot bunkers must be carried.',
    missAvoidNotes:
      'Pot bunkers front and right of the green. Short-siding a back-right pin is the worst place to be.',
  },
  {
    holeNumber: 18,
    generalStrategy:
      'Par 4, 417 yds | Hcp 7. "Perched Finish." A fitting finale on a thin, perched green that runs downhill from middle to back. False front is merciless — anything short returns to your feet.',
    teeShotNotes:
      'Right side of the fairway is more open and leaves a safer angle; the left is shorter but tighter. Pick your trade-off.',
    approachNotes:
      'HALF-CLUB MORE than you think. Do not miss short — the false front kicks everything back.',
    aroundGreenNotes:
      'Green runs downhill middle-to-back. Below the hole is the only place to putt from.',
    missAvoidNotes:
      'False front is merciless — short equals back at your feet.',
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
    `✓ Big Fish Golf Club guide seeded: ${inserted} inserted, ${updated} updated (${HOLES.length} holes)`,
  )
  process.exit(0)
}

main()
