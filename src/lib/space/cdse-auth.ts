// OAuth2 client_credentials helper for Copernicus Data Space Ecosystem (CDSE).
// Tokens are short-lived (~10 min); cached in module scope with a small safety
// margin so callers never receive a token within 30s of expiry.

const TOKEN_ENDPOINT =
  'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token'
const EXPIRY_SAFETY_MARGIN_MS = 30_000

type TokenResponse = {
  access_token: string
  expires_in: number
  token_type: 'Bearer'
}

type CachedToken = {
  accessToken: string
  expiresAt: number
}

let cached: CachedToken | null = null
let inflight: Promise<CachedToken> | null = null

function requireEnv(name: 'CDSE_CLIENT_ID' | 'CDSE_CLIENT_SECRET'): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See app/docs/space-env.md.`,
    )
  }
  return value
}

async function fetchNewToken(): Promise<CachedToken> {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: requireEnv('CDSE_CLIENT_ID'),
    client_secret: requireEnv('CDSE_CLIENT_SECRET'),
  })

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      `CDSE token request failed: ${response.status} ${response.statusText}${
        detail ? ` — ${detail}` : ''
      }`,
    )
  }

  const data = (await response.json()) as TokenResponse
  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - EXPIRY_SAFETY_MARGIN_MS,
  }
}

export async function getCdseAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now()) {
    return cached.accessToken
  }
  if (!inflight) {
    inflight = fetchNewToken()
      .then((token) => {
        cached = token
        return token
      })
      .finally(() => {
        inflight = null
      })
  }
  const token = await inflight
  return token.accessToken
}

// Exposed for tests / debug routes; do not call from production code paths.
export function __resetCdseTokenCacheForTesting(): void {
  cached = null
  inflight = null
}
