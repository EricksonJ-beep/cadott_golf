import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { and, eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const COURSE_ID = 'river-edge-golf-course-marshfield'

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
      'Dogleg left opener. White stakes (OB) line the left side (driving range) and run long of the green. Trees right of the fairway are well-spaced and forgiving.',
    teeShotNotes:
      'Tiger line is driver straight over the right fairway bunker. Missing right into the trees is not too penal — they are well-spaced and you can usually advance the ball.',
    approachNotes:
      'Straightforward approach into the green. Take care not to go long.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'White stakes (OB) left — the driving range fence runs the entire left side. Do not miss long of the green (OB).',
  },
  {
    holeNumber: 2,
    generalStrategy:
      'Straight par 5 with OB left the entire hole and multiple red-stake water hazards right. The hidden pond 200 yds right off the tee — just in front of the willow tree — is easy to miss if you aren\'t looking for it.',
    teeShotNotes:
      'White stakes (OB) run the entire left side. There is a small pond about 200 yds off the tee to the right, just in front of the willow tree — it is invisible unless you know it\'s there. Favor the middle of the fairway.',
    approachNotes:
      'Avoid the fairway bunker 100 yds from the green at all costs — it is very penal. There is also a pond right of the green that is easy to overlook from the fairway.',
    aroundGreenNotes:
      'Red stakes long of the green and a pond right of the green that sneaks up on you. Stay below the hole.',
    missAvoidNotes:
      'OB (white stakes) left the entire hole. Hidden pond 200 yds right off the tee. Pond right of the green is hard to see from the fairway. The fairway bunker 100 yds out is very penal.',
  },
  {
    holeNumber: 3,
    generalStrategy:
      'Short, driveable par 4. Pull driver if you can reach the green; otherwise play your straightest club and keep it simple. Red stakes (water) line the entire hole — left, right, and long of the green.',
    teeShotNotes:
      'If you can reach the green, hit driver. If you can\'t, hit your straightest club and play for position — do not take unnecessary risks with the water surrounding the hole.',
    approachNotes:
      'Play to the middle of the green. Do not get above the cup.',
    aroundGreenNotes:
      'Do not get above the cup on this green — putts from above are extremely difficult.',
    missAvoidNotes:
      'Red stakes (lateral water) surround the entire hole — left, right, and long of the green.',
  },
  {
    holeNumber: 4,
    generalStrategy:
      'Dogleg left par 5 loaded with water. Red stakes left and right off the tee, and four red-stake pond areas scattered throughout the hole. Smart course management wins here — do not be a hero with your second shot.',
    teeShotNotes:
      'Hit your tee shot 200 yds aimed at the big pond on the right side of the hole — this is the correct target line. Red stakes both left and right off the tee.',
    approachNotes:
      'If you are 100% sure you can carry the water with your second, go for it — there is lots of room left of the green to work with on your third. If you are only 99% sure, lay up 25 yds short of the willow tree. Balls will run out quite a bit here, and the same hidden pond from hole 2 sits just behind the willow — do not run through your layup zone.',
    aroundGreenNotes:
      'Plenty of room left of the green for a layup or a missed approach.',
    missAvoidNotes:
      'Four water areas (red stakes) in play throughout the hole. Do not go for the green in two unless you are 100% certain. The pond behind the willow tree will catch balls that run through the layup zone.',
  },
  {
    holeNumber: 5,
    generalStrategy:
      'Medium-length par 3 with a deceptive tee box. The tee box does not point at the green — it aims at the trees left. You must aim right of where your feet point.',
    teeShotNotes:
      'The tee box alignment is misleading — it points at the trees left of the green, not the green itself. Aim noticeably right of the direction the tee box sends you. Parking lot long of the green is OB (white stakes).',
    approachNotes: null,
    aroundGreenNotes:
      'Short left or pin-high right are the best misses on this hole.',
    missAvoidNotes:
      'Do not miss long (white stakes OB). Do not aim with the tee box — it will send you left of the green.',
  },
  {
    holeNumber: 6,
    generalStrategy:
      'Dogleg left with red stakes (water) the entire left side and surrounding the green on three sides. Miss right off the tee — there is much more room there than it looks.',
    teeShotNotes:
      'Tiger line is 215 yds straight over or just right of the single large tree in the left rough. You can miss the tee shot way right as long as you get it past the initial grouping of trees on the right. Red stakes the first 90 yds on the right and the entire left side.',
    approachNotes:
      'Red stakes surround the green on three sides. Aim for the middle or safest portion of the green — do not chase pins.',
    aroundGreenNotes:
      'Downhill putts are treacherously fast, especially to front hole locations.',
    missAvoidNotes:
      'Red stakes (water) the entire left side and surrounding the green on three sides. Never miss left. Downhill putts to the front are nearly unplayable — avoid above the hole.',
  },
  {
    holeNumber: 7,
    generalStrategy:
      'Short par 3 over water with red stakes surrounding most of the green. Left of the green is the only reasonable miss.',
    teeShotNotes:
      'Pond in front. Red stakes left, right, and long of the green. Aim for the middle-left of the green to give yourself a bailout if you miss.',
    approachNotes: null,
    aroundGreenNotes:
      'Left of the green is a decent place to miss — it is the only side without red stakes.',
    missAvoidNotes:
      'Do not miss right, long, or come up short (water in front). Left is the only safe miss.',
  },
  {
    holeNumber: 8,
    generalStrategy:
      'Dogleg left with a critical tee shot requirement. You must land right of the left-side 150 yd stake — anything one foot left of it has zero chance of reaching the green in regulation.',
    teeShotNotes:
      'Tiger line is 260 yds just inside the left-side 150 yd stake. Your tee shot must be right of that stake. There is more room in the right rough at the corner of the dogleg than it appears. Red stakes up most of the right side and parts of the left.',
    approachNotes:
      'Red stakes long of the green. Aim for the center of the green.',
    aroundGreenNotes:
      'Downhill putts to front hole locations are very slippery — be careful with lag putts.',
    missAvoidNotes:
      'Never go left of the left-side 150 yd stake off the tee — it eliminates any chance of reaching the green in two. Red stakes right and long of the green.',
  },
  {
    holeNumber: 9,
    generalStrategy:
      'Tight par 4 where accuracy is everything. Very little room to miss left or right. Red stakes the entire right side and parts of the left.',
    teeShotNotes:
      'Avoid the fairway bunker at all costs — lay up short of it if you cannot carry it. Red stakes the entire right side and parts of the left.',
    approachNotes:
      'Red stakes long of the green. Aim for the center of the green — this is not a hole to attack pins.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'The fairway bunker is very penal — never be in it. Red stakes the entire right side and long of the green. Very little margin for error on either side of the fairway.',
  },
  {
    holeNumber: 10,
    generalStrategy:
      'Dogleg right starting the back nine with a tee shot over the river. After clearing the water, no serious penalty areas — but the trees right of the fairway are a disaster.',
    teeShotNotes:
      'Tiger line is 260+ yds straight over the fairway bunker. Tee shot carries the river. The trees right of the fairway are a disaster — avoid them.',
    approachNotes:
      'The back side of this green is tricky — be precise about approach shot placement.',
    aroundGreenNotes:
      'Be careful with the back portion of this green — difficult putts can result from being above the hole back there.',
    missAvoidNotes:
      'Trees right of the fairway are the biggest threat after clearing the river. The back portion of the green creates very difficult putting situations.',
  },
  {
    holeNumber: 11,
    generalStrategy:
      'Uphill dogleg right par 5. Red stakes left in the landing area for long hitters. Trees right are tolerable off the tee but absolute death on approach shots and layups. Any back flag is a sucker pin.',
    teeShotNotes:
      'Red stakes left of the fairway in the landing area — long hitters must take note. Trees right of the fairway off the tee are less than ideal but not fatal.',
    approachNotes:
      'Trees right of the fairway on approach shots or layup shots are absolute death — do not go there. Any back flag on this green is a sucker pin — play to the safe portion of the green.',
    aroundGreenNotes:
      'Back flag locations are sucker pins — play to the front or middle of the green and take your par.',
    missAvoidNotes:
      'Never miss right on approach shots or layups — the trees are almost certain bogey or worse. Red stakes left in the landing area off the tee.',
  },
  {
    holeNumber: 12,
    generalStrategy:
      'The hardest hole on the golf course. Narrow, severely downhill dogleg right. Tee shot must be in the left side of the fairway to have any chance of reaching the green. Left trees are infinitely better than right trees.',
    teeShotNotes:
      'Your tee shot must be in the LEFT side of the fairway — left trees are infinitely better than right trees on this hole. Red stakes up most of the left side and the entire right side.',
    approachNotes:
      'Approach plays off a severe downslope — take extra care with club selection. A pond sits short left of the green.',
    aroundGreenNotes:
      'Putts on the back half of the green are almost always double-breakers. If the hole is in the front, a downhill putt is virtually impossible — do not give yourself one.',
    missAvoidNotes:
      'Never miss right off the tee — left trees are far more manageable. Pond short left of the green on approach. Front hole locations are treacherously difficult for putting.',
  },
  {
    holeNumber: 13,
    generalStrategy:
      'Mid-length par 3 over a ravine. White stakes (OB) the entire right side and long of the green; red stakes the entire left side. A hill between the trees and the cart path right of the green will save many shots from going OB.',
    teeShotNotes:
      'White stakes (OB) up the entire right side and long of the green. Red stakes the entire left side. Once past the trees right, a hill between the green and the cart path will catch many would-be OB shots — use this knowledge.',
    approachNotes: null,
    aroundGreenNotes:
      'Most putts on this green will break towards the water.',
    missAvoidNotes:
      'White stakes (OB) right and long of the green. Red stakes left. The hill right of the green is your friend if you miss right past the trees.',
  },
  {
    holeNumber: 14,
    generalStrategy:
      'Gigantic semicircular dogleg right par 5. White stakes (OB) line the entire hole both left and right. General theme: there is more room right than it looks, and less room left than you think.',
    teeShotNotes:
      'Tiger line is hugging the right tree line with driver. Once past the initial grouping of trees right, there is a clearing with more room than expected. White stakes (OB) the entire hole both left and right.',
    approachNotes:
      'White stakes (OB) long of the green. Trust that there is more room right than expected — do not get fooled into bailing left.',
    aroundGreenNotes: null,
    missAvoidNotes:
      'White stakes (OB) the entire hole left and right, and long of the green. The left side has less room than it looks — do not be fooled.',
  },
  {
    holeNumber: 15,
    generalStrategy:
      'Dead straight par 4 with OB both sides the entire length. Fairway bunkers are very penal — avoid at all costs. A ridge through the middle of the green demands precise approach placement.',
    teeShotNotes:
      'White stakes (OB) both left and right the entire length of the hole. Fairway bunkers are very penal — avoid them. Hit fairway.',
    approachNotes:
      'A ridge runs through the middle of the green — precise placement is essential. Putting from the wrong level of the ridge typically results in 3 putts.',
    aroundGreenNotes:
      'Putting from the wrong side of the ridge is a near-guaranteed 3 putt. Know which level the pin is on and land your approach on the correct side.',
    missAvoidNotes:
      'White stakes OB both sides the entire hole. Fairway bunkers are very penal. Approach to the wrong level of the ridge leads to 3-putt territory.',
  },
  {
    holeNumber: 16,
    generalStrategy:
      'Straight par 4 with white stakes (OB) left. Tiger line is over the right side of the fairway bunker. The 2nd shot plays downhill. Play more break than you think you need on all putts.',
    teeShotNotes:
      'Tiger line is driver over the right side of the fairway bunker. White stakes (OB) left the entire hole. Trees right of the fairway usually mean bogey or worse — do not overcook it right.',
    approachNotes:
      'Second shot plays downhill — account for the extra distance and club down accordingly.',
    aroundGreenNotes:
      'Play more break than you think you need on all putts, particularly on the front or right side of the green.',
    missAvoidNotes:
      'White stakes OB the entire left side. Trees right usually mean bogey or worse. Don\'t underestimate the break on the greens.',
  },
  {
    holeNumber: 17,
    generalStrategy:
      'Short par 3 with white stakes (OB) left the entire hole. The right bunker is manageable; the left bunker is not. Putt direction varies distinctly by position on the green.',
    teeShotNotes:
      'White stakes (OB) the entire left side. Aim center or slightly right of center to stay safe.',
    approachNotes: null,
    aroundGreenNotes:
      'Right bunker is usually easy to get up and down from. Left bunker is typically bad news. Putts on the right ⅔ of the green pull towards the bridge to 18; putts on the left ⅓ pull towards the left trees.',
    missAvoidNotes:
      'White stakes OB the entire left side. Avoid the left bunker — it is a difficult up-and-down.',
  },
  {
    holeNumber: 18,
    generalStrategy:
      'Finishing dogleg left with a picturesque 2nd shot over the river to an amphitheater green. Tiger line is 240 yds just inside the left-side 150 yd stake. The amphitheater green catches anything long or left — use it.',
    teeShotNotes:
      'Tiger line is 240 yds just inside the left-side 150 yd stake. Red stakes left the entire hole.',
    approachNotes:
      'Picturesque 2nd shot over the river (red stakes). The amphitheater-style green will catch anything that misses long or left — use that forgiving shape to your advantage and attack the flag.',
    aroundGreenNotes:
      'The amphitheater green naturally gathers balls that miss long or left. Great opportunity to finish strong.',
    missAvoidNotes:
      'Red stakes left the entire hole and over the river on the 2nd shot. The green is forgiving long and left, but do not be reckless with the river carry.',
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
    `✓ River Edge Golf Course guide seeded: ${inserted} inserted, ${updated} updated (${HOLES.length} holes)`,
  )
  process.exit(0)
}

main()
