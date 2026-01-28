import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isCollectionTomorrow, getUpcomingCollections, schedule2026 } from '@/lib/data/schedule-2026'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Get user settings
    const { data: settings, error: settingsError } = await adminClient
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get push subscriptions
    const { data: pushSubs, error: pushError } = await adminClient
      .from('push_subscriptions')
      .select('id, endpoint, created_at, last_used_at')
      .eq('user_id', user.id)

    // Get notification log (last 10)
    const { data: notifLog, error: logError } = await adminClient
      .from('notification_log')
      .select('*')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(10)

    // Calculate dates
    const now = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Check collection tomorrow
    let collectionTomorrow = null
    let upcomingCollections: ReturnType<typeof getUpcomingCollections> = []

    if (settings?.em_okolis && settings?.bio_okolis) {
      collectionTomorrow = isCollectionTomorrow(settings.em_okolis, settings.bio_okolis)
      upcomingCollections = getUpcomingCollections(settings.em_okolis, settings.bio_okolis, 14)
    }

    // Check what okoliši have collection tomorrow
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    const okolisiWithCollectionTomorrow: string[] = []

    for (const [key, dates] of Object.entries(schedule2026)) {
      if (dates.includes(tomorrowStr)) {
        okolisiWithCollectionTomorrow.push(key)
      }
    }

    return NextResponse.json({
      debug: {
        currentTime: {
          utc: now.toISOString(),
          local: now.toLocaleString('sl-SI', { timeZone: 'Europe/Ljubljana' }),
        },
        tomorrowDate: tomorrowStr,
        okolisiWithCollectionTomorrow,
      },
      user: {
        id: user.id,
        email: user.email,
      },
      settings: settings || null,
      settingsError: settingsError?.message || null,
      notifications: {
        emailEnabled: settings?.email_notifications || false,
        pushEnabled: settings?.push_notifications || false,
        hasCollectionTomorrow: !!collectionTomorrow,
        collectionTomorrow,
        upcomingCollections,
      },
      pushSubscriptions: {
        count: pushSubs?.length || 0,
        subscriptions: pushSubs?.map(s => ({
          id: s.id,
          endpoint: s.endpoint.slice(0, 60) + '...',
          created_at: s.created_at,
          last_used_at: s.last_used_at,
        })) || [],
        error: pushError?.message || null,
      },
      notificationLog: {
        recent: notifLog || [],
        error: logError?.message || null,
      },
    })
  } catch (err) {
    return NextResponse.json({
      error: 'Internal error',
      details: err instanceof Error ? err.message : 'Unknown',
    }, { status: 500 })
  }
}
