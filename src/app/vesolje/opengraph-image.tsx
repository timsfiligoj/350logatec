import { ImageResponse } from 'next/og'
import { getLatestForView } from '@/lib/space/db'

// Dynamic OG / social-share banner for /vesolje and all its sub-routes.
// 1200x630 is the universally-accepted landscape size for Facebook,
// Twitter, LinkedIn, and Slack unfurls. We compose a magazine-style
// layout: title block on the left, latest true-color satellite scene
// cropped to the right side so the share preview always looks like a
// fresh aerial photo of Logatec.

export const runtime = 'nodejs'
export const alt = 'Logatec iz vesolja — satelitski pogled na občino'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const latest = await getLatestForView('true_color').catch(() => null)

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#f8fafc',
        }}
      >
        <div
          style={{
            display: 'flex',
            flex: 1,
            padding: '60px 56px',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#059669',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: 18,
              fontWeight: 600,
            }}
          >
            350logatec
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 82,
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1,
              marginBottom: 28,
              letterSpacing: '-0.02em',
            }}
          >
            Logatec iz vesolja
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              color: '#475569',
              lineHeight: 1.35,
              maxWidth: 540,
            }}
          >
            Štiri zgodbe o občini skozi odprte podatke evropskih satelitov
            Sentinel-2.
          </div>
        </div>
        {latest?.public_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={latest.public_url}
            width={460}
            height={630}
            alt=""
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              width: 460,
              height: '100%',
              backgroundColor: '#ecfdf5',
            }}
          />
        )}
      </div>
    ),
    size,
  )
}
