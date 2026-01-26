import { NextRequest, NextResponse } from 'next/server'
import { sendCollectionReminder } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get('email') || 'delivered@resend.dev'
  const type = searchParams.get('type') || 'all' // 'bio', 'em', 'all'

  // Jutrišnji datum za test
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const results = []

  // Pošlji glede na tip
  if (type === 'bio' || type === 'all') {
    console.log(`[Test] Sending Bio email to ${email}`)
    const bioResult = await sendCollectionReminder(email, tomorrowStr, ['B'])
    results.push({
      type: 'Bio',
      wasteTypes: ['B'],
      ...bioResult,
    })
  }

  if (type === 'em' || type === 'all') {
    console.log(`[Test] Sending E/M email to ${email}`)
    const emResult = await sendCollectionReminder(email, tomorrowStr, ['E', 'M'])
    results.push({
      type: 'Embalaža + Mešani',
      wasteTypes: ['E', 'M'],
      ...emResult,
    })
  }

  const allSuccess = results.every(r => r.success)

  return NextResponse.json({
    success: allSuccess,
    email,
    date: tomorrowStr,
    results,
  })
}
