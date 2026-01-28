import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCollectionReminder } from '@/lib/email/resend'
import { sendPushNotification } from '@/lib/push/web-push'
import { isCollectionTomorrow, WasteType } from '@/lib/data/schedule-2026'

export const dynamic = 'force-dynamic'

interface NotificationResult {
  userId: string
  email?: string
  type: 'email' | 'push'
  success: boolean
  error?: string
  wasteTypes?: WasteType[]
}

const wasteTypeNames: Record<string, string> = {
  E: 'embalaža',
  M: 'mešani odpadki',
  B: 'biološki odpadki',
}

export async function GET(request: NextRequest) {
  // Preveri CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: NotificationResult[] = []
  const errors: string[] = []

  try {
    const supabase = createAdminClient()

    // Izračunaj jutrišnji datum
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    console.log(`[Cron] Checking collections for: ${tomorrowStr}`)

    // Pridobi vse uporabnike z email_notifications ALI push_notifications
    const { data: users, error: usersError } = await supabase
      .from('user_settings')
      .select(
        `
        user_id,
        email,
        em_okolis,
        bio_okolis,
        email_notifications,
        push_notifications
      `
      )
      .or('email_notifications.eq.true,push_notifications.eq.true')

    if (usersError) {
      console.error('[Cron] Error fetching users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users', details: usersError.message }, { status: 500 })
    }

    if (!users || users.length === 0) {
      console.log('[Cron] No users with notifications enabled')
      return NextResponse.json({
        success: true,
        message: 'No users with notifications enabled',
        sent: 0,
        date: tomorrowStr,
      })
    }

    console.log(`[Cron] Found ${users.length} users with notifications enabled`)

    // UUID regex za validacijo
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    // Za vsakega uporabnika preveri če ima odvoz jutri
    for (const userSettings of users) {
      const { user_id, email: settingsEmail, em_okolis, bio_okolis, email_notifications, push_notifications } = userSettings

      // Preskoči če user_id ni veljaven UUID
      if (!user_id || !uuidRegex.test(user_id)) {
        console.log(`[Cron] Skipping invalid user_id: ${user_id}`)
        continue
      }

      // Preskoči če nima nastavljenih okolišev
      if (!em_okolis || !bio_okolis) {
        console.log(`[Cron] User ${user_id} skipped - missing okolis settings`)
        continue
      }

      // Preveri če ima odvoz jutri
      const collection = isCollectionTomorrow(em_okolis, bio_okolis)

      if (!collection) {
        console.log(`[Cron] User ${user_id} has no collection tomorrow`)
        continue
      }

      // Pridobi email - najprej iz user_settings, potem iz auth.users
      let userEmail: string | undefined = settingsEmail || undefined
      if (email_notifications && !userEmail) {
        try {
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user_id)
          if (authError || !authUser.user?.email) {
            console.error(`[Cron] Error fetching user email for ${user_id}:`, authError)
            errors.push(`Failed to get email for user ${user_id}`)
          } else {
            userEmail = authUser.user.email
          }
        } catch (authErr) {
          console.error(`[Cron] Exception fetching user email for ${user_id}:`, authErr)
          errors.push(`Exception getting email for user ${user_id}`)
        }
      }

      // Pošlji EMAIL obvestilo
      if (email_notifications && userEmail) {
        // Preveri če že ni bil poslan email za ta datum
        const { data: existingEmailLog } = await supabase
          .from('notification_log')
          .select('id')
          .eq('user_id', user_id)
          .eq('collection_date', tomorrowStr)
          .eq('notification_type', 'email')
          .single()

        if (!existingEmailLog) {
          console.log(`[Cron] Sending email to ${userEmail} for ${tomorrowStr}`)
          const emailResult = await sendCollectionReminder(userEmail, collection.date, collection.types)

          if (emailResult.success) {
            const { error: emailLogError } = await supabase.from('notification_log').insert({
              user_id,
              collection_date: tomorrowStr,
              waste_types: collection.types.join(','),
              notification_type: 'email',
              sent_at: new Date().toISOString(),
            })

            if (emailLogError) {
              console.error(`[Cron] Failed to log email notification for ${user_id}:`, emailLogError)
            }

            results.push({
              userId: user_id,
              email: userEmail,
              type: 'email',
              success: true,
              wasteTypes: collection.types,
            })
          } else {
            results.push({
              userId: user_id,
              email: userEmail,
              type: 'email',
              success: false,
              error: emailResult.error,
            })
            errors.push(`Failed to send email to ${userEmail}: ${emailResult.error}`)
          }
        } else {
          console.log(`[Cron] Email already sent to ${userEmail} for ${tomorrowStr}`)
        }
      }

      // Pošlji PUSH obvestila
      if (push_notifications) {
        // Preveri če že ni bil poslan push za ta datum
        const { data: existingPushLog } = await supabase
          .from('notification_log')
          .select('id')
          .eq('user_id', user_id)
          .eq('collection_date', tomorrowStr)
          .eq('notification_type', 'push')
          .single()

        if (!existingPushLog) {
          // Pridobi vse push subscription-e uporabnika
          const { data: subscriptions, error: subError } = await supabase
            .from('push_subscriptions')
            .select('id, endpoint, p256dh, auth')
            .eq('user_id', user_id)

          if (subError) {
            console.error(`[Cron] Error fetching push subscriptions for ${user_id}:`, subError)
            continue
          }

          if (subscriptions && subscriptions.length > 0) {
            const wasteTypesList = collection.types.map((t) => wasteTypeNames[t] || t).join(', ')

            let anyPushSuccess = false

            for (const sub of subscriptions) {
              console.log(`[Cron] Sending push to user ${user_id} (endpoint: ${sub.endpoint.slice(0, 50)}...)`)

              const pushResult = await sendPushNotification(
                {
                  endpoint: sub.endpoint,
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
                {
                  title: '350logatec',
                  body: `Jutri je odvoz odpadkov: ${wasteTypesList}`,
                  tag: `collection-${tomorrowStr}`,
                  url: '/odvoz',
                }
              )

              if (pushResult.success) {
                anyPushSuccess = true
                // Posodobi last_used_at
                await supabase.from('push_subscriptions').update({ last_used_at: new Date().toISOString() }).eq('id', sub.id)
              } else if (pushResult.expired) {
                // Izbriši potečeno subscription
                console.log(`[Cron] Removing expired push subscription for user ${user_id}`)
                await supabase.from('push_subscriptions').delete().eq('id', sub.id)
              } else {
                console.error(`[Cron] Push failed for user ${user_id}:`, pushResult.error)
              }
            }

            if (anyPushSuccess) {
              // Zapiši v notification_log
              const { error: pushLogError } = await supabase.from('notification_log').insert({
                user_id,
                collection_date: tomorrowStr,
                waste_types: collection.types.join(','),
                notification_type: 'push',
                sent_at: new Date().toISOString(),
              })

              if (pushLogError) {
                console.error(`[Cron] Failed to log push notification for ${user_id}:`, pushLogError)
                errors.push(`Failed to log push for user ${user_id}: ${pushLogError.message}`)
              }

              results.push({
                userId: user_id,
                type: 'push',
                success: true,
                wasteTypes: collection.types,
              })
            }
          }
        } else {
          console.log(`[Cron] Push already sent to user ${user_id} for ${tomorrowStr}`)
        }
      }
    }

    const emailsSent = results.filter((r) => r.type === 'email' && r.success).length
    const emailsFailed = results.filter((r) => r.type === 'email' && !r.success).length
    const pushSent = results.filter((r) => r.type === 'push' && r.success).length

    console.log(`[Cron] Completed: ${emailsSent} emails sent, ${emailsFailed} failed, ${pushSent} push notifications sent`)

    return NextResponse.json({
      success: true,
      date: tomorrowStr,
      emails: {
        sent: emailsSent,
        failed: emailsFailed,
      },
      push: {
        sent: pushSent,
      },
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('[Cron] Unexpected error:', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
