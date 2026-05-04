import { db } from '@/db'
import { seasons } from '@/db/schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'

export type SeasonKind = 'regular' | 'offseason'

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// Find the season whose date range contains the given date.
// Used to auto-tag rounds at log time so the round attaches to whichever
// season (regular or offseason) is in effect on that day.
export async function getSeasonIdForDate(dateStr: string): Promise<number | null> {
  const [season] = await db
    .select({ id: seasons.id })
    .from(seasons)
    .where(and(lte(seasons.startDate, dateStr), gte(seasons.endDate, dateStr)))
    .orderBy(desc(seasons.startDate))
    .limit(1)
  return season?.id ?? null
}

// The currently-running season for a given kind (date range contains today).
// Used as the default "current" pointer for stats/leaderboard views.
export async function getCurrentSeasonByKind(kind: SeasonKind) {
  const today = todayStr()
  const [season] = await db
    .select()
    .from(seasons)
    .where(
      and(
        eq(seasons.kind, kind),
        lte(seasons.startDate, today),
        gte(seasons.endDate, today),
      ),
    )
    .orderBy(desc(seasons.startDate))
    .limit(1)
  return season ?? null
}

// Most-recent season of a kind, used as a fallback when no season of that
// kind is currently in date range (e.g. early in the year before the
// next regular season has been created).
export async function getMostRecentSeasonByKind(kind: SeasonKind) {
  const [season] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.kind, kind))
    .orderBy(desc(seasons.startDate))
    .limit(1)
  return season ?? null
}

export async function getAllSeasonIdsByKind(kind: SeasonKind): Promise<number[]> {
  const rows = await db
    .select({ id: seasons.id })
    .from(seasons)
    .where(eq(seasons.kind, kind))
  return rows.map((r) => r.id)
}

// The season (any kind) whose date range contains today.
export async function getCurrentSeason() {
  const today = todayStr()
  const [season] = await db
    .select()
    .from(seasons)
    .where(and(lte(seasons.startDate, today), gte(seasons.endDate, today)))
    .orderBy(desc(seasons.startDate))
    .limit(1)
  return season ?? null
}

// The kind of the currently-active season (defaults to 'regular' when none found).
export async function getCurrentSeasonKind(): Promise<SeasonKind> {
  const season = await getCurrentSeason()
  return season?.kind ?? 'regular'
}
