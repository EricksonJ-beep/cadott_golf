import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const user = req.auth?.user

  if (pathname === '/') return NextResponse.next()

  if (!user) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (user.mustChangePassword && pathname !== '/change-password') {
    return NextResponse.redirect(new URL('/change-password', req.url))
  }

  if (pathname.startsWith('/admin') && user.role !== 'coach') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|sw.js).*)'],
}
