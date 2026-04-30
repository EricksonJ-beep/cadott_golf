import type { NextAuthConfig } from 'next-auth'
import type {} from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      mustChangePassword: boolean
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
  interface User {
    role: string
    mustChangePassword: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    mustChangePassword: boolean
  }
}

// Edge-safe config: no DB, no bcrypt. Used by the proxy/middleware.
export const authConfig: NextAuthConfig = {
  providers: [], // populated in auth.ts (Node runtime)
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!
        token.role = user.role
        token.mustChangePassword = user.mustChangePassword
      }
      if (trigger === 'update' && session?.user) {
        if (typeof session.user.mustChangePassword === 'boolean') {
          token.mustChangePassword = session.user.mustChangePassword
        }
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.mustChangePassword = token.mustChangePassword
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
}
