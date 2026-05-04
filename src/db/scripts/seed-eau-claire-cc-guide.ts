import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { and, eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const COURSE_ID = 'eau-claire-country-club-eau-claire'

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
      'Slightly uphill opener with Otter Creek nearby. Settle in — bogey is fine to start.',
    teeShotNotes:
      'Aim center fairway. Landing area is generous, but thick rough left and right with oaks punishes wide misses.',
    approachNotes:
      'Approach plays uphill to a large green with a small false front. Aim for the middle of the green — don\'t try to attack flags.',
    aroundGreenNotes:
      'Large green slopes back-to-front. Keep putts below the hole.',
    missAvoidNotes:
      'Short of the green is dead — the false front feeds it back. Avoid the rough on either side off the tee.',
  },
  {
    holeNumber: 2,
    generalStrategy:
      'Straightaway with tree trouble both sides. Elevated Redan-style green is more receptive than it looks.',
    teeShotNotes:
      'Tee shot down the middle. Tree trouble both sides — favor a straight ball or controlled cut to clear the lone tree right of the forward tees.',
    approachNotes:
      'Play a right-to-left approach into the elevated green. Be confident — the green is more receptive than it looks.',
    aroundGreenNotes:
      'Large Redan-style green; right-to-left shots release nicely.',
    missAvoidNotes:
      'Don\'t bail out into the trees on either side.',
  },
  {
    holeNumber: 3,
    generalStrategy:
      'Signature hole, #1 handicap. Play par and run — don\'t try to be a hero.',
    teeShotNotes:
      'Aim left-center off the tee to avoid the two right fairway bunkers and the hillside. Deep fescue and tall oaks lurk right.',
    approachNotes:
      'Green is perched on elevation. Take enough club — anything short rolls back off the front to a collection area.',
    aroundGreenNotes:
      'Tall oak guards right of the green; deep traps left. A short approach feeds back into the front collection area.',
    missAvoidNotes:
      'Do not miss long or left — near-impossible up-and-down. Bogey is a great score; don\'t compound mistakes.',
  },
  {
    holeNumber: 4,
    generalStrategy:
      'Longest par 3 on the course. Par steals a stroke on the field.',
    teeShotNotes:
      'Don\'t be fooled by the bunker 25 yards short of the green — it looks greenside. Club up to actually reach the putting surface.',
    approachNotes: null,
    aroundGreenNotes:
      'Large, deep green sloped back-to-front. Stay below the hole.',
    missAvoidNotes:
      'Avoid the natural areas / deep fescue left. If you must miss, miss short or right.',
  },
  {
    holeNumber: 5,
    generalStrategy:
      'Tightest tee shot on the front nine. Otter Creek runs left; the recently expanded pond is right.',
    teeShotNotes:
      'Prioritize fairway over distance. The carry over Otter Creek must avoid water both sides — creek left, pond right. Take less club if needed.',
    approachNotes:
      'Mid-to-long iron approach. Aim middle of the green and play for par.',
    aroundGreenNotes:
      'Run-offs all around the green. Two greenside bunkers sit left.',
    missAvoidNotes:
      'Water both sides off the tee — never flirt with either edge. Don\'t short-side left into the bunkers.',
  },
  {
    holeNumber: 6,
    generalStrategy:
      'Don\'t trust the handicap — the head pro calls it "the shortest par 5 on the course." Hit the green or pay a heavy price.',
    teeShotNotes:
      'Aim center, leaving an uphill putt. Take an extra club if windy — never short or long.',
    approachNotes: null,
    aroundGreenNotes:
      'Volcano-style elevated green with steep run-offs on all sides. Severe back-to-front slope. Above the hole is treacherous.',
    missAvoidNotes:
      'Any miss leaves the ball 6+ feet below the green surface. No safe miss — commit to hitting the putting surface.',
  },
  {
    holeNumber: 7,
    generalStrategy:
      'Brutal long par 4. Bogey is a great score — treat it like par. Ring the bell at the bottom of the fairway when the green is clear.',
    teeShotNotes:
      'Uphill 150+ yard carry from the back tees. Aim left-center — avoid the right fairway bunker at all costs.',
    approachNotes:
      'Approach plays downhill. Otter Creek runs right of the green — aim middle of the green, never right.',
    aroundGreenNotes:
      'Large green with collection areas left and right. Lag putts to the center.',
    missAvoidNotes:
      'Right is dead — Otter Creek runs the right side of the approach. Don\'t compound a mistake.',
  },
  {
    holeNumber: 8,
    generalStrategy:
      'Sweeping dogleg right with three staggered fairway bunkers. A scoring opportunity if you stay disciplined.',
    teeShotNotes:
      'Long hitters can unload, but keep the tee shot left to avoid the first right bunker. Fairway is the skinniest ribbon on the course.',
    approachNotes:
      'Don\'t short-side yourself — both greenside misses leave traps below an elevated green.',
    aroundGreenNotes:
      'Two greenside bunkers below an elevated green. Up-and-downs from those traps are tough.',
    missAvoidNotes:
      'The first right fairway bunker is the main tee-shot threat. Avoid short-siding into greenside bunkers.',
  },
  {
    holeNumber: 9,
    generalStrategy:
      'Longest hole on the course. Great birdie opportunity with a smart layup. Accuracy over power.',
    teeShotNotes:
      'Controlled tee shot down the center through the "grand hall" of tall trees. Two fairway bunkers left.',
    approachNotes:
      'Lay up to a comfortable wedge yardage. Don\'t try to reach in two unless conditions are perfect — fairway drops and doglegs right at ~pitching wedge distance with bunkers at the corners.',
    aroundGreenNotes:
      'Green built into a subtle hillside with bunkers left and right.',
    missAvoidNotes:
      'Avoid the two left fairway bunkers off the tee and the bunkers at the dogleg corner. Power is not rewarded here.',
  },
  {
    holeNumber: 10,
    generalStrategy:
      'Tee boxes wedged into the tree line — tight for a fade hitter. Par is a great start to the back nine.',
    teeShotNotes:
      'Right-to-left tee shot is ideal. Generous fairway, but bunkers left and deep right.',
    approachNotes:
      'Approach plays slightly uphill to an elevated green. Aim center — run-offs punish misses.',
    aroundGreenNotes:
      'Elevated green with a deep right trap and run-offs both sides.',
    missAvoidNotes:
      'Don\'t bail right off the tee — bunkers run deep. Avoid short-siding into the deep right trap on approach.',
  },
  {
    holeNumber: 11,
    generalStrategy:
      'Dramatic elevated tee into a valley. #2 handicap. Survive — accept a two-putt par.',
    teeShotNotes:
      'Otter Creek cuts the hole at ~285 yards. Lay back short of the creek unless you can comfortably carry it. Trees punish both sides.',
    approachNotes:
      'Tear-drop shaped green plays back uphill. The flag is your only target — green is hidden by elevation. Aim center.',
    aroundGreenNotes:
      'Two front guardian bunkers protect the green. Stay below the hole.',
    missAvoidNotes:
      'Don\'t try to carry Otter Creek without a comfortable cushion. Don\'t short-side into the front bunkers.',
  },
  {
    holeNumber: 12,
    generalStrategy:
      'Tee tucked in the bend of Otter Creek. Uphill par 3.',
    teeShotNotes:
      'Club up for the uphill yardage. Aim center — don\'t get cute with pin position.',
    approachNotes: null,
    aroundGreenNotes:
      'Large, deep, slick green sloped back-to-front. Stay below the hole — above leads to three-putts.',
    missAvoidNotes:
      'Two greenside bunkers. Short of the green is better than long or above the hole.',
  },
  {
    holeNumber: 13,
    generalStrategy:
      'Most visually intimidating tee shot on the course. Right-to-left ball flight preferred. A 3-wood off the tee is plenty.',
    teeShotNotes:
      'Aim at the right fairway bunkers as your target line to favor a draw. A large pine guards the left front of the fairway. Two fairway bunkers right at ~270 yards.',
    approachNotes:
      'Plan your second shot to avoid the second set of fairway traps and leave a comfortable wedge in.',
    aroundGreenNotes:
      'Standard green play — get to a wedge yardage for the third.',
    missAvoidNotes:
      'Don\'t go at the green in two unless conditions are perfect. A big number lurks if you bring fairway bunkers into play.',
  },
  {
    holeNumber: 14,
    generalStrategy:
      'Straightaway with a blind fairway that drops away. Wide ribbon of fairway — center-of-green play is the right call.',
    teeShotNotes:
      'Aim right-center — OB left is a card-wrecker. Trees right.',
    approachNotes:
      'Don\'t short-side yourself. Two front greenside bunkers sit well below the green surface — penalizing.',
    aroundGreenNotes:
      'Front greenside traps are punishing (well below the green surface as usual here). Beautiful fescue / tree backdrop.',
    missAvoidNotes:
      'OB left is the killer — never miss left. Don\'t go at front pins.',
  },
  {
    holeNumber: 15,
    generalStrategy:
      'Long, straightaway par 4. Accuracy over power off the tee.',
    teeShotNotes:
      'Narrow fairway running downhill with large trees both sides. Hit fairway — distance comes naturally on the downhill.',
    approachNotes:
      'Long iron or hybrid in. Play to the fat part of the green — long iron approaches into a 428-yard hole rarely call for flag-hunting.',
    aroundGreenNotes:
      'Large green with two bunkers. Center-green play is fine.',
    missAvoidNotes:
      'Avoid the trees on either side of a tight fairway.',
  },
  {
    holeNumber: 16,
    generalStrategy:
      'Shortest hole on the course but deceptively dangerous. The handicap (18) is misleading.',
    teeShotNotes:
      'Hit the green — period. Don\'t get cute with pin position. Take enough club to reach center even if windy.',
    approachNotes: null,
    aroundGreenNotes:
      'Elevated green with no safe miss. Greenside areas are severe.',
    missAvoidNotes:
      'Left = trap and steep fescue hillside. Right = two deep bunkers. Long = drops well below into the woods. Center green only.',
  },
  {
    holeNumber: 17,
    generalStrategy:
      'Long dogleg right par 4. Left-to-right tee shot ideal. No greenside bunkers — rare relief here.',
    teeShotNotes:
      'Avoid the small inside trap at 245 yards right — it\'s the real threat off the tee. Two fairway bunkers frame the corner at 280+.',
    approachNotes:
      'Long uphill approach. Go for the green.',
    aroundGreenNotes:
      'Slightly crowned green — be cautious with putts; aggressive efforts can roll off the surface.',
    missAvoidNotes:
      'The 245-yard inside-right trap is the main hazard off the tee.',
  },
  {
    holeNumber: 18,
    generalStrategy:
      'Shortest par 5 on the course but the most dramatic. Stay below the hole for an uphill birdie putt to finish strong.',
    teeShotNotes:
      'Baby fade preferred. Grip it and rip it if you can pull off the fade — wider fairway right of the right hill helps. Fairway bunker right at ~260 yards; another bunker further left.',
    approachNotes:
      'Uphill approach. Lay up to a comfortable yardage if not in good position. Approach demands precision.',
    aroundGreenNotes:
      'Turtleback green below the clubhouse, sloped back-to-front. Sheds balls in every direction. Stay below the hole.',
    missAvoidNotes:
      'Cart path and deep fescue right; trouble left. Don\'t be aggressive into the turtleback if you\'re scrambling.',
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
    `✓ Eau Claire CC guide seeded: ${inserted} inserted, ${updated} updated (${HOLES.length} holes)`,
  )
  process.exit(0)
}

main()
