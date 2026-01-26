import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCollectionReminder } from '@/lib/email/resend'
import { isCollectionTomorrow, WasteType } from '@/lib/data/schedule-2026'

export const dynamic = 'force-dynamic'

interface NotificationResult {
  userId: string
  email: string
  success: boolean
  error?: string
  wasteTypes?: WasteType[]
}

export async function GET(request: NextRequest) {
  // Preveri CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const expectedSecret = `Bearer ${process.env.CRON_SECRET}`

  if (authHeader !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
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

    // Pridobi vse uporabnike z email_notifications = true
    const { data: users, error: usersError } = await supabase
      .from('user_settings')
      .select(`
        user_id,
        em_okolis,
        bio_okolis,
        email_notifications
      `)
      .eq('email_notifications', true)

    if (usersError) {
      console.error('[Cron] Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: usersError.message },
        { status: 500 }
      )
    }

    if (!users || users.length === 0) {
      console.log('[Cron] No users with email notifications enabled')
      return NextResponse.json({
        success: true,
        message: 'No users with email notifications enabled',
        sent: 0,
        date: tomorrowStr,
      })
    }

    console.log(`[Cron] Found ${users.length} users with notifications enabled`)

    // Za vsakega uporabnika preveri če ima odvoz jutri
    for (const userSettings of users) {
      const { user_id, em_okolis, bio_okolis } = userSettings

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

      // Pridobi email uporabnika iz auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user_id)

      if (authError || !authUser.user?.email) {
        console.error(`[Cron] Error fetching user email for ${user_id}:`, authError)
        errors.push(`Failed to get email for user ${user_id}`)
        continue
      }

      const email = authUser.user.email

      // Preveri če že ni bil poslan email za ta datum
      const { data: existingLog } = await supabase
        .from('notification_log')
        .select('id')
        .eq('user_id', user_id)
        .eq('collection_date', tomorrowStr)
        .single()

      if (existingLog) {
        console.log(`[Cron] Email already sent to ${email} for ${tomorrowStr}`)
        continue
      }

      // Pošlji email
      console.log(`[Cron] Sending email to ${email} for ${tomorrowStr}`)
      const emailResult = await sendCollectionReminder(
        email,
        collection.date,
        collection.types
      )

      if (emailResult.success) {
        // Zapiši v notification_log
        const { error: logError } = await supabase
          .from('notification_log')
          .insert({
            user_id,
            collection_date: tomorrowStr,
            waste_types: collection.types,
            sent_at: new Date().toISOString(),
          })

        if (logError) {
          console.error(`[Cron] Error logging notification for ${user_id}:`, logError)
        }

        results.push({
          userId: user_id,
          email,
          success: true,
          wasteTypes: collection.types,
        })
      } else {
        results.push({
          userId: user_id,
          email,
          success: false,
          error: emailResult.error,
        })
        errors.push(`Failed to send email to ${email}: ${emailResult.error}`)
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    console.log(`[Cron] Completed: ${successCount} sent, ${failCount} failed`)

    return NextResponse.json({
      success: true,
      date: tomorrowStr,
      sent: successCount,
      failed: failCount,
      results,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('[Cron] Unexpected error:', err)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
