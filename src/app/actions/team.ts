'use server'

import { db } from '@/db'
import { rounds, roundHoles, users, seasons, challengeResults, playerClubs } from '@/db/schema'
import { and, desc, eq, sql, inArray } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getCurrentSeason } from '@/lib/seasons'

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

// seasonId = undefined → current season, null → career (all-time), number → specific season
export async function getPlayerSummary(userId: number, seasonId?: number | null) {
  await requireCoach()

  const [user] = await db
    .select({ id: users.id, name: users.name, grade: users.grade, username: users.username })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!user) return null

  // Resolve which season to display
  let selectedSeason: typeof seasons.$inferSelect | null = null
  if (seasonId === undefined) {
    selectedSeason = await getCurrentSeason()
  } else if (seasonId !== null) {
    const [s] = await db.select().from(seasons).where(eq(seasons.id, seasonId)).limit(1)
    selectedSeason = s ?? null
  }

  // All seasons this player has rounds in, newest first (for the selector)
  const playerSeasonIds = await db
    .selectDistinct({ seasonId: rounds.seasonId })
    .from(rounds)
    .where(eq(rounds.userId, userId))
  const nonNullSeasonIds = playerSeasonIds
    .map((r) => r.seasonId)
    .filter((id): id is number => id !== null)
  const playerSeasons =
    nonNullSeasonIds.length > 0
      ? await db
          .select({ id: seasons.id, name: seasons.name })
          .from(seasons)
          .where(inArray(seasons.id, nonNullSeasonIds))
          .orderBy(desc(seasons.startDate))
      : []

  // Where clause: filter by userId, and by season when not viewing career
  const roundsWhere = selectedSeason
    ? and(eq(rounds.userId, userId), eq(rounds.seasonId, selectedSeason.id))
    : eq(rounds.userId, userId)

  const [[roundSummary], playerRounds] = await Promise.all([
    db
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
        avgOnPar3: sql<number | null>`avg(${roundHoles.score}) filter (where ${roundHoles.par} = 3)::float`,
        avgOnPar4: sql<number | null>`avg(${roundHoles.score}) filter (where ${roundHoles.par} = 4)::float`,
        avgOnPar5: sql<number | null>`avg(${roundHoles.score}) filter (where ${roundHoles.par} = 5)::float`,
      })
      .from(rounds)
      .leftJoin(roundHoles, eq(roundHoles.roundId, rounds.id))
      .where(roundsWhere),
    db
      .select({
        id: rounds.id,
        date: rounds.date,
        courseName: rounds.courseName,
        holesPlayed: rounds.holesPlayed,
        teeColor: rounds.teeColor,
        totalScore: rounds.totalScore,
        roundSegment: rounds.roundSegment,
      })
      .from(rounds)
      .where(roundsWhere)
      .orderBy(desc(rounds.date), desc(rounds.id)),
  ])

  return { user, summary: roundSummary, playerRounds, selectedSeason, playerSeasons }
}

export async function getPlayerClubs(userId: number) {
  await requireCoach()

  return db.query.playerClubs.findMany({
    where: eq(playerClubs.userId, userId),
    with: {
      defaultClub: true,
      distances: {
        orderBy: (d, { desc }) => [desc(d.dateLogged), desc(d.id)],
      },
    },
    orderBy: (c, { asc }) => [asc(c.orderIndex)],
  })
}
