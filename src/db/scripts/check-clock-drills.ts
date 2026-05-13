import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.DATABASE_URL!)
async function main() {
  const rows = await sql`SELECT id, name, new_until FROM challenges WHERE name LIKE 'Clock Drill%' ORDER BY name`
  console.log(rows)
}
main()
