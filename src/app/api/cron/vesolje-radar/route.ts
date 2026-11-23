// Daily Sentinel-1 radar cron for the Planinsko polje flood view (see
// vercel.json). Looks back a few days because CDSE publishes GRD products
// with a delay of a few hours up to ~2 days; already stored days are
// skipped cheaply via the scene_id dedupe in acquireRadarPass.

import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { acquireRadarRange } from '@/lib/space/radar'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const LOOKBACK_DAYS = 6

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = req.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  if (header.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected))
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  const from = new Date(today.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
  const outcome = await acquireRadarRange({
    fromDay: from.toISOString().slice(0, 10),
    toDay: today.toISOString().slice(0, 10),
    force: false,
    budgetMs: 40_000,
  })

  const acquired = outcome.results.filter((r) => r.status === 'acquired').length
  if (acquired > 0) revalidatePath('/vesolje/planinsko-polje')

  return NextResponse.json(
    { acquired, ...outcome },
    { status: outcome.errors.length > 0 && acquired === 0 ? 500 : 200 },
  )
}
