'use server'

import { signIn, signOut } from '@/lib/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'

export async function login(_prevState: string | null, formData: FormData) {
  try {
    await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirectTo: '/dashboard',
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return 'Invalid username or password.'
    }
    throw error
  }
  return null
}

export async function logout() {
  await signOut({ redirectTo: '/' })
}

export async function changePassword(_prevState: string | null, formData: FormData) {
  const session = await auth()
  if (!session?.user) redirect('/')

  const newPassword = formData.get('newPassword') as string
  const confirm = formData.get('confirmPassword') as string

  if (!newPassword || newPassword.length < 8) {
    return 'Password must be at least 8 characters.'
  }
  if (newPassword !== confirm) {
    return 'Passwords do not match.'
  }

  const hash = await bcrypt.hash(newPassword, 12)
  await db
    .update(users)
    .set({ passwordHash: hash, mustChangePassword: false })
    .where(eq(users.id, parseInt(session.user.id)))

  redirect('/dashboard')
}
