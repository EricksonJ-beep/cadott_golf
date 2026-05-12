import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { and, eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const COURSE_NAME = 'Lake Wissota Golf & Events'
const DATE = '2026-04-14'
const TEE_COLOR = 'red'
const PARS = [4, 3, 5, 3, 4, 4, 5, 4, 4] // front 9 only, sum = 36
const HOLES_PLAYED = 9

type Card = { username: string; scores: number[] }

const CARDS: Card[] = [
  // Braeden Frank — 43 (+7)
  { username: 'bfrank',   scores: [6,4,7,3,4,4,7,4,4] },
  // Asher Sikora — 48 (+12)
  { username: 'asikora',  scores: [4,7,5,5,5,5,7,6,4] },
  // Connor Goettl — 54 (+18)
  { username: 'cgoettl',  scores: [8,6,7,4,5,6,7,6,5] },
  // Michael Wellner — 60 (+24)
  { username: 'mwellner', scores: [7,5,9,5,7,7,7,7,6] },
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

    if (card.scores.length !== HOLES_PLAYED) {
      console.log(`! ${user.name}: expected ${HOLES_PLAYED} holes, got ${card.scores.length} — skipping`)
      continue
    }
    const totalScore = card.scores.reduce((a, b) => a + b, 0)

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
        holesPlayed: HOLES_PLAYED,
        teeColor: TEE_COLOR,
        roundSegment: null,
        totalScore,
        weatherNotes: null,
        freeTextNotes: 'Imported from JV match scorecard (Cloverbelt JV Match #2)',
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
