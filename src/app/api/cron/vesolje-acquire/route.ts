// Monthly acquisition cron for the 350space imagery. Runs on the 1st of
// each month (see vercel.json) and acquires the previous calendar month for
// all four view kinds — by then the month is complete, so the lowest-cloud
// scene pick in acquire() covers every capture of that month.

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { acquire, type AcquireResult } from '@/lib/space/acquire'
import { VESOLJE_PAGE_PATHS } from '@/lib/space/pages'
import type { ViewKind } from '@/lib/space/storage'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const VIEW_KINDS: readonly ViewKind[] = [
  'true_color',
  'ndvi',
  'ndwi',
  'ndsi',
] as const

// YYYY-MM of the month before the given date, in UTC.
function previousMonth(now: Date): string {
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() // 0-based; also "previous month" 1-based
  const d = new Date(Date.UTC(year, month - 1, 1))
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${d.getUTCFullYear()}-${mm}`
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const month = previousMonth(new Date())

  const results: Array<
    | { view_kind: ViewKind; result: AcquireResult }
    | { view_kind: ViewKind; error: string }
  > = []
  let acquiredCount = 0

  // Sequential on purpose: keeps CDSE request rate low, and four kinds fit
  // comfortably inside the 60 s function budget.
  for (const viewKind of VIEW_KINDS) {
    try {
      const result = await acquire({ viewKind, month, force: false })
      if (result.status === 'acquired') acquiredCount += 1
      results.push({ view_kind: viewKind, result })
    } catch (error) {
      results.push({
        view_kind: viewKind,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  if (acquiredCount > 0) {
    for (const path of VESOLJE_PAGE_PATHS) revalidatePath(path)
  }

  const failed = results.filter((r) => 'error' in r).length

  return NextResponse.json(
    { month, acquired: acquiredCount, failed, results },
    { status: failed === VIEW_KINDS.length ? 500 : 200 },
  )
}
