import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPushNotification } from '@/lib/push/web-push'

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's push subscriptions
  const { data: subscriptions, error: subError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', user.id)

  if (subError || !subscriptions?.length) {
    return NextResponse.json(
      { error: 'No push subscriptions found', details: subError?.message },
      { status: 404 }
    )
  }

  const results = []

  for (const sub of subscriptions) {
    const result = await sendPushNotification(
      {
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
      {
        title: 'Test obvestilo',
        body: 'Push obvestila delujejo pravilno!',
        tag: 'test',
        url: '/nastavitve',
      }
    )

    results.push({
      endpoint: sub.endpoint.slice(0, 50) + '...',
      ...result,
    })

    // Clean up expired subscriptions
    if (result.expired) {
      await supabase.from('push_subscriptions').delete().eq('id', sub.id)
    }
  }

  return NextResponse.json({
    message: 'Test notifications sent',
    results,
  })
}
