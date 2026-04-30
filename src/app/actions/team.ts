'use server'

import { db } from '@/db'
import { rounds, roundHoles, users, challengeResults } from '@/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

async function requireCoach() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'coach') redirect('/dashboard')
  return session
}

export async function getTeamOverview() {
  await requireCoach()

  const players = await db
    .select({
      id: users.id,
      name: users.name,
      grade: users.grade,
      username: users.username,
    })
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(users.name)

  // Aggregate per-player round stats
  const stats = await db
    .select({
      userId: rounds.userId,
      roundsPlayed: sql<number>`count(distinct ${rounds.id})::int`.as('rounds'),
      avgScore: sql<number | null>`avg(${roundHoles.score})::float`,
      birdies: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = -1)::int`,
      eagles: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} <= -2)::int`,
    })
    .from(rounds)
    .leftJoin(roundHoles, eq(roundHoles.roundId, rounds.id))
    .groupBy(rounds.userId)

  const challengeCounts = await db
    .select({
      userId: challengeResults.userId,
      challengeLogs: sql<number>`count(${challengeResults.id})::int`,
    })
    .from(challengeResults)
    .groupBy(challengeResults.userId)

  const statsMap = new Map(stats.map((s) => [s.userId, s]))
  const challengeMap = new Map(challengeCounts.map((c) => [c.userId, c.challengeLogs]))

  return players.map((p) => ({
    ...p,
    roundsPlayed: statsMap.get(p.id)?.roundsPlayed ?? 0,
    avgScore: statsMap.get(p.id)?.avgScore ?? null,
    birdies: statsMap.get(p.id)?.birdies ?? 0,
    eagles: statsMap.get(p.id)?.eagles ?? 0,
    challengeLogs: challengeMap.get(p.id) ?? 0,
  }))
}

export async function getPlayerSummary(userId: number) {
  await requireCoach()

  const [user] = await db
    .select({ id: users.id, name: users.name, grade: users.grade, username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!user) return null

  const [roundSummary] = await db
    .select({
      roundsPlayed: sql<number>`count(distinct ${rounds.id})::int`,
      avgScore: sql<number | null>`avg(${roundHoles.score})::float`,
      avgPutts: sql<number | null>`avg(${roundHoles.putts})::float`,
      birdies: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = -1)::int`,
      eagles: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} <= -2)::int`,
      pars: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = 0)::int`,
      fairwaysHit: sql<number>`count(*) filter (where ${roundHoles.fairwayHit} = true)::int`,
      fairwayOpps: sql<number>`count(*) filter (where ${roundHoles.par} > 3)::int`,
      girHit: sql<number>`count(*) filter (where ${roundHoles.gir} = true)::int`,
      totalHoles: sql<number>`count(${roundHoles.id})::int`,
    })
    .from(rounds)
    .leftJoin(roundHoles, eq(roundHoles.roundId, rounds.id))
    .where(eq(rounds.userId, userId))

  const recentRounds = await db
    .select({
      id: rounds.id,
      date: rounds.date,
      courseName: rounds.courseName,
      holesPlayed: rounds.holesPlayed,
      totalScore: rounds.totalScore,
    })
    .from(rounds)
    .where(eq(rounds.userId, userId))
    .orderBy(desc(rounds.date), desc(rounds.id))
    .limit(5)

  return { user, summary: roundSummary, recentRounds }
}
