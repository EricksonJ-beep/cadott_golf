'use server'

import { db } from '@/db'
import { challenges, challengeResults, seasons, users } from '@/db/schema'
import { and, desc, eq, max, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { isHigherScoreBetter } from '@/lib/challenge-scoring'

async function requireUser() {
  const session = await auth()
  if (!session?.user) redirect('/')
  return session
}

async function requireCoach() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'coach') redirect('/dashboard')
  return session
}

export async function getActiveSeason() {
  const [season] = await db.select().from(seasons).where(eq(seasons.isActive, true)).limit(1)
  return season ?? null
}

export async function getActiveChallenges() {
  return db
    .select()
    .from(challenges)
    .where(eq(challenges.isActive, true))
    .orderBy(challenges.category, challenges.name)
}

export async function getAllChallenges() {
  await requireCoach()
  return db
    .select()
    .from(challenges)
    .orderBy(challenges.isActive, challenges.category, challenges.name)
}

export async function getChallenge(id: number) {
  const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1)
  return challenge ?? null
}

export async function getMyChallengeResults(challengeId: number) {
  const session = await requireUser()
  return db
    .select()
    .from(challengeResults)
    .where(
      and(
        eq(challengeResults.challengeId, challengeId),
        eq(challengeResults.userId, Number(session.user!.id)),
      ),
    )
    .orderBy(desc(challengeResults.dateLogged), desc(challengeResults.id))
}

export async function getSeasonLeaderboard(challengeId: number) {
  const season = await getActiveSeason()
  if (!season) return []

  const challenge = await getChallenge(challengeId)
  if (!challenge) return []
  const higherIsBetter = isHigherScoreBetter(challenge)

  const rows = await db
    .select({
      userId: challengeResults.userId,
      name: users.name,
      bestHigh: max(challengeResults.score).as('best_high'),
      bestLow: sql<number>`min(${challengeResults.score})::int`.as('best_low'),
    })
    .from(challengeResults)
    .innerJoin(users, eq(users.id, challengeResults.userId))
    .where(
      and(
        eq(challengeResults.challengeId, challengeId),
        eq(challengeResults.seasonId, season.id),
      ),
    )
    .groupBy(challengeResults.userId, users.name)

  return rows
    .map((row) => ({
      userId: row.userId,
      name: row.name,
      bestScore: higherIsBetter ? row.bestHigh : row.bestLow,
    }))
    .sort((a, b) => {
      const left = a.bestScore ?? 0
      const right = b.bestScore ?? 0
      return higherIsBetter ? right - left : left - right
    })
    .slice(0, 5)
}

export async function getAllTimeRecord(challengeId: number) {
  const challenge = await getChallenge(challengeId)
  if (!challenge) return null
  const higherIsBetter = isHigherScoreBetter(challenge)

  const baseQuery = db
    .select({
      score: challengeResults.score,
      dateLogged: challengeResults.dateLogged,
      userId: challengeResults.userId,
      name: users.name,
      seasonName: seasons.name,
    })
    .from(challengeResults)
    .innerJoin(users, eq(users.id, challengeResults.userId))
    .leftJoin(seasons, eq(seasons.id, challengeResults.seasonId))
    .where(eq(challengeResults.challengeId, challengeId))

  const [record] = higherIsBetter
    ? await baseQuery.orderBy(desc(challengeResults.score), challengeResults.dateLogged).limit(1)
    : await baseQuery.orderBy(challengeResults.score, challengeResults.dateLogged).limit(1)

  return record ?? null
}

export async function logChallengeResult(_prevState: string | null, formData: FormData) {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  const challengeId = Number(formData.get('challengeId'))
  const scoreRaw = formData.get('score')
  const notes = ((formData.get('notes') as string) || '').trim() || null

  if (!challengeId || scoreRaw === null || scoreRaw === '') return 'Score is required.'
  const score = Number(scoreRaw)
  if (Number.isNaN(score) || score < 0) return 'Enter a valid score.'

  const [challenge] = await db.select().from(challenges).where(eq(challenges.id, challengeId)).limit(1)
  if (!challenge) return 'Challenge not found.'
  if (challenge.maxScore !== null && score > challenge.maxScore) {
    return `Score cannot exceed ${challenge.maxScore}.`
  }

  const season = await getActiveSeason()

  await db.insert(challengeResults).values({
    userId,
    challengeId,
    score,
    seasonId: season?.id ?? null,
    notes,
  })

  revalidatePath(`/challenges/${challengeId}`)
  revalidatePath('/dashboard')
  return null
}

export async function deleteChallengeResult(resultId: number) {
  const session = await requireUser()
  const userId = Number(session.user!.id)

  const [result] = await db
    .select()
    .from(challengeResults)
    .where(eq(challengeResults.id, resultId))
    .limit(1)
  if (!result) return
  if (result.userId !== userId && session.user!.role !== 'coach') return

  await db.delete(challengeResults).where(eq(challengeResults.id, resultId))
  revalidatePath(`/challenges/${result.challengeId}`)
  revalidatePath('/dashboard')
}

// ── Admin (coach) actions ─────────────────────────────────────────────────────

export async function createChallenge(_prevState: string | null, formData: FormData) {
  const session = await requireCoach()

  const name = ((formData.get('name') as string) || '').trim()
  const type = formData.get('type') as 'range' | 'course'
  const category = formData.get('category') as
    | 'putting' | 'chipping' | 'bunker' | 'driving' | 'approach' | 'wedges' | 'course_stats'
  const scoringType = formData.get('scoringType') as
    | 'score_out_of' | 'makes_in_a_row' | 'pass_fail' | 'count'
  const unit = ((formData.get('unit') as string) || '').trim() || null
  const description = ((formData.get('description') as string) || '').trim() || null
  const maxScoreRaw = formData.get('maxScore') as string
  const maxScore = maxScoreRaw ? Number(maxScoreRaw) : null

  if (!name) return 'Name is required.'
  if (!type || !category || !scoringType) return 'Type, category, and scoring type are required.'

  await db.insert(challenges).values({
    name,
    type,
    category,
    scoringType,
    unit,
    description,
    maxScore,
    createdBy: Number(session.user!.id),
  })

  revalidatePath('/admin/challenges')
  revalidatePath('/dashboard')
  return null
}

export async function updateChallenge(_prevState: string | null, formData: FormData) {
  await requireCoach()

  const id = Number(formData.get('id'))
  const name = ((formData.get('name') as string) || '').trim()
  const description = ((formData.get('description') as string) || '').trim() || null
  const unit = ((formData.get('unit') as string) || '').trim() || null
  const maxScoreRaw = formData.get('maxScore') as string
  const maxScore = maxScoreRaw ? Number(maxScoreRaw) : null

  if (!id || !name) return 'Name is required.'

  await db
    .update(challenges)
    .set({ name, description, unit, maxScore })
    .where(eq(challenges.id, id))

  revalidatePath('/admin/challenges')
  revalidatePath(`/challenges/${id}`)
  return null
}

export async function toggleChallengeActive(challengeId: number, isActive: boolean) {
  await requireCoach()
  await db.update(challenges).set({ isActive }).where(eq(challenges.id, challengeId))
  revalidatePath('/admin/challenges')
  revalidatePath('/dashboard')
}
