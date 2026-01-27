import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { Navbar } from '@/components/layout/Navbar'

export const metadata = {
  title: 'Prijava | 350logatec',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-12">
        <Suspense fallback={<div>Nalaganje...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
