import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import { and, eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const COURSE_NAME = 'Whispering Pines Golf'
const DATE = '2026-05-11'
const TEE_COLOR = 'white'
const PARS = [4, 4, 4, 3, 4, 3, 5, 4, 5, 4, 3, 4, 4, 5, 3, 4, 5, 4]

type Card = { username: string; scores: number[] }

const CARDS: Card[] = [
  // Brady Goettl — 81 (41 + 40)
  { username: 'bgoettl',    scores: [4,4,5,4,5,4,5,4,6, 4,4,5,5,5,2,5,6,4] },
  // Collin Kowalczyk — 85 (42 + 43)
  { username: 'ckowalczyk', scores: [6,3,5,3,5,6,5,4,5, 4,4,5,5,6,4,4,6,5] },
  // Jacob Anderson — 83 (41 + 42)
  { username: 'janderson',  scores: [5,5,4,3,4,3,7,4,6, 4,3,4,5,6,3,7,5,5] },
  // Max Demulling — 91 (42 + 49)
  { username: 'mdemulling', scores: [5,4,5,4,5,3,5,5,6, 5,5,6,5,8,3,6,5,6] },
  // Gavin Roscoe — 88 (46 + 42)
  { username: 'groscoe',    scores: [5,4,5,3,3,5,9,7,5, 5,4,4,5,5,3,5,6,5] },
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
      console.log(`  ${user.name}: round already exists (id ${existing[0].id}) — skipping`)
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
