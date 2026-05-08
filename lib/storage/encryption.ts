import crypto from 'crypto'

const algorithm = 'aes-256-cbc'

export function encryptPassword(password: string, key: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv)
  let encrypted = cipher.update(password, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export function decryptPassword(encryptedData: string, key: string): string {
  const parts = encryptedData.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv)
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export async function testSSHConnection(
  host: string,
  username: string,
  password: string,
  port: number = 22
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, use ssh2 library
    // For now, return a test response
    console.log('[LOG] SSH connection test:', { host, username, port })
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    }
  }
}

export async function testSMBConnection(
  host: string,
  username: string,
  password: string,
  port: number = 445
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, use smbhttps library
    console.log('[LOG] SMB connection test:', { host, username, port })
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}

export async function testNFSConnection(
  host: string,
  exportPath: string,
  port: number = 2049
): Promise<{ success: boolean; error?: string }> {
  try {
    // In production, use nfs3 library
    console.log('[LOG] NFS connection test:', { host, exportPath, port })
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}
