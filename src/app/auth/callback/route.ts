import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && authData.user) {
      // Check if user has completed onboarding (has user_settings with em_okolis set)
      const { data: settings } = await supabase
        .from('user_settings')
        .select('em_okolis')
        .eq('user_id', authData.user.id)
        .single()

      // Determine redirect destination
      const needsOnboarding = !settings || settings.em_okolis === null
      const redirectPath = needsOnboarding ? '/onboarding' : '/odvoz'

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`)
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}
