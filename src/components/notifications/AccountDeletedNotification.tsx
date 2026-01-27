'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, X } from 'lucide-react'

export function AccountDeletedNotification() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get('deleted') === 'true') {
      setShow(true)
      // Remove the query param from URL
      router.replace('/', { scroll: false })
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])

  if (!show) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-lg rounded-lg px-4 py-3">
        <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
        <p className="text-sm font-medium text-gray-900">
          Vaš račun je bil uspešno izbrisan
        </p>
        <button
          onClick={() => setShow(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
