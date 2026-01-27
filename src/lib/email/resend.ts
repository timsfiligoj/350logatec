import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface WasteTypeInfo {
  type: string
  name: string
  color: string
}

const wasteTypeMap: Record<string, WasteTypeInfo> = {
  'E': { type: 'E', name: 'Embalaža', color: '#3b82f6' },
  'M': { type: 'M', name: 'Mešani odpadki', color: '#6b7280' },
  'B': { type: 'B', name: 'Biološki odpadki', color: '#22c55e' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const days = ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota']
  const months = [
    'januar', 'februar', 'marec', 'april', 'maj', 'junij',
    'julij', 'avgust', 'september', 'oktober', 'november', 'december'
  ]

  const dayName = days[date.getDay()]
  const dayNum = date.getDate()
  const monthName = months[date.getMonth()]
  const year = date.getFullYear()

  return `${dayName}, ${dayNum}. ${monthName} ${year}`
}

function generateEmailHtml(date: string, wasteTypes: string[]): string {
  const formattedDate = formatDate(date)

  const wasteTypesHtml = wasteTypes
    .map(type => {
      const info = wasteTypeMap[type]
      if (!info) return ''
      return `
        <tr>
          <td style="padding: 8px 0;">
            <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background-color: ${info.color}; margin-right: 12px; vertical-align: middle;"></span>
            <span style="font-size: 16px; color: #374151;">${info.name}</span>
          </td>
        </tr>
      `
    })
    .join('')

  return `
<!DOCTYPE html>
<html lang="sl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spomin: Jutri je odvoz odpadkov</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
              <div style="display: inline-block; width: 48px; height: 48px; background-color: #ecfdf5; border-radius: 12px; line-height: 48px; font-size: 24px;">
                🗑️
              </div>
              <h1 style="margin: 16px 0 0 0; font-size: 24px; font-weight: 700; color: #111827;">
                Spomin: Jutri je odvoz odpadkov
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; line-height: 1.5;">
                Ne pozabite pripraviti zabojnike za jutri!
              </p>

              <!-- Date -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                  Datum odvoza
                </p>
                <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 600; color: #111827;">
                  ${formattedDate}
                </p>
              </div>

              <!-- Waste Types -->
              <div style="margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                  Tipi odpadkov
                </p>
                <table role="presentation" style="width: 100%;">
                  ${wasteTypesHtml}
                </table>
              </div>

              <!-- Reminder -->
              <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>Opomnik:</strong> Prosimo, pripravite zabojnike do 6:00 zjutraj.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                350logatec - Pametne rešitve za Logatec
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                Prejeli ste to sporočilo, ker ste omogočili email obvestila.
              </p>
              <p style="margin: 12px 0 0 0;">
                <a href="https://www.350logatec.si/nastavitve" style="font-size: 12px; color: #6b7280; text-decoration: underline;">
                  Uredi nastavitve
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export async function sendCollectionReminder(
  to: string,
  date: string,
  wasteTypes: string[]
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const html = generateEmailHtml(date, wasteTypes)

    const { data, error } = await resend.emails.send({
      from: '350logatec <onboarding@resend.dev>',
      to: [to],
      subject: 'Jutri je odvoz odpadkov - 350logatec',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Email send error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}
