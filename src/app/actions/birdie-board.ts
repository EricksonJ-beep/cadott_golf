'use server'

import { db } from '@/db'
import { rounds, roundHoles, users, seasons, challenges, challengeResults } from '@/db/schema'
import { and, asc, desc, eq, isNotNull, max, sql } from 'drizzle-orm'
import { isHigherScoreBetter } from '@/lib/challenge-scoring'
import { getCurrentSeason } from '@/lib/seasons'

type BoardRow = { userId: number; name: string; count: number }
type Board = {
  birdies: BoardRow[]
  eagles: BoardRow[]
  pars: BoardRow[]
}

type ChallengeLeaderboardRow = {
  userId: number
  name: string
  bestScore: number
}

type ChallengeLeaderboard = {
  challengeId: number
  challengeName: string
  scoringType: 'score_out_of' | 'makes_in_a_row' | 'pass_fail' | 'count'
  unit: string | null
  maxScore: number | null
  higherIsBetter: boolean
  rows: ChallengeLeaderboardRow[]
}

type RoundScoreRow = {
  roundId: number
  userId: number
  name: string
  totalScore: number
  courseName: string
  date: string
}

export type LeaderboardView = 'season' | 'alltime'

export type LeaderboardSnapshot = {
  board: Board
  seasonName: string | null
  challenges: ChallengeLeaderboard[]
  lowest9Hole: RoundScoreRow[]
  lowest18Hole: RoundScoreRow[]
}

async function getActiveSeasonId(): Promise<number | null> {
  const season = await getCurrentSeason()
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

async function getChallengeLeaderboards(seasonId: number | null): Promise<ChallengeLeaderboard[]> {
  const activeChallenges = await db
    .select({
      id: challenges.id,
      name: challenges.name,
      category: challenges.category,
      scoringType: challenges.scoringType,
      unit: challenges.unit,
      maxScore: challenges.maxScore,
    })
    .from(challenges)
    .where(eq(challenges.isActive, true))
    .orderBy(
      challenges.category,
      sql<number>`case
        when ${challenges.name} = 'Up & Down Streak' then 0
        when ${challenges.name} = 'Chip Ladder' then 1
        when ${challenges.name} = '5 in 9 Drill' then 2
        when ${challenges.name} = '5 Foot Drill' then 0
        when ${challenges.name} = '100-Foot Drill' then 1
        when ${challenges.name} = 'Red Flag Challenge' then 0
        when ${challenges.name} = 'Yellow Flag Challenge' then 1
        when ${challenges.name} = 'Green Flag Challenge' then 2
        else 99
      end`,
      challenges.name,
    )

  const whereClause =
    seasonId === null
      ? undefined
      : eq(challengeResults.seasonId, seasonId)

  const aggregatedRows = await db
    .select({
      challengeId: challengeResults.challengeId,
      userId: challengeResults.userId,
      name: users.name,
      bestHigh: max(challengeResults.score).as('best_high'),
      bestLow: sql<number>`min(${challengeResults.score})::int`.as('best_low'),
    })
    .from(challengeResults)
    .innerJoin(users, eq(users.id, challengeResults.userId))
    .where(whereClause)
    .groupBy(challengeResults.challengeId, challengeResults.userId, users.name)

  const groupedByChallenge = new Map<number, typeof aggregatedRows>()

  for (const row of aggregatedRows) {
    const current = groupedByChallenge.get(row.challengeId) ?? []
    current.push(row)
    groupedByChallenge.set(row.challengeId, current)
  }

  return activeChallenges.map((challenge) => {
    const higherIsBetter = isHigherScoreBetter(challenge)
    const candidateRows = groupedByChallenge.get(challenge.id) ?? []

    const mappedRows = candidateRows.map((row) => ({
      userId: row.userId,
      name: row.name,
      bestScore: higherIsBetter ? row.bestHigh ?? 0 : row.bestLow ?? 0,
    }))

    const rows = mappedRows
      .sort((a, b) => (higherIsBetter ? b.bestScore - a.bestScore : a.bestScore - b.bestScore))
      .slice(0, 5)

    return {
      challengeId: challenge.id,
      challengeName: challenge.name,
      scoringType: challenge.scoringType,
      unit: challenge.unit,
      maxScore: challenge.maxScore,
      higherIsBetter,
      rows,
    }
  })
}

async function getLowestScores(holesPlayed: 9 | 18, seasonId: number | null): Promise<RoundScoreRow[]> {
  const whereClause =
    seasonId === null
      ? and(eq(rounds.holesPlayed, holesPlayed), isNotNull(rounds.totalScore))
      : and(
          eq(rounds.holesPlayed, holesPlayed),
          isNotNull(rounds.totalScore),
          eq(rounds.seasonId, seasonId),
        )

  const rows = await db
    .select({
      roundId: rounds.id,
      userId: rounds.userId,
      name: users.name,
      totalScore: rounds.totalScore,
      courseName: rounds.courseName,
      date: rounds.date,
    })
    .from(rounds)
    .innerJoin(users, eq(users.id, rounds.userId))
    .where(whereClause)
    .orderBy(asc(rounds.totalScore), asc(rounds.date), asc(rounds.id))
    .limit(10)

  return rows.map((row) => ({
    roundId: row.roundId,
    userId: row.userId,
    name: row.name,
    totalScore: row.totalScore ?? 0,
    courseName: row.courseName,
    date: row.date,
  }))
}

export async function getLeaderboardSnapshot(view: LeaderboardView, specificSeasonId?: number): Promise<LeaderboardSnapshot> {
  let seasonId: number | null = null

  if (specificSeasonId) {
    // Viewing a specific archived season
    seasonId = specificSeasonId
  } else if (view === 'season') {
    // Viewing current active season
    seasonId = await getActiveSeasonId()
  }
  // If view === 'alltime', seasonId stays null

  const [board, challenges, lowest9Hole, lowest18Hole, season] = await Promise.all([
    buildBoard(seasonId),
    getChallengeLeaderboards(seasonId),
    getLowestScores(9, seasonId),
    getLowestScores(18, seasonId),
    seasonId ? db.select().from(seasons).where(eq(seasons.id, seasonId)).limit(1) : Promise.resolve([]),
  ])

  return {
    board,
    seasonName: season[0]?.name ?? null,
    challenges,
    lowest9Hole,
    lowest18Hole,
  }
}

// Get all available seasons for archive selector
export async function getAvailableSeasons() {
  return db
    .select({
      id: seasons.id,
      name: seasons.name,
      startDate: seasons.startDate,
      endDate: seasons.endDate,
    })
    .from(seasons)
    .orderBy(desc(seasons.startDate))
}
