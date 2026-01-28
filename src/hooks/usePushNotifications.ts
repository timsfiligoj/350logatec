'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported'

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return buffer
}

export function usePushNotifications() {
  const { user } = useAuth()
  const [permission, setPermission] = useState<PermissionState>('prompt')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check support and permission on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermission('unsupported')
      return
    }

    setPermission(Notification.permission as PermissionState)

    // Check for existing subscription
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setSubscription(sub)
      })
    })
  }, [])

  const subscribe = useCallback(async () => {
    if (!user) {
      setError('Potrebna je prijava')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      // Request permission
      const perm = await Notification.requestPermission()
      setPermission(perm as PermissionState)

      if (perm !== 'granted') {
        setError('Dovoljenje za obvestila ni bilo podeljeno')
        setLoading(false)
        return false
      }

      // Get VAPID key
      const vapidRes = await fetch('/api/push/vapid')
      if (!vapidRes.ok) {
        throw new Error('Napaka pri pridobivanju VAPID ključa')
      }
      const { publicKey } = await vapidRes.json()

      // Wait for service worker with timeout
      const swReady = navigator.serviceWorker.ready
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Service worker ni na voljo')), 10000)
      )
      const registration = await Promise.race([swReady, timeout])

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      // Save to server
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Napaka pri shranjevanju naročnine')
      }

      setSubscription(sub)
      return true
    } catch (err) {
      console.error('Push subscribe error:', err)
      setError(err instanceof Error ? err.message : 'Neznana napaka')
      return false
    } finally {
      setLoading(false)
    }
  }, [user])

  const unsubscribe = useCallback(async () => {
    if (!subscription) return true

    setLoading(true)
    setError(null)

    try {
      const endpoint = subscription.endpoint
      await subscription.unsubscribe()

      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      })

      setSubscription(null)
      return true
    } catch (err) {
      console.error('Push unsubscribe error:', err)
      setError(err instanceof Error ? err.message : 'Neznana napaka')
      return false
    } finally {
      setLoading(false)
    }
  }, [subscription])

  return {
    permission,
    subscription,
    isSubscribed: !!subscription,
    loading,
    error,
    subscribe,
    unsubscribe,
  }
}
