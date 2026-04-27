'use server'

import { db } from '@/db'
import { users, practicePlans, practicePlanBlocks } from '@/db/schema'
import { eq } from 'drizzle-orm'
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
  const grade = formData.get('grade') ? Number(formData.get('grade')) : null

  if (!name || !username || !tempPassword) return 'Name, username, and temporary password are required.'
  if (tempPassword.length < 6) return 'Temporary password must be at least 6 characters.'

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1)
  if (existing.length > 0) return `Username "${username}" is already taken.`

  const hash = await bcrypt.hash(tempPassword, 12)
  await db.insert(users).values({
    username,
    passwordHash: hash,
    role: 'player',
    name,
    grade,
    mustChangePassword: true,
  })

  revalidatePath('/admin/roster')
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
    .set({ passwordHash: hash, mustChangePassword: true })
    .where(eq(users.id, userId))

  revalidatePath('/admin/roster')
  return null
}

export async function togglePlayerActive(userId: number, isActive: boolean) {
  await requireCoach()
  await db.update(users).set({ isActive }).where(eq(users.id, userId))
  revalidatePath('/admin/roster')
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
