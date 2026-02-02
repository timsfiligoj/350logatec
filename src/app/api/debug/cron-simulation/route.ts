import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isCollectionTomorrow, schedule2026 } from '@/lib/data/schedule-2026'

export const dynamic = 'force-dynamic'

// Simulates what the cron job would do, without actually sending notifications
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Calculate tomorrow's date (same logic as cron)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Get all users with notifications enabled
    const { data: users, error: usersError } = await adminClient
      .from('user_settings')
      .select(`
        user_id,
        em_okolis,
        bio_okolis,
        email_notifications,
        push_notifications,
        has_bio_bin
      `)
      .or('email_notifications.eq.true,push_notifications.eq.true')

    if (usersError) {
      return NextResponse.json({
        error: 'Failed to fetch users',
        details: usersError.message,
      }, { status: 500 })
    }

    // Check what okoliši have collection tomorrow
    const okolisiWithCollectionTomorrow: string[] = []
    for (const [key, dates] of Object.entries(schedule2026)) {
      if (dates.includes(tomorrowStr)) {
        okolisiWithCollectionTomorrow.push(key)
      }
    }

    // Simulate what would happen for each user
    const simulation = []

    for (const userSettings of users || []) {
      const { user_id, em_okolis, bio_okolis, email_notifications, push_notifications, has_bio_bin } = userSettings

      const userSimulation: {
        userId: string
        isCurrentUser: boolean
        settings: {
          em_okolis: number | null
          bio_okolis: number | null
          email_notifications: boolean
          push_notifications: boolean
          has_bio_bin: boolean | null
        }
        wouldSkip: boolean
        skipReason?: string
        collection?: ReturnType<typeof isCollectionTomorrow>
        filteredTypes?: string[]
        wouldSendEmail: boolean
        wouldSendPush: boolean
      } = {
        userId: user_id,
        isCurrentUser: user_id === user.id,
        settings: {
          em_okolis,
          bio_okolis,
          email_notifications,
          push_notifications,
          has_bio_bin,
        },
        wouldSkip: false,
        wouldSendEmail: false,
        wouldSendPush: false,
      }

      // Check if okolis settings are missing
      if (!em_okolis || !bio_okolis) {
        userSimulation.wouldSkip = true
        userSimulation.skipReason = 'Missing okolis settings'
        simulation.push(userSimulation)
        continue
      }

      // Check if there's a collection tomorrow
      const collection = isCollectionTomorrow(em_okolis, bio_okolis)

      if (!collection) {
        userSimulation.wouldSkip = true
        userSimulation.skipReason = `No collection tomorrow for E${em_okolis}/B${bio_okolis}`
        simulation.push(userSimulation)
        continue
      }

      userSimulation.collection = collection

      // Filter BIO if user doesn't have a bin
      let typesToNotify = collection.types
      if (has_bio_bin === false) {
        typesToNotify = typesToNotify.filter(t => t !== 'B')
      }
      userSimulation.filteredTypes = typesToNotify

      // Skip if no types to notify (e.g., only BIO collection but user has no bin)
      if (typesToNotify.length === 0) {
        userSimulation.wouldSkip = true
        userSimulation.skipReason = 'No relevant waste types (has_bio_bin=false, only BIO collection)'
        simulation.push(userSimulation)
        continue
      }

      // Check notification log for duplicates
      const { data: existingEmailLog } = await adminClient
        .from('notification_log')
        .select('id')
        .eq('user_id', user_id)
        .eq('collection_date', tomorrowStr)
        .eq('notification_type', 'email')
        .single()

      const { data: existingPushLog } = await adminClient
        .from('notification_log')
        .select('id')
        .eq('user_id', user_id)
        .eq('collection_date', tomorrowStr)
        .eq('notification_type', 'push')
        .single()

      if (email_notifications && !existingEmailLog) {
        userSimulation.wouldSendEmail = true
      }

      if (push_notifications && !existingPushLog) {
        // Check if user has push subscriptions
        const { data: subs } = await adminClient
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', user_id)

        if (subs && subs.length > 0) {
          userSimulation.wouldSendPush = true
        }
      }

      simulation.push(userSimulation)
    }

    // Summary
    const summary = {
      totalUsersWithNotifications: users?.length || 0,
      usersWithCollectionTomorrow: simulation.filter(s => s.collection).length,
      usersSkipped: simulation.filter(s => s.wouldSkip).length,
      wouldSendEmails: simulation.filter(s => s.wouldSendEmail).length,
      wouldSendPush: simulation.filter(s => s.wouldSendPush).length,
    }

    return NextResponse.json({
      cronSimulation: {
        serverTime: {
          utc: new Date().toISOString(),
          local: new Date().toLocaleString('sl-SI', { timeZone: 'Europe/Ljubljana' }),
        },
        tomorrowDate: tomorrowStr,
        okolisiWithCollectionTomorrow,
        summary,
        users: simulation,
      },
    })
  } catch (err) {
    return NextResponse.json({
      error: 'Internal error',
      details: err instanceof Error ? err.message : 'Unknown',
    }, { status: 500 })
  }
}
