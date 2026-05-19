import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
)

const sql = neon(env.DATABASE_URL)
const cats = await sql`SELECT id, name, slug FROM categories ORDER BY name`
console.log(JSON.stringify(cats, null, 2))
