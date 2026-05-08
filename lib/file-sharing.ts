import crypto from 'crypto'

/**
 * Generate a unique share code in format "Share-[10 chars]"
 * Uses URL-safe characters: A-Z, a-z, 0-9, -, _
 */
export function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  let code = ''
  const randomBytes = crypto.randomBytes(8)
  
  for (let i = 0; i < 10; i++) {
    code += chars[randomBytes[i] % chars.length]
  }
  
  return `Share-${code}`
}

/**
 * Generate shareable URL for a file
 * Format: https://zonix.me/share/[code]
 */
export function generateShareUrl(shareCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zonix.me'
  return `${baseUrl}/share/${shareCode.replace('Share-', '')}`
}

/**
 * Parse share code from URL
 */
export function parseShareCode(code: string): string {
  if (code.startsWith('Share-')) return code
  return `Share-${code}`
}

/**
 * Generate short code from full share code (remove "Share-" prefix)
 */
export function getShortCode(fullShareCode: string): string {
  return fullShareCode.replace('Share-', '')
}

/**
 * Validate share code format
 */
export function isValidShareCode(code: string): boolean {
  const pattern = /^Share-[A-Za-z0-9\-_]{10}$/
  return pattern.test(code)
}
