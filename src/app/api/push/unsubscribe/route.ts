import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint required' }, { status: 400 })
    }

    // Delete the subscription
    await supabase.from('push_subscriptions').delete().eq('user_id', user.id).eq('endpoint', endpoint)

    // Check if user has any remaining subscriptions
    const { data: remaining } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    // If no subscriptions left, disable push_notifications in user_settings
    if (!remaining || remaining.length === 0) {
      await supabase.from('user_settings').update({ push_notifications: false }).eq('user_id', user.id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Push unsubscribe error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
