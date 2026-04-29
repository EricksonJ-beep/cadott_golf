'use server'

import { db } from '@/db'
import { challenges, challengeResults, seasons } from '@/db/schema'
import { and, asc, desc, eq, max, sql } from 'drizzle-orm'
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
