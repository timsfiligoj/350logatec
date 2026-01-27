import { NextResponse } from 'next/server'
import { sendCollectionReminder } from '@/lib/email/resend'

// TEST ONLY - Remove after testing!
export async function GET() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const result = await sendCollectionReminder(
    'tim@350life.com',  // Spremeni v svoj email
    tomorrowStr,
    ['E', 'M']  // Test waste types
  )

  return NextResponse.json(result)
}
