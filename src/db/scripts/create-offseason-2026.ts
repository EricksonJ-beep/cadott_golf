import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../schema'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function main() {
  try {
    // Create 2026 Offseason (June 6, 2026 - April 1, 2027)
    const result = await db.insert(schema.seasons).values({
      name: '2026 Offseason',
      startDate: '2026-06-06',
      endDate: '2027-04-01',
      isActive: true,
      kind: 'offseason',
    })

    console.log('✅ Created 2026 Offseason season')
    console.log('   Start: 2026-06-06')
    console.log('   End: 2027-04-01')
  } catch (error) {
    console.error('❌ Error creating season:', error)
    process.exit(1)
  }
}

main()
