'use server'

import { db } from '@/db'
import { rounds, roundHoles, users, seasons } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

type BoardRow = { userId: number; name: string; count: number }
type Board = {
  birdies: BoardRow[]
  eagles: BoardRow[]
  pars: BoardRow[]
}

async function getActiveSeasonId(): Promise<number | null> {
  const [season] = await db.select().from(seasons).where(eq(seasons.isActive, true)).limit(1)
  return season?.id ?? null
}

async function buildBoard(seasonId: number | null): Promise<Board> {
  const seasonFilter = seasonId !== null ? eq(rounds.seasonId, seasonId) : undefined

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      birdies: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = -1)::int`.as('birdies'),
      eagles: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} <= -2)::int`.as('eagles'),
      pars: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = 0)::int`.as('pars'),
    })
    .from(roundHoles)
    .innerJoin(rounds, eq(rounds.id, roundHoles.roundId))
    .innerJoin(users, eq(users.id, rounds.userId))
    .where(seasonFilter)
    .groupBy(users.id, users.name)

  const top5By = (key: 'birdies' | 'eagles' | 'pars'): BoardRow[] =>
    rows
      .map((r) => ({ userId: r.userId, name: r.name, count: r[key] }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

  return {
    birdies: top5By('birdies'),
    eagles: top5By('eagles'),
    pars: top5By('pars'),
  }
}

export async function getSeasonBoard() {
  const seasonId = await getActiveSeasonId()
  const board = await buildBoard(seasonId)
  const [season] = seasonId
    ? await db.select().from(seasons).where(eq(seasons.id, seasonId)).limit(1)
    : []
  return { board, seasonName: season?.name ?? null }
}

export async function getAllTimeBoard() {
  const board = await buildBoard(null)
  return { board }
}
