import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('secret') !== process.env.SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER`
  return NextResponse.json({ success: true })
}
