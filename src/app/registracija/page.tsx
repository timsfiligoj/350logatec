import { RegisterForm } from '@/components/auth/RegisterForm'
import { Navbar } from '@/components/layout/Navbar'

export const metadata = {
  title: 'Registracija | 350logatec',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-12">
        <RegisterForm />
      </div>
    </div>
  )
}
