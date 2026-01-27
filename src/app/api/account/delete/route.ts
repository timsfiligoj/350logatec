import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE() {
  try {
    // Get current user from session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Niste prijavljeni' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()

    // Soft delete: Mark user_settings as deleted (keep data for analytics)
    const { error: updateError } = await adminClient
      .from('user_settings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error soft-deleting user_settings:', updateError)
      return NextResponse.json(
        { error: 'Napaka pri brisanju nastavitev' },
        { status: 500 }
      )
    }

    // Sign out the current session first (clear cookies)
    await supabase.auth.signOut()

    // Delete the auth user (this will prevent login)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      return NextResponse.json(
        { error: 'Napaka pri brisanju računa' },
        { status: 500 }
      )
    }

    // Return success with cache-control to prevent caching
    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Prišlo je do napake' },
      { status: 500 }
    )
  }
}
