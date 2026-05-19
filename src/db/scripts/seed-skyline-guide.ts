import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../schema";
import { and, eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const COURSE_ID = "skyline-golf-club-black-river-falls";

type HoleGuide = {
  holeNumber: number;
  generalStrategy: string | null;
  teeShotNotes: string | null;
  approachNotes: string | null;
  aroundGreenNotes: string | null;
  missAvoidNotes: string | null;
};

const HOLES: HoleGuide[] = [
  {
    holeNumber: 1,
    generalStrategy:
      "Par 4, 360 yds | Hcp 8. Strategic opener favoring a tee shot to the left side of the fairway, which simplifies the approach. A drive to the right-center may require navigating overhanging branches.",
    teeShotNotes:
      "Favor the LEFT side of the fairway — it opens the cleanest angle into the green and avoids the overhanging branches on the right.",
    approachNotes:
      "Short-to-mid iron from the left side. Hit the center of the green and take your par.",
    aroundGreenNotes: null,
    missAvoidNotes:
      "Right-center off the tee puts overhanging branches in play for the approach.",
  },
  {
    holeNumber: 2,
    generalStrategy:
      "Par 3, 160 yds | Hcp 17. Deceptively challenging. Left misses lead to delicate chips, especially with left pin placements. Right misses may find you under pine boughs and over a bunker.",
    teeShotNotes:
      "Play to the CENTER of the green. Left pin is a trap — take the left side out of play entirely.",
    approachNotes: null,
    aroundGreenNotes:
      "A left miss leaves a delicate chip with a tight lie. A right miss under pine boughs makes recovery nearly impossible.",
    missAvoidNotes:
      "Left of the green for left pins; right under the pines over the bunker.",
  },
  {
    holeNumber: 3,
    generalStrategy:
      "Par 5, 480 yds | Hcp 7. Ideal for players who draw the ball. Long hitters can attempt to cut over the left trees but risk ending up in the woods if unsuccessful. A bunker guards the left side of the green, with trees lurking on the right.",
    teeShotNotes:
      "Draw shape is rewarded here. Cutting over the left trees shortens the hole significantly — but only attempt it if you can reliably carry the corner.",
    approachNotes:
      "Lay up center-fairway if you cannot cut the corner. The third shot demands precision: avoid the left bunker and the trees right.",
    aroundGreenNotes:
      "Bunker left of the green is the primary hazard. Trees crowd the right side.",
    missAvoidNotes:
      "Left trees off the tee if you attempt the cut; left bunker on the approach.",
  },
  {
    holeNumber: 4,
    generalStrategy:
      "Par 4, 337 yds | Hcp 11. Accuracy off the tee is crucial with trees lining both sides. Left misses often lead to bogies. A far-right miss might offer a chance to recover with a well-hit iron over the trees.",
    teeShotNotes:
      "Hybrid or 3-wood into the tight fairway. Straight is the only shape — trees crowd both sides.",
    approachNotes:
      "Short iron from the fairway. Center of the green is the correct target; this is not a flag-hunting hole.",
    aroundGreenNotes: null,
    missAvoidNotes:
      "Left trees are the death miss. Right trees at least give you a recovery option.",
  },
  {
    holeNumber: 5,
    generalStrategy:
      "Par 5, 537 yds | Hcp 5. A challenging hole where a tee shot into the right trees forces a punch-out. Beyond the rise, the green tends to slope left to right.",
    teeShotNotes:
      "Stay LEFT of center off the tee. The right trees kill your line and force a punch-out, turning a birdie hole into a bogey.",
    approachNotes:
      "The green slopes left to right — miss left when possible. A conservative three-shot approach is the smart play.",
    aroundGreenNotes:
      "Left-to-right slope on the green. Leave yourself below the hole.",
    missAvoidNotes:
      "Right trees off the tee. The slope on the green makes right-side approaches unpredictable.",
  },
  {
    holeNumber: 6,
    generalStrategy:
      "Par 4, 374 yds | Hcp 10. A downhill tee shot sets up a short iron into the green. The green is tricky, especially with a deep left pin placement.",
    teeShotNotes:
      "Use the downhill to your advantage — driver down the center sets up a wedge. Don't overcook it through the fairway.",
    approachNotes:
      "Take dead aim at the CENTER of the green. A deep left pin is a trap — the left side of this green is very punishing.",
    aroundGreenNotes:
      "Left pin placement creates optical illusions. The green is trickier than it looks from the fairway.",
    missAvoidNotes:
      "Left of the green with a left pin leaves no recovery. Play to the middle.",
  },
  {
    holeNumber: 7,
    generalStrategy:
      "Par 4, 352 yds | Hcp 16. Birdie opportunity for big hitters who can leave a short iron into the green. Beware of a small puddle on the left side.",
    teeShotNotes:
      "Driver down the right-center takes the left puddle out of play and can leave a wedge in. Big hitters can take advantage here.",
    approachNotes:
      "Short iron or wedge — attack the flag. This is the best birdie opportunity of the front nine.",
    aroundGreenNotes: null,
    missAvoidNotes:
      "Small puddle on the left side of the fairway. Stay right-center off the tee.",
  },
  {
    holeNumber: 8,
    generalStrategy:
      "Par 3, 201 yds | Hcp 3. Aim for the right side; the green slopes hard from right to left. A well-placed shot to the right side of the green leaves a manageable downhill putt.",
    teeShotNotes:
      "Play to the RIGHT side of the green intentionally. The hard right-to-left slope will feed the ball toward center and leave a downhill putt rather than an uphill test.",
    approachNotes: null,
    aroundGreenNotes:
      "The slope is severe — any shot left of center will feed well past the hole. Right side only.",
    missAvoidNotes:
      "Left side of the green feeds into a very difficult two-putt position.",
  },
  {
    holeNumber: 9,
    generalStrategy:
      "Par 4, 410 yds | Hcp 1. Considered the most difficult hole by many regulars. A drive may end up halfway down a slope, complicating the second shot significantly. Plays longer than its yardage — bogey is a fine score.",
    teeShotNotes:
      "Commit to a line that avoids the slope. Even a well-struck drive can funnel into a side-hill lie that makes the approach awkward.",
    approachNotes:
      "The approach will often be from an uneven lie on a slope. Take extra club and aim for the center of the green — there is no flag-hunting here.",
    aroundGreenNotes:
      "The difficulty is mostly in the approach lie. Once on, two-putt and take your par.",
    missAvoidNotes:
      "Any drive that finds the slope leaves a very difficult second. Manage the tee shot first.",
  },
  {
    holeNumber: 10,
    generalStrategy:
      "Par 5, 515 yds | Hcp 13. Features a large tree atop a hill in the middle of the fairway. Decide whether to go over or around. The fairway slopes left to right — shots too far right risk going out of bounds.",
    teeShotNotes:
      "Decide before you step up: go OVER the tree or play around LEFT. Playing left of the tree avoids the slope that feeds toward OB on the right.",
    approachNotes:
      "Left-side layup protects against the right-to-left slope pushing your ball toward OB. Stay in the left half of the fairway on your layup.",
    aroundGreenNotes: null,
    missAvoidNotes:
      "Far right off the tee risks OB. Going over the tree without the carry leaves the worst possible position.",
  },
  {
    holeNumber: 11,
    generalStrategy:
      "Par 4, 385 yds | Hcp 4. Water left off the tee and a bunker on the right side of the green. The green's design creates optical illusions, making putting particularly challenging.",
    teeShotNotes:
      "Aim RIGHT of center off the tee to take the water left entirely out of play. A hybrid or 3-wood to the right side of the fairway is the smart play.",
    approachNotes:
      "Mid iron to the center of the green. The bunker right penalizes aggressive approaches — take the safe line.",
    aroundGreenNotes:
      "The green creates visual illusions from all angles. Trust your read more than your eyes — putts break differently than they appear.",
    missAvoidNotes: "Water left off the tee. Right-side bunker on approach.",
  },
  {
    holeNumber: 12,
    generalStrategy:
      "Par 4, 359 yds | Hcp 15. The fairway tightens up; consider leaving the driver in the bag. A well-placed drive just past the 150-yard markers, favoring center or left-center, sets up the best approach angle.",
    teeShotNotes:
      "3-wood or hybrid to the 150-yard marker. Center or left-center opens the best line into the green. Driver brings trouble into play.",
    approachNotes:
      "Short iron from the left-center. The approach angle from the right side is more challenging — stick to the plan.",
    aroundGreenNotes: null,
    missAvoidNotes:
      "Driver off the tee runs through the fairway into trouble. Right side off the tee closes the angle on the approach.",
  },
  {
    holeNumber: 13,
    generalStrategy:
      "Par 4, 336 yds | Hcp 12. A dogleg that tempts gamblers. A towering cut over the trees can leave a short pitch to the green. Alternatively, a layup to the dogleg's knee at 198 yards followed by an iron approach is the safer play.",
    teeShotNotes:
      "Decision hole: cut the corner over the trees (high-risk, short pitch reward) or play to the 198-yard knee and hit a standard iron approach. Know your game before you decide.",
    approachNotes:
      "If you played safe, a mid-iron into the green. If you cut the corner, a pitch shot — be precise.",
    aroundGreenNotes: null,
    missAvoidNotes:
      "Failing to carry the corner trees on the aggressive line leaves the worst possible angle. Know your carry distance before attempting.",
  },
  {
    holeNumber: 14,
    generalStrategy:
      "Par 4, 421 yds | Hcp 6. Favors players who can draw the ball. A well-positioned drive sets up a potential birdie opportunity on this longer par 4.",
    teeShotNotes:
      "Draw shape is the correct play — it follows the shape of the hole and sets up the best approach angle. A straight or fade leaves a more difficult angle in.",
    approachNotes:
      "Mid iron from the left-center of the fairway. With the right drive position, this is a genuine birdie chance — commit to the shot.",
    aroundGreenNotes: null,
    missAvoidNotes:
      "A fade off the tee leaves you on the wrong side of the fairway and closes the angle to the green.",
  },
  {
    holeNumber: 15,
    generalStrategy:
      "Par 3, 142 yds | Hcp 18. Uphill and requires precise aim. Overhitting leads to a very challenging chip from the bank behind the green. Club selection is critical.",
    teeShotNotes:
      "The uphill grade takes distance off — but do NOT overclub to compensate. The bank behind the green is a very difficult lie. Take your normal club and commit.",
    approachNotes: null,
    aroundGreenNotes:
      "The bank behind the green is steep and leaves a near-impossible chip. Short is far better than long on this hole.",
    missAvoidNotes:
      "Long into the bank behind the green is the worst miss. Short is far more manageable.",
  },
  {
    holeNumber: 16,
    generalStrategy:
      "Par 5, 483 yds | Hcp 9. Risk-reward hole. A tee shot that cuts the corner and clears the trees leaves a 200-yard shot to a downhill green. A safer tee shot to the dogleg's corner sets up a standard three-shot approach.",
    teeShotNotes:
      "Assess the risk: cutting the corner requires a specific carry to clear the trees. If you can make the carry, the reward is a reachable par 5. If not, play to the corner and take the safe three-shot route.",
    approachNotes:
      "The green is downhill — one less club than the yardage suggests. From a layup position, a wedge to the center of the green is the correct play.",
    aroundGreenNotes:
      "Downhill green — putts are faster than they appear. Lag well on any long birdie attempts.",
    missAvoidNotes:
      "Failing the corner carry leaves a blocked lie in the trees. Know your carry distance before committing.",
  },
  {
    holeNumber: 17,
    generalStrategy:
      "Par 3, 157 yds | Hcp 14. Beware of the large pine on the right, known for deflecting tee shots. Aiming for the center of the green is the solid, correct strategy.",
    teeShotNotes:
      "Center of the green — do not aim anywhere near the large pine on the right. The tree deflects shots in unpredictable ways. Take your extra club if the wind is into.",
    approachNotes: null,
    aroundGreenNotes:
      "Standard green — once on the putting surface, two-putt and move on.",
    missAvoidNotes:
      "The large pine on the right deflects shots and leaves an impossible recovery position.",
  },
  {
    holeNumber: 18,
    generalStrategy:
      "Par 4, 369 yds | Hcp 2. Accuracy off the tee is paramount. Left misses find a deep gulch; right misses lead to another gulch. The green is tiered from low in front to high in back; flag color indicates pin placement.",
    teeShotNotes:
      "The fairway is the ONLY option — gulches left and right are round-enders. Take enough club to reach the fairway and play away from both sides.",
    approachNotes:
      "Identify the tier before pulling a club. Front pin (low flag): play short. Back pin (high flag): take an extra club. Missing the correct tier leaves a very difficult two-putt.",
    aroundGreenNotes:
      "Tiered green — confirm pin placement and tier before your approach. Flag color indicates placement. Miss long on the back tier rather than short on the front.",
    missAvoidNotes:
      "Deep gulch left AND deep gulch right off the tee. This hole punishes any tee shot off the fairway.",
  },
];

async function main() {
  const [coach] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.username, "coach"))
    .limit(1);
  const updatedBy = coach?.id ?? null;

  let inserted = 0;
  let updated = 0;
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
      .limit(1);

    const values = {
      teeShotNotes: h.teeShotNotes,
      approachNotes: h.approachNotes,
      aroundGreenNotes: h.aroundGreenNotes,
      missAvoidNotes: h.missAvoidNotes,
      generalStrategy: h.generalStrategy,
      updatedBy,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(schema.courseHoleGuides)
        .set(values)
        .where(eq(schema.courseHoleGuides.id, existing.id));
      updated += 1;
    } else {
      await db.insert(schema.courseHoleGuides).values({
        courseId: COURSE_ID,
        holeNumber: h.holeNumber,
        ...values,
      });
      inserted += 1;
    }
  }

  console.log(
    `✓ Skyline Golf Club guide seeded: ${inserted} inserted, ${updated} updated (${HOLES.length} holes)`,
  );
  process.exit(0);
}

main();
