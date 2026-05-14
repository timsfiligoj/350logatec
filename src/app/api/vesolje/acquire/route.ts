// Manual trigger endpoint for the 350space acquisition pipeline. Protected
// with a Bearer token (VESOLJE_TRIGGER_SECRET) using a timing-safe
// comparison. Single endpoint covers all four view kinds; callers can also
// target a specific calendar month for backfill.

import { NextResponse, type NextRequest } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { acquire } from '@/lib/space/acquire'
import type { ViewKind } from '@/lib/space/storage'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const ALLOWED_VIEW_KINDS: readonly ViewKind[] = [
  'true_color',
  'ndwi',
  'ndvi',
  'ndsi',
] as const

function isAuthorized(req: NextRequest, secret: string): boolean {
  const header = req.headers.get('authorization')
  const expected = `Bearer ${secret}`
  if (!header || header.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected))
}

function parseViewKind(value: unknown): ViewKind | { error: string } {
  if (value === undefined) return 'true_color'
  if (typeof value !== 'string') {
    return { error: 'view_kind must be a string' }
  }
  if (!ALLOWED_VIEW_KINDS.includes(value as ViewKind)) {
    return {
      error: `view_kind must be one of: ${ALLOWED_VIEW_KINDS.join(', ')}`,
    }
  }
  return value as ViewKind
}

function parseMonth(value: unknown): string | undefined | { error: string } {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') {
    return { error: 'month must be a string in YYYY-MM format' }
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    return { error: `month must be YYYY-MM, got: ${value}` }
  }
  return value
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

  const viewKind = parseViewKind(body.view_kind)
  if (typeof viewKind !== 'string') {
    return NextResponse.json({ error: viewKind.error }, { status: 400 })
  }

  const month = parseMonth(body.month)
  if (typeof month === 'object' && month !== null) {
    return NextResponse.json({ error: month.error }, { status: 400 })
  }

  const force = body.force === true

  try {
    const result = await acquire({ viewKind, month, force })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
