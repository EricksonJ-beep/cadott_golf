import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../schema";
import { and, eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const COURSE_NAME = "Skyline Golf Club";
const DATE = "2026-05-19";
const TEE_COLOR = null;
const PARS = [4, 3, 5, 4, 5, 4, 4, 3, 4, 5, 4, 4, 4, 4, 3, 5, 3, 4];

type Card = {
  username: string;
  scores: number[];
  fairways?: Array<boolean | null>;
  gir?: boolean[];
  putts?: number[];
};

const CARDS: Card[] = [
  // Brady Goettl — 84 (+12)
  {
    username: "bgoettl",
    scores: [6, 4, 5, 4, 8, 5, 4, 3, 4, 7, 5, 4, 4, 4, 4, 5, 4, 4],
  },
  // Collin Kowalczyk — 81 (+9)
  {
    username: "ckowalczyk",
    scores: [3, 3, 6, 5, 6, 5, 4, 5, 4, 5, 4, 5, 3, 6, 4, 5, 4, 4],
  },
  // Jacob Anderson — 88 (+16)
  {
    username: "janderson",
    scores: [5, 4, 6, 5, 6, 5, 4, 4, 4, 7, 7, 4, 5, 5, 3, 5, 5, 4],
  },
  // Max Demulling — 88 (+16)
  {
    username: "mdemulling",
    scores: [4, 3, 5, 4, 6, 5, 5, 4, 5, 5, 4, 5, 6, 5, 6, 5, 5, 6],
  },
  // Gavin Roscoe — 87 (+15)
  {
    username: "groscoe",
    scores: [4, 3, 6, 4, 7, 6, 5, 4, 6, 5, 6, 3, 5, 4, 4, 6, 4, 5],
    // Fairways are only applicable on non-par-3 holes. Null means not tracked for that hole.
    fairways: [
      true,
      null,
      true,
      false,
      false,
      false,
      true,
      null,
      false,
      true,
      false,
      true,
      false,
      false,
      null,
      false,
      null,
      false,
    ],
    gir: [
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      false,
      false,
      true,
      false,
      true,
      false,
      false,
      false,
      false,
      true,
      false,
    ],
    putts: [1, 1, 1, 0, 3, 2, 2, 3, 2, 2, 1, 1, 2, 1, 2, 0, 2, 3],
  },
];

async function getSeasonIdForDate(dateStr: string): Promise<number | null> {
  const all = await db.select().from(schema.seasons);
  const hit = all.find((s) => s.startDate <= dateStr && dateStr <= s.endDate);
  return hit?.id ?? null;
}

async function main() {
  const seasonId = await getSeasonIdForDate(DATE);
  console.log(`Season for ${DATE}: ${seasonId ?? "(none)"}`);

  let inserted = 0;
  let skipped = 0;
  for (const card of CARDS) {
    const [user] = await db
      .select({ id: schema.users.id, name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.username, card.username))
      .limit(1);
    if (!user) {
      console.log(`! User not found: ${card.username} - skipping`);
      continue;
    }

    if (card.scores.length !== 18) {
      console.log(
        `! ${user.name}: expected 18 holes, got ${card.scores.length} - skipping`,
      );
      continue;
    }

    if (card.fairways && card.fairways.length !== 18) {
      console.log(
        `! ${user.name}: fairway stats should include 18 values - skipping`,
      );
      continue;
    }

    if (card.gir && card.gir.length !== 18) {
      console.log(
        `! ${user.name}: GIR stats should include 18 values - skipping`,
      );
      continue;
    }

    if (card.putts && card.putts.length !== 18) {
      console.log(
        `! ${user.name}: putting stats should include 18 values - skipping`,
      );
      continue;
    }

    const totalScore = card.scores.reduce((a, b) => a + b, 0);

    const existing = await db
      .select({ id: schema.rounds.id })
      .from(schema.rounds)
      .where(
        and(
          eq(schema.rounds.userId, user.id),
          eq(schema.rounds.date, DATE),
          eq(schema.rounds.courseName, COURSE_NAME),
        ),
      )
      .limit(1);
    if (existing.length > 0) {
      console.log(
        `! DUPLICATE - ${user.name}: round already exists (id ${existing[0].id}) - skipping`,
      );
      skipped += 1;
      continue;
    }

    const [round] = await db
      .insert(schema.rounds)
      .values({
        userId: user.id,
        date: DATE,
        courseName: COURSE_NAME,
        holesPlayed: 18,
        teeColor: TEE_COLOR,
        roundSegment: null,
        totalScore,
        weatherNotes: null,
        freeTextNotes:
          "Cloverbelt Conference Championship - imported from tournament scorecard",
        seasonId,
      })
      .returning({ id: schema.rounds.id });

    await db.insert(schema.roundHoles).values(
      card.scores.map((score, i) => ({
        roundId: round.id,
        holeNumber: i + 1,
        par: PARS[i],
        score,
        fairwayHit: card.fairways ? card.fairways[i] : null,
        gir: card.gir ? card.gir[i] : false,
        putts: card.putts ? card.putts[i] : 0,
      })),
    );

    console.log(`ok ${user.name}: ${totalScore} (round id ${round.id})`);
    inserted += 1;
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
  process.exit(0);
}

main();
