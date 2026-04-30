'use server'

import { db } from '@/db'
import { challenges, challengeResults, seasons, historicalSeasonStats, rounds, roundHoles } from '@/db/schema'
import { and, asc, desc, eq, max, min, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function requireUser() {
  const session = await auth()
  if (!session?.user) redirect('/')
  return session
}

export async function getMyPersonalBests() {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  return db
    .select({
      challengeId: challenges.id,
      name: challenges.name,
      category: challenges.category,
      scoringType: challenges.scoringType,
      maxScore: challenges.maxScore,
      unit: challenges.unit,
      bestScore: max(challengeResults.score).as('best_score'),
      attempts: sql<number>`count(${challengeResults.id})::int`.as('attempts'),
    })
    .from(challenges)
    .innerJoin(challengeResults, eq(challengeResults.challengeId, challenges.id))
    .where(and(eq(challenges.isActive, true), eq(challengeResults.userId, userId)))
    .groupBy(challenges.id, challenges.name, challenges.category, challenges.scoringType, challenges.maxScore, challenges.unit)
    .orderBy(challenges.category, challenges.name)
}

export async function getMyMostLoggedChallenge() {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  const [top] = await db
    .select({
      challengeId: challengeResults.challengeId,
      name: challenges.name,
      scoringType: challenges.scoringType,
      maxScore: challenges.maxScore,
      unit: challenges.unit,
      attempts: sql<number>`count(${challengeResults.id})::int`.as('attempts'),
    })
    .from(challengeResults)
    .innerJoin(challenges, eq(challenges.id, challengeResults.challengeId))
    .where(eq(challengeResults.userId, userId))
    .groupBy(challengeResults.challengeId, challenges.name, challenges.scoringType, challenges.maxScore, challenges.unit)
    .orderBy(desc(sql`attempts`))
    .limit(1)

  if (!top) return null

  const trend = await db
    .select({
      score: challengeResults.score,
      dateLogged: challengeResults.dateLogged,
    })
    .from(challengeResults)
    .where(
      and(
        eq(challengeResults.userId, userId),
        eq(challengeResults.challengeId, top.challengeId),
      ),
    )
    .orderBy(asc(challengeResults.dateLogged), asc(challengeResults.id))

  return { ...top, trend }
}

export async function getActiveSeasonName() {
  const [season] = await db.select().from(seasons).where(eq(seasons.isActive, true)).limit(1)
  return season?.name ?? null
}

export async function getMyRoundRecords() {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  // Live data from logged rounds
  const [live] = await db
    .select({
      lowestScore9:  sql<number | null>`min(${rounds.totalScore}) filter (where ${rounds.holesPlayed} = 9)`,
      lowestScore18: sql<number | null>`min(${rounds.totalScore}) filter (where ${rounds.holesPlayed} = 18)`,
      totalBirdies:  sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = -1)::int`,
      totalEagles:   sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} <= -2)::int`,
      totalRounds:   sql<number>`count(distinct ${rounds.id})::int`,
    })
    .from(rounds)
    .leftJoin(roundHoles, eq(roundHoles.roundId, rounds.id))
    .where(eq(rounds.userId, userId))

  // Historical (coach-entered) data
  const hist = await db
    .select()
    .from(historicalSeasonStats)
    .where(eq(historicalSeasonStats.userId, userId))
    .orderBy(desc(historicalSeasonStats.season))

  const histLowest9  = hist.filter(h => h.holesPlayed === 9 && h.lowestScore != null)
    .reduce<number | null>((acc, h) => acc === null || h.lowestScore! < acc ? h.lowestScore! : acc, null)
  const histLowest18 = hist.filter(h => h.holesPlayed === 18 && h.lowestScore != null)
    .reduce<number | null>((acc, h) => acc === null || h.lowestScore! < acc ? h.lowestScore! : acc, null)
  const histBirdies  = hist.reduce((s, h) => s + (h.birdies ?? 0), 0)
  const histEagles   = hist.reduce((s, h) => s + (h.eagles ?? 0), 0)
  const histRounds   = hist.reduce((s, h) => s + (h.roundsPlayed ?? 0), 0)

  const allTimeLowest9  = [live.lowestScore9,  histLowest9 ].filter(v => v != null).reduce<number | null>((a, v) => a === null || v! < a ? v! : a, null)
  const allTimeLowest18 = [live.lowestScore18, histLowest18].filter(v => v != null).reduce<number | null>((a, v) => a === null || v! < a ? v! : a, null)
  const allTimeBirdies  = (live.totalBirdies ?? 0) + histBirdies
  const allTimeEagles   = (live.totalEagles  ?? 0) + histEagles
  const allTimeRounds   = (live.totalRounds  ?? 0) + histRounds

  return {
    allTimeLowest9,
    allTimeLowest18,
    allTimeBirdies,
    allTimeEagles,
    allTimeRounds,
    historicalSeasons: hist,
  }
}
