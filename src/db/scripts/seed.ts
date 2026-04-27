import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const DEFAULT_CLUBS = [
  { name: 'Driver',    type: 'driver' as const, defaultOrder: 1 },
  { name: '3 Wood',   type: 'wood' as const,   defaultOrder: 2 },
  { name: '5 Wood',   type: 'wood' as const,   defaultOrder: 3 },
  { name: '2 Hybrid', type: 'hybrid' as const, defaultOrder: 4 },
  { name: '3 Hybrid', type: 'hybrid' as const, defaultOrder: 5 },
  { name: '3 Iron',   type: 'iron' as const,   defaultOrder: 6 },
  { name: '4 Iron',   type: 'iron' as const,   defaultOrder: 7 },
  { name: '5 Iron',   type: 'iron' as const,   defaultOrder: 8 },
  { name: '6 Iron',   type: 'iron' as const,   defaultOrder: 9 },
  { name: '7 Iron',   type: 'iron' as const,   defaultOrder: 10 },
  { name: '8 Iron',   type: 'iron' as const,   defaultOrder: 11 },
  { name: '9 Iron',   type: 'iron' as const,   defaultOrder: 12 },
  { name: 'Pitching Wedge', type: 'wedge' as const, defaultOrder: 13 },
  { name: 'Gap Wedge',      type: 'wedge' as const, defaultOrder: 14 },
  { name: 'Sand Wedge',     type: 'wedge' as const, defaultOrder: 15 },
  { name: 'Lob Wedge',      type: 'wedge' as const, defaultOrder: 16 },
  { name: 'Putter',         type: 'putter' as const, defaultOrder: 17 },
]

async function main() {
  console.log('Seeding database…')

  // Default clubs
  const existingClubs = await db.select().from(schema.clubsDefault)
  if (existingClubs.length === 0) {
    await db.insert(schema.clubsDefault).values(DEFAULT_CLUBS)
    console.log('✓ Default clubs inserted')
  } else {
    console.log('  Default clubs already exist, skipping')
  }

  // Coach account
  const existing = await db.select().from(schema.users).where(eq(schema.users.username, 'coach')).limit(1)
  if (existing.length === 0) {
    const hash = await bcrypt.hash('Cadott2026!', 12)
    await db.insert(schema.users).values({
      username: 'coach',
      passwordHash: hash,
      role: 'coach',
      name: 'Coach Erickson',
      mustChangePassword: false,
    })
    console.log('✓ Coach account created: username=coach  password=Cadott2026!')
    console.log('  IMPORTANT: Change this password after first login.')
  } else {
    console.log('  Coach account already exists, skipping')
  }

  // Active season
  const existingSeasons = await db.select().from(schema.seasons)
  if (existingSeasons.length === 0) {
    await db.insert(schema.seasons).values({
      name: 'Spring 2026',
      startDate: '2026-03-01',
      endDate: '2026-06-30',
      isActive: true,
    })
    console.log('✓ Spring 2026 season created')
  } else {
    console.log('  Season already exists, skipping')
  }

  console.log('\nSeed complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
