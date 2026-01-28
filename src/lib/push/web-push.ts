import webpush from 'web-push'

interface PushPayload {
  title: string
  body: string
  tag?: string
  url?: string
}

interface PushSubscriptionData {
  endpoint: string
  p256dh: string
  auth: string
}

function getVapidKeys() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:tim@350life.com'

  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys not configured')
  }

  return { publicKey, privateKey, subject }
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload
): Promise<{ success: boolean; error?: string; expired?: boolean }> {
  const { publicKey, privateKey, subject } = getVapidKeys()

  webpush.setVapidDetails(subject, publicKey, privateKey)

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    )
    return { success: true }
  } catch (error) {
    const err = error as { statusCode?: number; message?: string }

    // 410 Gone or 404 means subscription is no longer valid
    if (err.statusCode === 410 || err.statusCode === 404) {
      return { success: false, error: 'subscription_expired', expired: true }
    }

    console.error('Push notification error:', err.message || err)
    return { success: false, error: err.message || 'Unknown error' }
  }
}

export function getVapidPublicKey(): string {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!publicKey) {
    throw new Error('VAPID public key not configured')
  }
  return publicKey
}
