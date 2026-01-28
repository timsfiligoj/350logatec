import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCollectionReminder } from '@/lib/email/resend'
import { sendPushNotification } from '@/lib/push/web-push'
import { isCollectionTomorrow, getNextCollection, WasteType } from '@/lib/data/schedule-2026'

export const dynamic = 'force-dynamic'

const wasteTypeNames: Record<string, string> = {
  E: 'embalaža',
  M: 'mešani odpadki',
  B: 'biološki odpadki',
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { type = 'both', useRealData = true } = body // type: 'email' | 'push' | 'both'

    const adminClient = createAdminClient()

    // Get user settings
    const { data: settings, error: settingsError } = await adminClient
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json({
        error: 'User settings not found',
        details: settingsError?.message,
      }, { status: 404 })
    }

    // Determine collection data
    let collectionDate: string
    let wasteTypes: WasteType[]

    if (useRealData && settings.em_okolis && settings.bio_okolis) {
      // Try tomorrow first
      const tomorrow = isCollectionTomorrow(settings.em_okolis, settings.bio_okolis)
      if (tomorrow) {
        collectionDate = tomorrow.date
        wasteTypes = tomorrow.types
      } else {
        // Use next collection
        const next = getNextCollection(settings.em_okolis, settings.bio_okolis)
        if (next) {
          collectionDate = next.date
          wasteTypes = next.types
        } else {
          // Fallback to test data
          const testDate = new Date()
          testDate.setDate(testDate.getDate() + 1)
          collectionDate = testDate.toISOString().split('T')[0]
          wasteTypes = ['E', 'M']
        }
      }
    } else {
      // Test data
      const testDate = new Date()
      testDate.setDate(testDate.getDate() + 1)
      collectionDate = testDate.toISOString().split('T')[0]
      wasteTypes = ['E', 'M', 'B']
    }

    const results: { type: string; success: boolean; error?: string }[] = []

    // Send email notification
    if (type === 'email' || type === 'both') {
      if (user.email) {
        const emailResult = await sendCollectionReminder(user.email, collectionDate, wasteTypes)
        results.push({
          type: 'email',
          success: emailResult.success,
          error: emailResult.error,
        })
      } else {
        results.push({
          type: 'email',
          success: false,
          error: 'No email address',
        })
      }
    }

    // Send push notifications
    if (type === 'push' || type === 'both') {
      const { data: subscriptions, error: subError } = await adminClient
        .from('push_subscriptions')
        .select('id, endpoint, p256dh, auth')
        .eq('user_id', user.id)

      if (subError) {
        results.push({
          type: 'push',
          success: false,
          error: `Failed to fetch subscriptions: ${subError.message}`,
        })
      } else if (!subscriptions || subscriptions.length === 0) {
        results.push({
          type: 'push',
          success: false,
          error: 'No push subscriptions found',
        })
      } else {
        const wasteTypesList = wasteTypes.map(t => wasteTypeNames[t] || t).join(', ')

        for (const sub of subscriptions) {
          const pushResult = await sendPushNotification(
            {
              endpoint: sub.endpoint,
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
            {
              title: '🧪 Test: Jutri je odvoz odpadkov',
              body: `Ne pozabite pripraviti: ${wasteTypesList}`,
              tag: `test-${Date.now()}`,
              url: '/odvoz',
            }
          )

          results.push({
            type: `push (${sub.endpoint.slice(0, 30)}...)`,
            success: pushResult.success,
            error: pushResult.error,
          })

          if (pushResult.expired) {
            // Remove expired subscription
            await adminClient.from('push_subscriptions').delete().eq('id', sub.id)
            results[results.length - 1].error = 'Subscription expired - removed'
          }
        }
      }
    }

    return NextResponse.json({
      success: results.some(r => r.success),
      collectionData: {
        date: collectionDate,
        wasteTypes,
        wasteTypesReadable: wasteTypes.map(t => wasteTypeNames[t] || t),
      },
      results,
    })
  } catch (err) {
    return NextResponse.json({
      error: 'Internal error',
      details: err instanceof Error ? err.message : 'Unknown',
    }, { status: 500 })
  }
}
