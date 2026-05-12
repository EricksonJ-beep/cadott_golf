import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { and, eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const COURSE_NAME = 'Northern Bay Golf Resort'
const DATE = '2026-05-07'
// Yardages from tournament scorecard (~6324) don't match a standard tee set in our
// database — likely tournament markers. Storing tee_color as null.
const TEE_COLOR = null
const PARS = [4, 3, 3, 4, 4, 5, 4, 5, 4, 3, 5, 4, 4, 4, 5, 4, 3, 4]

type Card = { username: string; scores: number[] }

const CARDS: Card[] = [
  // Brady Goettl — 76 (37 + 39)
  { username: 'bgoettl',    scores: [4,3,3,5,5,5,3,5,4, 3,5,5,5,4,4,4,3,6] },
  // Collin Kowalczyk — 80 (40 + 40)
  { username: 'ckowalczyk', scores: [5,3,4,4,3,5,5,6,5, 4,5,4,5,4,6,4,4,4] },
  // Jacob Anderson — 86 (43 + 43)
  { username: 'janderson',  scores: [5,3,4,6,4,7,5,5,4, 3,6,5,6,4,6,4,4,5] },
  // Max Demulling — 85 (43 + 42)
  { username: 'mdemulling', scores: [5,3,3,6,5,6,5,5,5, 4,7,5,4,5,7,4,2,4] },
  // Asher Sikora — 100 (53 + 47) — may already be self-recorded
  { username: 'asikora',    scores: [6,5,7,7,5,7,5,7,4, 4,7,6,5,6,5,4,5,5] },
]

async function getSeasonIdForDate(dateStr: string): Promise<number | null> {
  const all = await db.select().from(schema.seasons)
  const hit = all.find((s) => s.startDate <= dateStr && dateStr <= s.endDate)
  return hit?.id ?? null
}

async function main() {
  const seasonId = await getSeasonIdForDate(DATE)
  console.log(`Season for ${DATE}: ${seasonId ?? '(none)'}`)

  let inserted = 0
  let skipped = 0
  for (const card of CARDS) {
    const [user] = await db
      .select({ id: schema.users.id, name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.username, card.username))
      .limit(1)
    if (!user) {
      console.log(`! User not found: ${card.username} — skipping`)
      continue
    }

    if (card.scores.length !== 18) {
      console.log(`! ${user.name}: expected 18 holes, got ${card.scores.length} — skipping`)
      continue
    }
    const totalScore = card.scores.reduce((a, b) => a + b, 0)

    // Flag duplicate: skip if round already exists for this player/date/course
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
      .limit(1)
    if (existing.length > 0) {
      console.log(`⚠ DUPLICATE — ${user.name}: round already exists (id ${existing[0].id}) — skipping`)
      skipped += 1
      continue
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
        freeTextNotes: 'Imported from match scorecard',
        seasonId,
      })
      .returning({ id: schema.rounds.id })

    await db.insert(schema.roundHoles).values(
      card.scores.map((score, i) => ({
        roundId: round.id,
        holeNumber: i + 1,
        par: PARS[i],
        score,
        fairwayHit: null,
        gir: false,
        putts: 0,
      })),
    )

    console.log(`✓ ${user.name}: ${totalScore} (round id ${round.id})`)
    inserted += 1
  }

  console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`)
  process.exit(0)
}

main()
