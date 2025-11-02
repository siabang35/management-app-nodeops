/**
 * JWT Utility Functions
 * Untuk decode dan validasi JWT token dari backend API
 */

export interface JWTPayload {
  sub: string // user id
  email: string
  role: string
  iat?: number
  exp?: number
}

/**
 * Decode JWT token tanpa verifikasi signature
 * Hanya untuk membaca payload
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const payload = parts[1]
    const decoded = Buffer.from(payload, 'base64').toString('utf-8')
    return JSON.parse(decoded) as JWTPayload
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

/**
 * Cek apakah JWT token sudah expired
 */
export function isJWTExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) {
    return true
  }

  const now = Math.floor(Date.now() / 1000)
  return payload.exp < now
}

/**
 * Validasi JWT token
 */
export function validateJWT(token: string): { valid: boolean; payload?: JWTPayload } {
  if (!token) {
    return { valid: false }
  }

  const payload = decodeJWT(token)
  if (!payload) {
    return { valid: false }
  }

  if (isJWTExpired(token)) {
    return { valid: false }
  }

  return { valid: true, payload }

}

