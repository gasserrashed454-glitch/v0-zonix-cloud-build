// Zonix Cloud Configuration
// Centralized configuration for support email, branding, and environment-specific settings

export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@zonix.me'
export const MAIN_ADMIN_EMAIL = process.env.NEXT_PUBLIC_MAIN_ADMIN_EMAIL || 'admin@zonix.me'
export const COMPANY_NAME = 'Zonix Cloud'
export const COMPANY_DOMAIN = process.env.NEXT_PUBLIC_COMPANY_DOMAIN || 'zonix.me'

export const config = {
  // Email Configuration
  support: {
    email: SUPPORT_EMAIL,
    displayName: 'Zonix Support',
  },
  admin: {
    email: MAIN_ADMIN_EMAIL,
    displayName: 'Zonix Admin',
  },
  
  // Company Information
  company: {
    name: COMPANY_NAME,
    domain: COMPANY_DOMAIN,
    website: `https://${COMPANY_DOMAIN}`,
  },

  // Feature Flags
  features: {
    twoFactorAuth: true,
    socialAuth: true,
    fileSharing: true,
    vpsIntegration: true,
  },

  // API Configuration
  api: {
    timeout: 30000,
    retries: 3,
  },

  // File Configuration
  files: {
    maxSize: 5 * 1024 * 1024 * 1024, // 5GB
    maxUploadChunks: 100,
  },

  // Storage Configuration
  storage: {
    vpsTimeout: 10000,
    healthCheckInterval: 60000,
  },
}

export default config
