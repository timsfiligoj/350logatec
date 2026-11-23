// Manual trigger / backfill for the Sentinel-1 radar flood frames.
// POST { from: "YYYY-MM-DD", to: "YYYY-MM-DD", force?: boolean }
// Bearer VESOLJE_TRIGGER_SECRET. Processes days oldest first within a
// ~45 s budget and returns `remaining`; call again with the same range to
// continue (stored days are skipped unless force=true).

import { NextResponse, type NextRequest } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { acquireRadarRange } from '@/lib/space/radar'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const DAY_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

function isAuthorized(req: NextRequest, secret: string): boolean {
  const header = req.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  if (header.length !== expected.length) return false
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

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const { from, to } = body
  if (typeof from !== 'string' || typeof to !== 'string' || !DAY_RE.test(from) || !DAY_RE.test(to) || from > to) {
    return NextResponse.json(
      { error: 'from and to must be YYYY-MM-DD with from <= to' },
      { status: 400 },
    )
  }

  try {
    const outcome = await acquireRadarRange({
      fromDay: from,
      toDay: to,
      force: body.force === true,
      budgetMs: 45_000,
    })
    if (outcome.results.some((r) => r.status === 'acquired')) {
      revalidatePath('/vesolje/planinsko-polje')
    }
    return NextResponse.json(outcome)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
