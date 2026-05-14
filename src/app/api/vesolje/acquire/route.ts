// Manual trigger endpoint for the 350space acquisition pipeline. Protected
// with a Bearer token (VESOLJE_TRIGGER_SECRET) using a timing-safe comparison.
// Phase 2: only the true_color view is wired up. Cron is intentionally NOT
// added here; that comes in a later phase.

import { NextResponse, type NextRequest } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { acquireTrueColor } from '@/lib/space/acquire'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest, secret: string): boolean {
  const header = req.headers.get('authorization')
  const expected = `Bearer ${secret}`
  if (!header || header.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected))
}

export async function POST(req: NextRequest) {
  const secret = process.env.VESOLJE_TRIGGER_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'VESOLJE_TRIGGER_SECRET is not configured on the server.' },
      { status: 500 },
    )
  }

  if (!isAuthorized(req, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req
    .json()
    .catch(() => ({}))) as { force?: boolean }
  const force = body.force === true

  try {
    const result = await acquireTrueColor({ force })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
