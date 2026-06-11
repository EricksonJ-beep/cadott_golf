'use server'

import { db } from '@/db'
import { rounds, roundHoles } from '@/db/schema'
import { asc, desc, eq, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSeasonIdForDate } from '@/lib/seasons'

async function requireUser() {
  const session = await auth()
  if (!session?.user) redirect('/')
  return session
}

export async function getMyRounds() {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  return db
    .select({
      id: rounds.id,
      date: rounds.date,
      courseName: rounds.courseName,
      holesPlayed: rounds.holesPlayed,
      totalScore: rounds.totalScore,
      createdAt: rounds.createdAt,
    })
    .from(rounds)
    .where(eq(rounds.userId, userId))
    .orderBy(desc(rounds.date), desc(rounds.id))
}

export async function getRound(id: number) {
  const session = await requireUser()

  const [round] = await db.select().from(rounds).where(eq(rounds.id, id)).limit(1)
  if (!round) return null

  // Players see only own rounds; coaches see any
  if (round.userId !== Number(session.user!.id) && session.user!.role !== 'coach') {
    return null
  }

  const holes = await db
    .select()
    .from(roundHoles)
    .where(eq(roundHoles.roundId, id))
    .orderBy(asc(roundHoles.holeNumber))

  return { ...round, holes, hasDetailedScores: holes.length > 0 }
}

type HoleInput = {
  holeNumber: number
  par: number
  score: number
  fairwayHit: boolean | null
  gir: boolean
  putts: number
}

export async function saveRound(_prevState: string | null, formData: FormData) {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  const courseName = ((formData.get('courseName') as string) || '').trim()
  const date = (formData.get('date') as string) || ''
  const holesPlayed = Number(formData.get('holesPlayed'))
  const teeColor = ((formData.get('teeColor') as string) || '').trim() || null
  const roundSegment = ((formData.get('roundSegment') as string) || '').trim() || null
  const weatherNotes = ((formData.get('weatherNotes') as string) || '').trim() || null
  const freeTextNotes = ((formData.get('freeTextNotes') as string) || '').trim() || null
  const isCvgaTournament = (formData.get('isCvgaTournament') as string) === 'true'
  const entryMode = (formData.get('entryMode') as string) || 'hole-by-hole'
  const holesJson = formData.get('holes') as string

  if (!courseName) return 'Course name is required.'
  if (!date) return 'Date is required.'
  if (holesPlayed !== 9 && holesPlayed !== 18) return 'Holes must be 9 or 18.'

  let holes: HoleInput[] = []
  let totalScore: number

  if (entryMode === 'score-only') {
    const scoreOnlyInput = formData.get('scoreOnly') as string
    if (!scoreOnlyInput || isNaN(Number(scoreOnlyInput))) return 'Score is required.'
    totalScore = Number(scoreOnlyInput)
    if (totalScore < 1 || totalScore > 200) return 'Enter a valid score.'
    // For score-only, we don't save individual hole data
  } else {
    try {
      holes = JSON.parse(holesJson || '[]')
    } catch {
      return 'Invalid hole data.'
    }
    if (holes.length !== holesPlayed) return `Expected ${holesPlayed} holes.`
    for (const h of holes) {
      if (!h.par || h.par < 3 || h.par > 5) return `Hole ${h.holeNumber}: par must be 3–5.`
      if (!h.score || h.score < 1 || h.score > 15) return `Hole ${h.holeNumber}: enter a valid score.`
      if (h.putts < 0 || h.putts > 10) return `Hole ${h.holeNumber}: enter valid putts.`
    }
    totalScore = holes.reduce((sum, h) => sum + h.score, 0)
  }

  const seasonId = await getSeasonIdForDate(date)

  const [inserted] = await db
    .insert(rounds)
    .values({
      userId,
      date,
      courseName,
      holesPlayed,
      teeColor,
      roundSegment,
      totalScore,
      weatherNotes,
      freeTextNotes,
      isCvgaTournament,
      seasonId,
    })
    .returning({ id: rounds.id })

  if (holes.length > 0) {
    await db.insert(roundHoles).values(
      holes.map((h) => ({
        roundId: inserted.id,
        holeNumber: h.holeNumber,
        par: h.par,
        score: h.score,
        fairwayHit: h.fairwayHit,
        gir: h.gir,
        putts: h.putts,
      })),
    )
  }

  revalidatePath('/dashboard')
  redirect(`/rounds/${inserted.id}`)
}

export async function deleteRound(roundId: number) {
  const session = await requireUser()
  const [round] = await db.select().from(rounds).where(eq(rounds.id, roundId)).limit(1)
  if (!round) return
  if (round.userId !== Number(session.user!.id) && session.user!.role !== 'coach') return

  await db.delete(rounds).where(eq(rounds.id, roundId))
  revalidatePath('/dashboard')
}

export async function updateRound(roundId: number, _prevState: string | null, formData: FormData) {
  const session = await requireUser()

  const [existing] = await db.select().from(rounds).where(eq(rounds.id, roundId)).limit(1)
  if (!existing) return 'Round not found.'
  if (existing.userId !== Number(session.user!.id) && session.user!.role !== 'coach') return 'Not allowed.'

  const courseName = ((formData.get('courseName') as string) || '').trim()
  const date = (formData.get('date') as string) || ''
  const holesPlayed = Number(formData.get('holesPlayed'))
  const teeColor = ((formData.get('teeColor') as string) || '').trim() || null
  const roundSegment = ((formData.get('roundSegment') as string) || '').trim() || null
  const weatherNotes = ((formData.get('weatherNotes') as string) || '').trim() || null
  const freeTextNotes = ((formData.get('freeTextNotes') as string) || '').trim() || null
  const isCvgaTournament = (formData.get('isCvgaTournament') as string) === 'true'
  const entryMode = (formData.get('entryMode') as string) || 'hole-by-hole'
  const holesJson = formData.get('holes') as string

  if (!courseName) return 'Course name is required.'
  if (!date) return 'Date is required.'
  if (holesPlayed !== 9 && holesPlayed !== 18) return 'Holes must be 9 or 18.'

  let holes: HoleInput[] = []
  let totalScore: number

  if (entryMode === 'score-only') {
    const scoreOnlyInput = formData.get('scoreOnly') as string
    if (!scoreOnlyInput || isNaN(Number(scoreOnlyInput))) return 'Score is required.'
    totalScore = Number(scoreOnlyInput)
    if (totalScore < 1 || totalScore > 200) return 'Enter a valid score.'
  } else {
    try {
      holes = JSON.parse(holesJson || '[]')
    } catch {
      return 'Invalid hole data.'
    }
    if (holes.length !== holesPlayed) return `Expected ${holesPlayed} holes.`
    for (const h of holes) {
      if (!h.par || h.par < 3 || h.par > 5) return `Hole ${h.holeNumber}: par must be 3–5.`
      if (!h.score || h.score < 1 || h.score > 15) return `Hole ${h.holeNumber}: enter a valid score.`
      if (h.putts < 0 || h.putts > 10) return `Hole ${h.holeNumber}: enter valid putts.`
    }
    totalScore = holes.reduce((sum, h) => sum + h.score, 0)
  }

  await db.transaction(async (tx) => {
    await tx.update(rounds).set({ courseName, date, holesPlayed, teeColor, roundSegment, totalScore, weatherNotes, freeTextNotes, isCvgaTournament }).where(eq(rounds.id, roundId))
    await tx.delete(roundHoles).where(eq(roundHoles.roundId, roundId))
    if (holes.length > 0) {
      await tx.insert(roundHoles).values(
        holes.map((h) => ({
          roundId,
          holeNumber: h.holeNumber,
          par: h.par,
          score: h.score,
          fairwayHit: h.fairwayHit,
          gir: h.gir,
          putts: h.putts,
        })),
      )
    }
  })

  revalidatePath('/dashboard')
  revalidatePath(`/rounds/${roundId}`)
  redirect(`/rounds/${roundId}`)
}

export async function getMyCourseStats() {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  const [summary] = await db
    .select({
      roundsPlayed: sql<number>`count(distinct ${rounds.id})::int`,
      totalHoles: sql<number>`count(${roundHoles.id})::int`,
      avgScore: sql<number | null>`avg(${roundHoles.score})::float`,
      avgPar: sql<number | null>`avg(${roundHoles.par})::float`,
      avgPutts: sql<number | null>`avg(${roundHoles.putts})::float`,
      birdies: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = -1)::int`,
      eagles: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} <= -2)::int`,
      pars: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = 0)::int`,
      bogeys: sql<number>`count(*) filter (where ${roundHoles.score} - ${roundHoles.par} = 1)::int`,
      fairwaysHit: sql<number>`count(*) filter (where ${roundHoles.fairwayHit} = true)::int`,
      fairwayOpps: sql<number>`count(*) filter (where ${roundHoles.par} > 3)::int`,
      girHit: sql<number>`count(*) filter (where ${roundHoles.gir} = true)::int`,
      // Per-par scoring averages
      avgOnPar3: sql<number | null>`avg(${roundHoles.score}) filter (where ${roundHoles.par} = 3)::float`,
      avgOnPar4: sql<number | null>`avg(${roundHoles.score}) filter (where ${roundHoles.par} = 4)::float`,
      avgOnPar5: sql<number | null>`avg(${roundHoles.score}) filter (where ${roundHoles.par} = 5)::float`,
      holesOnPar3: sql<number>`count(*) filter (where ${roundHoles.par} = 3)::int`,
      holesOnPar4: sql<number>`count(*) filter (where ${roundHoles.par} = 4)::int`,
      holesOnPar5: sql<number>`count(*) filter (where ${roundHoles.par} = 5)::int`,
    })
    .from(rounds)
    .leftJoin(roundHoles, eq(roundHoles.roundId, rounds.id))
    .where(eq(rounds.userId, userId))

  return summary ?? null
}
