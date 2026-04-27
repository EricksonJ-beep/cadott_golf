'use server'

import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function getProfile() {
  const session = await auth()
  if (!session?.user) redirect('/')

  const [user] = await db
    .select({ id: users.id, name: users.name, grade: users.grade, username: users.username })
    .from(users)
    .where(eq(users.id, Number(session.user.id)))
    .limit(1)

  return user
}

export async function updateProfile(_prevState: string | null, formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const name = (formData.get('name') as string)?.trim()
  const grade = formData.get('grade') ? Number(formData.get('grade')) : null

  if (!name) return 'Name is required.'

  await db
    .update(users)
    .set({ name, grade })
    .where(eq(users.id, Number(session.user.id)))

  revalidatePath('/dashboard')
  return null
}

export async function changeOwnPassword(_prevState: string | null, formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const current = formData.get('currentPassword') as string
  const newPw = formData.get('newPassword') as string
  const confirm = formData.get('confirmPassword') as string

  if (!current || !newPw || !confirm) return 'All fields are required.'
  if (newPw.length < 8) return 'New password must be at least 8 characters.'
  if (newPw !== confirm) return 'Passwords do not match.'

  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, Number(session.user.id)))
    .limit(1)

  const valid = await bcrypt.compare(current, user.passwordHash)
  if (!valid) return 'Current password is incorrect.'

  const hash = await bcrypt.hash(newPw, 12)
  await db
    .update(users)
    .set({ passwordHash: hash })
    .where(eq(users.id, Number(session.user.id)))

  revalidatePath('/dashboard')
  return null
}
