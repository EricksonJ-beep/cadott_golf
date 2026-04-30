'use server'

import { db } from '@/db'
import {
  users,
  practicePlans,
  practicePlanBlocks,
  rounds,
  challengeResults,
  challenges,
  clubDistances,
  playerClubs,
  clubsDefault,
} from '@/db/schema'
import { desc, eq, isNotNull } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

async function requireCoach() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'coach') redirect('/dashboard')
  return session
}

export async function getRoster() {
  await requireCoach()
  return db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
      grade: users.grade,
      isActive: users.isActive,
      mustChangePassword: users.mustChangePassword,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.name)
}

export async function createPlayer(prevState: string | null, formData: FormData) {
  await requireCoach()

  const name = (formData.get('name') as string)?.trim()
  const username = (formData.get('username') as string)?.trim().toLowerCase()
  const tempPassword = (formData.get('tempPassword') as string)?.trim()
  const roleRaw = (formData.get('role') as string) || 'player'
  const role: 'player' | 'coach' = roleRaw === 'coach' ? 'coach' : 'player'
  const grade = role === 'coach'
    ? null
    : (formData.get('grade') ? Number(formData.get('grade')) : null)

  if (!name || !username || !tempPassword) return 'Name, username, and temporary password are required.'
  if (tempPassword.length < 6) return 'Temporary password must be at least 6 characters.'

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1)
  if (existing.length > 0) return `Username "${username}" is already taken.`

  const hash = await bcrypt.hash(tempPassword, 12)
  await db.insert(users).values({
    username,
    passwordHash: hash,
    role,
    name,
    grade,
    mustChangePassword: true,
  })

  revalidatePath('/admin/roster')
  revalidatePath('/admin')
  return null
}

export async function resetPlayerPassword(prevState: string | null, formData: FormData) {
  await requireCoach()

  const userId = Number(formData.get('userId'))
  const newPassword = (formData.get('newPassword') as string)?.trim()

  if (!newPassword || newPassword.length < 6) return 'Password must be at least 6 characters.'

  const hash = await bcrypt.hash(newPassword, 12)
  await db
    .update(users)
    .set({ passwordHash: hash, mustChangePassword: true, passwordResetAt: new Date() })
    .where(eq(users.id, userId))

  revalidatePath('/admin/roster')
  revalidatePath('/admin')
  return null
}

export async function updateUserInfo(prevState: string | null, formData: FormData) {
  await requireCoach()

  const userId = Number(formData.get('userId'))
  const name = (formData.get('name') as string)?.trim()
  const username = (formData.get('username') as string)?.trim().toLowerCase()
  const gradeRaw = formData.get('grade') as string | null
  const grade = gradeRaw && gradeRaw.length > 0 ? Number(gradeRaw) : null

  if (!userId) return 'Missing user.'
  if (!name) return 'Name is required.'
  if (!username) return 'Username is required.'

  const conflict = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1)
  if (conflict.length > 0 && conflict[0].id !== userId) {
    return `Username "${username}" is already taken.`
  }

  await db
    .update(users)
    .set({ name, username, grade })
    .where(eq(users.id, userId))

  revalidatePath('/admin/roster')
  revalidatePath('/admin')
  return null
}

export async function togglePlayerActive(userId: number, isActive: boolean) {
  await requireCoach()
  await db.update(users).set({ isActive }).where(eq(users.id, userId))
  revalidatePath('/admin/roster')
  revalidatePath('/admin')
}

const SWING_LABELS: Record<string, string> = {
  full: 'Full',
  three_quarter: '¾',
  half: '½',
  quarter: '¼',
}

export type FeedEvent = {
  id: string
  type: 'round' | 'challenge' | 'user_created' | 'password_reset' | 'club_distance'
  timestamp: string
  description: string
  href?: string
}

export async function getActivityFeed(limit = 20): Promise<FeedEvent[]> {
  await requireCoach()

  const [
    recentRounds,
    recentChallenges,
    recentUsers,
    recentResets,
    recentDistances,
  ] = await Promise.all([
    db
      .select({
        id: rounds.id,
        createdAt: rounds.createdAt,
        courseName: rounds.courseName,
        totalScore: rounds.totalScore,
        userName: users.name,
      })
      .from(rounds)
      .innerJoin(users, eq(rounds.userId, users.id))
      .orderBy(desc(rounds.createdAt))
      .limit(25),
    db
      .select({
        id: challengeResults.id,
        createdAt: challengeResults.createdAt,
        score: challengeResults.score,
        userName: users.name,
        challengeName: challenges.name,
        challengeMax: challenges.maxScore,
      })
      .from(challengeResults)
      .innerJoin(users, eq(challengeResults.userId, users.id))
      .innerJoin(challenges, eq(challengeResults.challengeId, challenges.id))
      .orderBy(desc(challengeResults.createdAt))
      .limit(25),
    db
      .select({
        id: users.id,
        createdAt: users.createdAt,
        name: users.name,
        role: users.role,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(15),
    db
      .select({
        id: users.id,
        passwordResetAt: users.passwordResetAt,
        name: users.name,
      })
      .from(users)
      .where(isNotNull(users.passwordResetAt))
      .orderBy(desc(users.passwordResetAt))
      .limit(15),
    db
      .select({
        id: clubDistances.id,
        createdAt: clubDistances.createdAt,
        swingType: clubDistances.swingType,
        carryYards: clubDistances.carryYards,
        userName: users.name,
        customName: playerClubs.customName,
        defaultName: clubsDefault.name,
      })
      .from(clubDistances)
      .innerJoin(users, eq(clubDistances.userId, users.id))
      .innerJoin(playerClubs, eq(clubDistances.playerClubId, playerClubs.id))
      .leftJoin(clubsDefault, eq(playerClubs.clubId, clubsDefault.id))
      .orderBy(desc(clubDistances.createdAt))
      .limit(25),
  ])

  const events: FeedEvent[] = []

  for (const r of recentRounds) {
    const score = r.totalScore != null ? ` (${r.totalScore})` : ''
    events.push({
      id: `round-${r.id}`,
      type: 'round',
      timestamp: r.createdAt.toISOString(),
      description: `${r.userName} saved a round at ${r.courseName}${score}`,
      href: `/rounds/${r.id}`,
    })
  }

  for (const c of recentChallenges) {
    const max = c.challengeMax ? `/${c.challengeMax}` : ''
    events.push({
      id: `challenge-${c.id}`,
      type: 'challenge',
      timestamp: c.createdAt.toISOString(),
      description: `${c.userName} logged ${c.score}${max} on ${c.challengeName}`,
    })
  }

  for (const u of recentUsers) {
    events.push({
      id: `user-${u.id}`,
      type: 'user_created',
      timestamp: u.createdAt.toISOString(),
      description: `${u.name} (${u.role}) was added to the roster`,
    })
  }

  for (const r of recentResets) {
    if (!r.passwordResetAt) continue
    events.push({
      id: `reset-${r.id}-${r.passwordResetAt.getTime()}`,
      type: 'password_reset',
      timestamp: r.passwordResetAt.toISOString(),
      description: `Password was reset for ${r.name}`,
    })
  }

  for (const d of recentDistances) {
    const clubName = d.customName || d.defaultName || 'club'
    const swing = SWING_LABELS[d.swingType] ?? d.swingType
    const yards = d.carryYards != null ? ` (${d.carryYards}y)` : ''
    events.push({
      id: `distance-${d.id}`,
      type: 'club_distance',
      timestamp: d.createdAt.toISOString(),
      description: `${d.userName} logged ${swing} ${clubName}${yards}`,
    })
  }

  events.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
  return events.slice(0, limit)
}

export async function savePracticePlan(prevState: string | null, formData: FormData) {
  const session = await requireCoach()

  const title = (formData.get('title') as string)?.trim()
  const theme = (formData.get('theme') as string)?.trim() || null
  const focusArea = (formData.get('focusArea') as string)?.trim() || null
  const totalDuration = Number(formData.get('totalDuration'))
  const equipmentList = (formData.get('equipmentList') as string)?.trim() || null
  const blocksJson = formData.get('blocks') as string

  if (!title) return 'Title is required.'
  if (!totalDuration || totalDuration < 1) return 'Duration is required.'

  let blocks: { blockName: string; startMinute: number; durationMinutes: number; drillDescription: string }[] = []
  try {
    blocks = JSON.parse(blocksJson || '[]')
  } catch {
    return 'Invalid block data.'
  }

  const [plan] = await db.insert(practicePlans).values({
    title,
    theme,
    focusArea,
    totalDurationMinutes: totalDuration,
    equipmentList,
    createdBy: Number(session.user!.id),
  }).returning({ id: practicePlans.id })

  if (blocks.length > 0) {
    await db.insert(practicePlanBlocks).values(
      blocks.map((b, i) => ({
        planId: plan.id,
        blockName: b.blockName,
        startMinute: b.startMinute,
        durationMinutes: b.durationMinutes,
        drillDescription: b.drillDescription || null,
        orderIndex: i,
      }))
    )
  }

  revalidatePath('/dashboard')
  revalidatePath('/admin/practice-plans')
  return null
}

export async function deletePracticePlan(planId: number) {
  await requireCoach()
  await db.update(practicePlans).set({ isActive: false }).where(eq(practicePlans.id, planId))
  revalidatePath('/dashboard')
  revalidatePath('/admin/practice-plans')
}
