'use server'

import { db } from '@/db'
import { challenges, challengeResults, historicalSeasonStats, rounds, roundHoles } from '@/db/schema'
import { and, asc, desc, eq, inArray, max, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { BADGE_DEFS, computeEarnedBadges, type EarnedMap, type RoundForBadges } from '@/lib/badges'
import { getCurrentSeason } from '@/lib/seasons'

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
  const season = await getCurrentSeason()
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

export async function getMySeasonSummary() {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  const season = await getCurrentSeason()
  if (!season) return null

  const [summary] = await db
    .select({
      avgScore9:  sql<number | null>`avg(${rounds.totalScore}) filter (where ${rounds.holesPlayed} = 9)::float`,
      avgScore18: sql<number | null>`avg(${rounds.totalScore}) filter (where ${rounds.holesPlayed} = 18)::float`,
      rounds9:    sql<number>`count(distinct ${rounds.id}) filter (where ${rounds.holesPlayed} = 9)::int`,
      rounds18:   sql<number>`count(distinct ${rounds.id}) filter (where ${rounds.holesPlayed} = 18)::int`,
      eagles:          sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} <= -2)::int`,
      birdies:         sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = -1)::int`,
      pars:            sql<number>`count(*) filter (where ${roundHoles.score} = ${roundHoles.par})::int`,
      bogeys:          sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = 1)::int`,
      doubles:         sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} >= 2)::int`,
      girTotal:        sql<number>`count(*) filter (where ${roundHoles.gir} = true)::int`,
      girHoles:        sql<number>`count(${roundHoles.id})::int`,
      firHit:          sql<number>`count(*) filter (where ${roundHoles.fairwayHit} = true)::int`,
      firOpportunities: sql<number>`count(*) filter (where ${roundHoles.par} >= 4)::int`,
      avgPutts18:      sql<number | null>`(sum(${roundHoles.putts}) filter (where ${rounds.holesPlayed} = 18))::float / nullif(count(distinct ${rounds.id}) filter (where ${rounds.holesPlayed} = 18), 0)`,
      avgPutts9:       sql<number | null>`(sum(${roundHoles.putts}) filter (where ${rounds.holesPlayed} = 9))::float / nullif(count(distinct ${rounds.id}) filter (where ${rounds.holesPlayed} = 9), 0)`,
    })
    .from(rounds)
    .leftJoin(roundHoles, eq(roundHoles.roundId, rounds.id))
    .where(and(eq(rounds.userId, userId), eq(rounds.seasonId, season.id)))

  return {
    seasonName: season.name,
    avgScore9: summary?.avgScore9 ?? null,
    avgScore18: summary?.avgScore18 ?? null,
    rounds9: summary?.rounds9 ?? 0,
    rounds18: summary?.rounds18 ?? 0,
    eagles: summary?.eagles ?? 0,
    birdies: summary?.birdies ?? 0,
    pars: summary?.pars ?? 0,
    bogeys: summary?.bogeys ?? 0,
    doubles: summary?.doubles ?? 0,
    girPct: summary && summary.girHoles > 0 ? summary.girTotal / summary.girHoles : null,
    firPct: summary && summary.firOpportunities > 0 ? summary.firHit / summary.firOpportunities : null,
    avgPutts18: summary?.avgPutts18 ?? null,
    avgPutts9: summary?.avgPutts9 ?? null,
  }
}

export async function getTeamSeasonStats() {
  await requireUser()

  const season = await getCurrentSeason()
  if (!season) return null

  const [summary] = await db
    .select({
      avgPar3: sql<number | null>`avg(${roundHoles.score}) filter (where ${roundHoles.par} = 3)::float`,
      avgPar4: sql<number | null>`avg(${roundHoles.score}) filter (where ${roundHoles.par} = 4)::float`,
      avgPar5: sql<number | null>`avg(${roundHoles.score}) filter (where ${roundHoles.par} = 5)::float`,
      par3Holes: sql<number>`count(*) filter (where ${roundHoles.par} = 3)::int`,
      par4Holes: sql<number>`count(*) filter (where ${roundHoles.par} = 4)::int`,
      par5Holes: sql<number>`count(*) filter (where ${roundHoles.par} = 5)::int`,
      birdies: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = -1)::int`,
      pars: sql<number>`count(*) filter (where ${roundHoles.score} = ${roundHoles.par})::int`,
      avgScore9: sql<number | null>`avg(${rounds.totalScore}) filter (where ${rounds.holesPlayed} = 9)::float`,
      avgScore18: sql<number | null>`avg(${rounds.totalScore}) filter (where ${rounds.holesPlayed} = 18)::float`,
      rounds9: sql<number>`count(distinct ${rounds.id}) filter (where ${rounds.holesPlayed} = 9)::int`,
      rounds18: sql<number>`count(distinct ${rounds.id}) filter (where ${rounds.holesPlayed} = 18)::int`,
      players: sql<number>`count(distinct ${rounds.userId})::int`,
    })
    .from(rounds)
    .leftJoin(roundHoles, eq(roundHoles.roundId, rounds.id))
    .where(eq(rounds.seasonId, season.id))

  return {
    seasonName: season.name,
    avgPar3: summary?.avgPar3 ?? null,
    avgPar4: summary?.avgPar4 ?? null,
    avgPar5: summary?.avgPar5 ?? null,
    par3Holes: summary?.par3Holes ?? 0,
    par4Holes: summary?.par4Holes ?? 0,
    par5Holes: summary?.par5Holes ?? 0,
    birdies: summary?.birdies ?? 0,
    pars: summary?.pars ?? 0,
    avgScore9: summary?.avgScore9 ?? null,
    avgScore18: summary?.avgScore18 ?? null,
    rounds9: summary?.rounds9 ?? 0,
    rounds18: summary?.rounds18 ?? 0,
    players: summary?.players ?? 0,
  }
}

export async function getMyPersonalRoundBests() {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  const userRounds = await db
    .select({ id: rounds.id, holesPlayed: rounds.holesPlayed })
    .from(rounds)
    .where(eq(rounds.userId, userId))

  if (userRounds.length === 0) {
    return { bestFirPct: null, bestGirPct: null, lowestPutts18: null, lowestPutts9: null }
  }

  const roundIds = userRounds.map((r) => r.id)
  const holes = await db
    .select({
      roundId: roundHoles.roundId,
      par: roundHoles.par,
      putts: roundHoles.putts,
      gir: roundHoles.gir,
      fairwayHit: roundHoles.fairwayHit,
    })
    .from(roundHoles)
    .where(inArray(roundHoles.roundId, roundIds))

  const holesByRound = new Map<number, typeof holes>()
  for (const h of holes) {
    if (!holesByRound.has(h.roundId)) holesByRound.set(h.roundId, [])
    holesByRound.get(h.roundId)!.push(h)
  }

  let bestFirPct: number | null = null
  let bestGirPct: number | null = null
  let lowestPutts18: number | null = null
  let lowestPutts9: number | null = null

  for (const r of userRounds) {
    const hs = holesByRound.get(r.id) ?? []
    if (hs.length === 0) continue

    const girPct = hs.filter((h) => h.gir).length / hs.length
    if (bestGirPct === null || girPct > bestGirPct) bestGirPct = girPct

    const firHoles = hs.filter((h) => h.par >= 4)
    if (firHoles.length > 0) {
      const firPct = firHoles.filter((h) => h.fairwayHit === true).length / firHoles.length
      if (bestFirPct === null || firPct > bestFirPct) bestFirPct = firPct
    }

    const totalPutts = hs.reduce((s, h) => s + h.putts, 0)
    if (r.holesPlayed === 18) {
      if (lowestPutts18 === null || totalPutts < lowestPutts18) lowestPutts18 = totalPutts
    } else if (r.holesPlayed === 9) {
      if (lowestPutts9 === null || totalPutts < lowestPutts9) lowestPutts9 = totalPutts
    }
  }

  return { bestFirPct, bestGirPct, lowestPutts18, lowestPutts9 }
}

export async function getMyCareerStatBadges() {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  const [bands] = await db
    .select({
      scores70s: sql<number>`count(*) filter (where ${rounds.totalScore} between 70 and 79 and ${rounds.holesPlayed} = 18)::int`,
      scores80s: sql<number>`count(*) filter (where ${rounds.totalScore} between 80 and 89 and ${rounds.holesPlayed} = 18)::int`,
      scores90s: sql<number>`count(*) filter (where ${rounds.totalScore} between 90 and 99 and ${rounds.holesPlayed} = 18)::int`,
    })
    .from(rounds)
    .where(eq(rounds.userId, userId))

  const userRounds = await db
    .select({ id: rounds.id })
    .from(rounds)
    .where(eq(rounds.userId, userId))

  if (userRounds.length === 0) {
    return { scores70s: 0, scores80s: 0, scores90s: 0,
      mostParsInRound: null, mostBirdiesInRound: null,
      mostEaglesInRound: null, most1PuttsInRound: null }
  }

  const allHoles = await db
    .select({ roundId: roundHoles.roundId, par: roundHoles.par, score: roundHoles.score, putts: roundHoles.putts })
    .from(roundHoles)
    .where(inArray(roundHoles.roundId, userRounds.map((r) => r.id)))

  const byRound = new Map<number, { par: number; score: number; putts: number }[]>()
  for (const h of allHoles) {
    if (!byRound.has(h.roundId)) byRound.set(h.roundId, [])
    byRound.get(h.roundId)!.push({ par: h.par, score: h.score, putts: h.putts })
  }

  let mostPars = 0, mostBirdies = 0, mostEagles = 0, most1Putts = 0
  for (const hs of byRound.values()) {
    mostPars    = Math.max(mostPars,    hs.filter((h) => h.score === h.par).length)
    mostBirdies = Math.max(mostBirdies, hs.filter((h) => h.score - h.par === -1).length)
    mostEagles  = Math.max(mostEagles,  hs.filter((h) => h.score - h.par <= -2).length)
    most1Putts  = Math.max(most1Putts,  hs.filter((h) => h.putts === 1).length)
  }

  return {
    scores70s: bands?.scores70s ?? 0,
    scores80s: bands?.scores80s ?? 0,
    scores90s: bands?.scores90s ?? 0,
    mostParsInRound:    mostPars    > 0 ? mostPars    : null,
    mostBirdiesInRound: mostBirdies > 0 ? mostBirdies : null,
    mostEaglesInRound:  mostEagles  > 0 ? mostEagles  : null,
    most1PuttsInRound:  most1Putts  > 0 ? most1Putts  : null,
  }
}

export async function getMyBadges(): Promise<EarnedMap> {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  const empty: EarnedMap = Object.fromEntries(BADGE_DEFS.map((b) => [b.id, null]))

  const userRounds = await db
    .select({
      id: rounds.id,
      date: rounds.date,
      holesPlayed: rounds.holesPlayed,
      totalScore: rounds.totalScore,
      isCvgaTournament: rounds.isCvgaTournament,
    })
    .from(rounds)
    .where(eq(rounds.userId, userId))

  if (userRounds.length === 0) return empty

  const roundIds = userRounds.map((r) => r.id)
  const holes = await db
    .select({
      roundId: roundHoles.roundId,
      par: roundHoles.par,
      score: roundHoles.score,
      putts: roundHoles.putts,
      gir: roundHoles.gir,
      fairwayHit: roundHoles.fairwayHit,
    })
    .from(roundHoles)
    .where(inArray(roundHoles.roundId, roundIds))

  const holesByRound = new Map<number, { par: number; score: number; putts: number; gir: boolean; fairwayHit: boolean | null }[]>()
  for (const h of holes) {
    if (!holesByRound.has(h.roundId)) holesByRound.set(h.roundId, [])
    holesByRound.get(h.roundId)!.push({ par: h.par, score: h.score, putts: h.putts, gir: h.gir, fairwayHit: h.fairwayHit })
  }

  const forBadges: RoundForBadges[] = userRounds.map((r) => ({
    date: String(r.date),
    holesPlayed: r.holesPlayed,
    totalScore: r.totalScore,
    isCvgaTournament: r.isCvgaTournament,
    holes: holesByRound.get(r.id) ?? [],
  }))

  const earned = computeEarnedBadges(forBadges)
  return earned
}

type RoundStreakRow = {
  date: string
  totalScore: number
  netToPar: number
  hasPar: boolean
  hasBirdie: boolean
}

function startOfWeekMonday(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day
  d.setUTCDate(d.getUTCDate() + diff)
  return d
}

export async function getMyStreaks() {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  const userRounds = await db
    .select({
      id: rounds.id,
      date: rounds.date,
      totalScore: rounds.totalScore,
    })
    .from(rounds)
    .where(eq(rounds.userId, userId))
    .orderBy(asc(rounds.date), asc(rounds.id))

  if (userRounds.length === 0) {
    return {
      roundsLogged: 0,
      currentWeeklyPlayStreak: 0,
      bestWeeklyPlayStreak: 0,
      currentBirdieRoundStreak: 0,
      bestBirdieRoundStreak: 0,
      currentParRoundStreak: 0,
      bestParRoundStreak: 0,
      currentImprovementStreak: 0,
      bestImprovementStreak: 0,
    }
  }

  const roundIds = userRounds.map((r) => r.id)
  const holes = await db
    .select({
      roundId: roundHoles.roundId,
      par: roundHoles.par,
      score: roundHoles.score,
    })
    .from(roundHoles)
    .where(inArray(roundHoles.roundId, roundIds))

  const holesByRound = new Map<number, { par: number; score: number }[]>()
  for (const h of holes) {
    if (!holesByRound.has(h.roundId)) holesByRound.set(h.roundId, [])
    holesByRound.get(h.roundId)!.push({ par: h.par, score: h.score })
  }

  const rows: RoundStreakRow[] = userRounds
    .map((r) => {
      const hs = holesByRound.get(r.id) ?? []
      const totalScore = r.totalScore ?? hs.reduce((sum, h) => sum + h.score, 0)
      return {
        date: String(r.date),
        totalScore,
        netToPar: totalScore - hs.reduce((sum, h) => sum + h.par, 0),
        hasPar: hs.some((h) => h.score === h.par),
        hasBirdie: hs.some((h) => h.score - h.par === -1),
      }
    })
    .filter((r) => Number.isFinite(r.totalScore))

  // Weekly play streak (at least one round in consecutive weeks)
  const weekKeys = Array.from(
    new Set(
      rows.map((r) => startOfWeekMonday(new Date(`${r.date}T00:00:00.000Z`)).toISOString().slice(0, 10)),
    ),
  ).sort()

  let bestWeeklyPlayStreak = 0
  let currentWeeklyPlayStreak = 0
  let weeklyRun = 0
  for (let i = 0; i < weekKeys.length; i++) {
    if (i === 0) {
      weeklyRun = 1
    } else {
      const prev = new Date(`${weekKeys[i - 1]}T00:00:00.000Z`)
      const curr = new Date(`${weekKeys[i]}T00:00:00.000Z`)
      const days = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
      weeklyRun = days === 7 ? weeklyRun + 1 : 1
    }
    bestWeeklyPlayStreak = Math.max(bestWeeklyPlayStreak, weeklyRun)
  }

  const thisWeek = startOfWeekMonday(new Date()).toISOString().slice(0, 10)
  const lastWeek = new Date(`${thisWeek}T00:00:00.000Z`)
  lastWeek.setUTCDate(lastWeek.getUTCDate() - 7)
  const lastWeekKey = lastWeek.toISOString().slice(0, 10)

  if (weekKeys.length > 0) {
    const lastLoggedWeek = weekKeys[weekKeys.length - 1]
    if (lastLoggedWeek === thisWeek || lastLoggedWeek === lastWeekKey) {
      let idx = weekKeys.length - 1
      currentWeeklyPlayStreak = 1
      while (idx > 0) {
        const prev = new Date(`${weekKeys[idx - 1]}T00:00:00.000Z`)
        const curr = new Date(`${weekKeys[idx]}T00:00:00.000Z`)
        const days = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
        if (days !== 7) break
        currentWeeklyPlayStreak += 1
        idx -= 1
      }
    }
  }

  let currentBirdieRoundStreak = 0
  let bestBirdieRoundStreak = 0
  let currentParRoundStreak = 0
  let bestParRoundStreak = 0
  let currentImprovementStreak = 0
  let bestImprovementStreak = 0

  let birdieRun = 0
  let parRun = 0
  let improvementRun = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    birdieRun = row.hasBirdie ? birdieRun + 1 : 0
    parRun = row.hasPar ? parRun + 1 : 0

    if (i === 0) {
      improvementRun = 1
    } else {
        improvementRun = row.netToPar <= rows[i - 1].netToPar ? improvementRun + 1 : 1
    }

    bestBirdieRoundStreak = Math.max(bestBirdieRoundStreak, birdieRun)
    bestParRoundStreak = Math.max(bestParRoundStreak, parRun)
    bestImprovementStreak = Math.max(bestImprovementStreak, improvementRun)
  }

  for (let i = rows.length - 1; i >= 0; i--) {
    if (!rows[i].hasBirdie) break
    currentBirdieRoundStreak += 1
  }

  for (let i = rows.length - 1; i >= 0; i--) {
    if (!rows[i].hasPar) break
    currentParRoundStreak += 1
  }

  if (rows.length > 0) {
    currentImprovementStreak = 1
    for (let i = rows.length - 1; i > 0; i--) {
        if (rows[i].netToPar <= rows[i - 1].netToPar) {
        currentImprovementStreak += 1
      } else {
        break
      }
    }
  }

  return {
    roundsLogged: rows.length,
    currentWeeklyPlayStreak,
    bestWeeklyPlayStreak,
    currentBirdieRoundStreak,
    bestBirdieRoundStreak,
    currentParRoundStreak,
    bestParRoundStreak,
    currentImprovementStreak,
    bestImprovementStreak,
  }
}
