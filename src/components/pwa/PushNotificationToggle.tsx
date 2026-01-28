'use client'

import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Bell, BellOff, Loader2, AlertTriangle, Smartphone } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface PushNotificationToggleProps {
  onSubscriptionChange?: (isSubscribed: boolean) => void
}

export function PushNotificationToggle({ onSubscriptionChange }: PushNotificationToggleProps) {
  const { permission, isSubscribed, loading, error, subscribe, unsubscribe } = usePushNotifications()

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches

  const handleToggle = async () => {
    let success: boolean
    if (isSubscribed) {
      success = await unsubscribe()
    } else {
      success = await subscribe()
    }
    if (success) {
      onSubscriptionChange?.(!isSubscribed)
    }
  }

  if (permission === 'unsupported') {
    return (
      <div className="flex items-center justify-between opacity-50">
        <div className="space-y-0.5">
          <Label>Push obvestila</Label>
          <p className="text-sm text-muted-foreground">Vaš brskalnik ne podpira push obvestil</p>
        </div>
        <BellOff className="h-5 w-5 text-muted-foreground" />
      </div>
    )
  }

  // iOS needs to be installed as PWA
  if (isIOS && !isStandalone) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push obvestila</Label>
            <p className="text-sm text-muted-foreground">Na iOS je potrebna namestitev aplikacije</p>
          </div>
          <Smartphone className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
          <p className="font-medium mb-1">Kako namestiti na iOS:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Tapnite ikono za deljenje (
              <svg className="inline-block w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              )
            </li>
            <li>Izberite &quot;Dodaj na začetni zaslon&quot;</li>
            <li>Odprite aplikacijo in omogočite obvestila</li>
          </ol>
        </div>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Push obvestila</Label>
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Obvestila so blokirana v nastavitvah brskalnika
          </p>
        </div>
        <BellOff className="h-5 w-5 text-red-500" />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="push-notifications">Push obvestila</Label>
          <p className="text-sm text-muted-foreground">Prejemajte obvestila neposredno na napravo</p>
        </div>
        <button
          id="push-notifications"
          onClick={handleToggle}
          disabled={loading}
          role="switch"
          aria-checked={isSubscribed}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isSubscribed ? 'bg-primary' : 'bg-gray-300'}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mx-auto text-white" />
          ) : (
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm
                ${isSubscribed ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          )}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
