'use server'

import { db } from '@/db'
import { courseHoleGuides, playerHoleNotes, users } from '@/db/schema'
import { COURSE_SCORECARDS } from '@/lib/course-scorecards'
import { and, asc, desc, eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function requireSession() {
  const session = await auth()
  if (!session?.user) redirect('/')
  return session
}

async function requireCoach() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'coach') redirect('/dashboard')
  return session
}

export type CoachGuide = {
  holeNumber: number
  teeShotNotes: string | null
  approachNotes: string | null
  aroundGreenNotes: string | null
  missAvoidNotes: string | null
  generalStrategy: string | null
  updatedAt: Date | null
}

export type PlayerNote = {
  id: number
  holeNumber: number
  noteText: string
  noteDate: string | null
  createdAt: Date
  updatedAt: Date
}

function findCourse(courseId: string) {
  return COURSE_SCORECARDS.find((c) => c.id === courseId) ?? null
}

export async function getCoachGuide(courseId: string): Promise<CoachGuide[]> {
  const rows = await db
    .select()
    .from(courseHoleGuides)
    .where(eq(courseHoleGuides.courseId, courseId))
    .orderBy(asc(courseHoleGuides.holeNumber))

  return rows.map((r) => ({
    holeNumber: r.holeNumber,
    teeShotNotes: r.teeShotNotes,
    approachNotes: r.approachNotes,
    aroundGreenNotes: r.aroundGreenNotes,
    missAvoidNotes: r.missAvoidNotes,
    generalStrategy: r.generalStrategy,
    updatedAt: r.updatedAt,
  }))
}

export async function getPlayerNotesForCourse(
  userId: number,
  courseId: string,
): Promise<PlayerNote[]> {
  const rows = await db
    .select()
    .from(playerHoleNotes)
    .where(
      and(
        eq(playerHoleNotes.userId, userId),
        eq(playerHoleNotes.courseId, courseId),
      ),
    )
    .orderBy(asc(playerHoleNotes.holeNumber), desc(playerHoleNotes.createdAt))

  return rows.map((r) => ({
    id: r.id,
    holeNumber: r.holeNumber,
    noteText: r.noteText,
    noteDate: r.noteDate,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))
}

export async function getMyNotesForCourse(courseId: string): Promise<PlayerNote[]> {
  const session = await requireSession()
  return getPlayerNotesForCourse(Number(session.user!.id), courseId)
}

export async function addPlayerNote(prevState: string | null, formData: FormData) {
  const session = await requireSession()
  const userId = Number(session.user!.id)

  const courseId = (formData.get('courseId') as string)?.trim()
  const holeNumber = Number(formData.get('holeNumber'))
  const noteText = (formData.get('noteText') as string)?.trim()
  const noteDateRaw = (formData.get('noteDate') as string)?.trim()
  const noteDate = noteDateRaw && noteDateRaw.length > 0 ? noteDateRaw : null

  if (!courseId || !findCourse(courseId)) return 'Course not found.'
  if (!holeNumber || holeNumber < 1 || holeNumber > 18) return 'Invalid hole.'
  if (!noteText) return 'Note cannot be empty.'

  await db.insert(playerHoleNotes).values({
    userId,
    courseId,
    holeNumber,
    noteText,
    noteDate,
  })

  revalidatePath(`/courses/${courseId}`)
  return null
}

export async function addPlayerNoteForUser(prevState: string | null, formData: FormData) {
  await requireCoach()

  const userId = Number(formData.get('userId'))
  const courseId = (formData.get('courseId') as string)?.trim()
  const holeNumber = Number(formData.get('holeNumber'))
  const noteText = (formData.get('noteText') as string)?.trim()
  const noteDateRaw = (formData.get('noteDate') as string)?.trim()
  const noteDate = noteDateRaw && noteDateRaw.length > 0 ? noteDateRaw : null

  if (!userId) return 'Missing user.'
  if (!courseId || !findCourse(courseId)) return 'Course not found.'
  if (!holeNumber || holeNumber < 1 || holeNumber > 18) return 'Invalid hole.'
  if (!noteText) return 'Note cannot be empty.'

  await db.insert(playerHoleNotes).values({
    userId,
    courseId,
    holeNumber,
    noteText,
    noteDate,
  })

  revalidatePath(`/admin/courses/${courseId}/players/${userId}`)
  return null
}

export async function updatePlayerNote(prevState: string | null, formData: FormData) {
  const session = await requireSession()
  const userId = Number(session.user!.id)
  const isCoach = session.user!.role === 'coach'

  const id = Number(formData.get('id'))
  const noteText = (formData.get('noteText') as string)?.trim()
  const noteDateRaw = (formData.get('noteDate') as string)?.trim()
  const noteDate = noteDateRaw && noteDateRaw.length > 0 ? noteDateRaw : null

  if (!id) return 'Missing note id.'
  if (!noteText) return 'Note cannot be empty.'

  const [existing] = await db
    .select()
    .from(playerHoleNotes)
    .where(eq(playerHoleNotes.id, id))
    .limit(1)
  if (!existing) return 'Note not found.'
  if (!isCoach && existing.userId !== userId) return 'Not authorized.'

  await db
    .update(playerHoleNotes)
    .set({ noteText, noteDate, updatedAt: new Date() })
    .where(eq(playerHoleNotes.id, id))

  revalidatePath(`/courses/${existing.courseId}`)
  revalidatePath(`/admin/courses/${existing.courseId}/players/${existing.userId}`)
  return null
}

export async function deletePlayerNote(id: number) {
  const session = await requireSession()
  const userId = Number(session.user!.id)
  const isCoach = session.user!.role === 'coach'

  const [existing] = await db
    .select()
    .from(playerHoleNotes)
    .where(eq(playerHoleNotes.id, id))
    .limit(1)
  if (!existing) return
  if (!isCoach && existing.userId !== userId) return

  await db.delete(playerHoleNotes).where(eq(playerHoleNotes.id, id))

  revalidatePath(`/courses/${existing.courseId}`)
  revalidatePath(`/admin/courses/${existing.courseId}/players/${existing.userId}`)
}

export async function saveCoachGuideHole(prevState: string | null, formData: FormData) {
  const session = await requireCoach()
  const updaterId = Number(session.user!.id)

  const courseId = (formData.get('courseId') as string)?.trim()
  const holeNumber = Number(formData.get('holeNumber'))

  if (!courseId || !findCourse(courseId)) return 'Course not found.'
  if (!holeNumber || holeNumber < 1 || holeNumber > 18) return 'Invalid hole.'

  const cleanText = (key: string) => {
    const v = (formData.get(key) as string)?.trim()
    return v && v.length > 0 ? v : null
  }

  const values = {
    teeShotNotes: cleanText('teeShotNotes'),
    approachNotes: cleanText('approachNotes'),
    aroundGreenNotes: cleanText('aroundGreenNotes'),
    missAvoidNotes: cleanText('missAvoidNotes'),
    generalStrategy: cleanText('generalStrategy'),
    updatedBy: updaterId,
    updatedAt: new Date(),
  }

  const [existing] = await db
    .select({ id: courseHoleGuides.id })
    .from(courseHoleGuides)
    .where(
      and(
        eq(courseHoleGuides.courseId, courseId),
        eq(courseHoleGuides.holeNumber, holeNumber),
      ),
    )
    .limit(1)

  if (existing) {
    await db
      .update(courseHoleGuides)
      .set(values)
      .where(eq(courseHoleGuides.id, existing.id))
  } else {
    await db.insert(courseHoleGuides).values({
      courseId,
      holeNumber,
      ...values,
    })
  }

  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath(`/courses/${courseId}`)
  return null
}

export async function getRosterForCoach() {
  await requireCoach()
  return db
    .select({ id: users.id, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(users.name)
}
