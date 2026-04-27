import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Skip DB-dependent pages during static analysis at build time
  // DATABASE_URL must be set in Vercel env vars for production builds
}

export default nextConfig
