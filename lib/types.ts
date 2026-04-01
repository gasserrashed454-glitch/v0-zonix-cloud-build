export type UserTier = 'free' | 'student' | 'premium' | 'enterprise'
export type UserRole = 'user' | 'support' | 'mod' | 'admin'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  tier: UserTier
  role: UserRole
  storage_used: number
  storage_limit: number
  upload_limit: number
  ai_uses_today: number
  ai_daily_limit: number
  ai_last_reset: string
  student_verified: boolean
  student_school: string | null
  student_verified_at: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface Folder {
  id: string
  user_id: string
  name: string
  parent_id: string | null
  path: string
  created_at: string
  updated_at: string
}

export interface File {
  id: string
  user_id: string
  folder_id: string | null
  name: string
  size: number
  mime_type: string | null
  blob_url: string
  blob_pathname: string
  thumbnail_url: string | null
  is_favorite: boolean
  is_trashed: boolean
  trashed_at: string | null
  created_at: string
  updated_at: string
}

export interface SharedFile {
  id: string
  file_id: string
  shared_by: string
  shared_with: string | null
  shared_link: string | null
  can_edit: boolean
  expires_at: string | null
  created_at: string
}

export interface Ticket {
  id: string
  user_id: string
  assigned_to: string | null
  subject: string
  description: string
  status: TicketStatus
  priority: number
  created_at: string
  updated_at: string
  user?: Profile
  assignee?: Profile
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  is_internal: boolean
  created_at: string
  sender?: Profile
}

export interface Invoice {
  id: string
  user_id: string
  stripe_invoice_id: string | null
  amount: number
  currency: string
  status: string
  paid_at: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  location: string | null
  created_at: string
}

export interface VerificationCode {
  id: string
  email: string
  code: string
  type: string
  expires_at: string
  verified: boolean
  created_at: string
}

export interface StorageSettings {
  id: string
  azure_connection_string: string | null
  azure_container_name: string | null
  use_azure: boolean
  updated_by: string | null
  updated_at: string
}

// Tier configurations
export const TIER_CONFIG: Record<UserTier, {
  name: string
  price: number | null
  storage_limit: number
  upload_limit: number
  ai_daily_limit: number
  features: string[]
}> = {
  free: {
    name: 'Free',
    price: 0,
    storage_limit: 5 * 1024 * 1024 * 1024, // 5 GB
    upload_limit: 2 * 1024 * 1024 * 1024, // 2 GB
    ai_daily_limit: 50,
    features: [
      '5 GB storage',
      '2 GB upload limit',
      'AI Assistant (50 uses/day)',
      'File sharing',
    ],
  },
  student: {
    name: 'Student',
    price: 0,
    storage_limit: 50 * 1024 * 1024 * 1024, // 50 GB
    upload_limit: 20 * 1024 * 1024 * 1024, // 20 GB
    ai_daily_limit: 200,
    features: [
      '50 GB storage',
      '20 GB upload limit',
      'AI Assistant (200 uses/day)',
      'AI File Organization',
      'Priority support',
    ],
  },
  premium: {
    name: 'Premium',
    price: 4.99,
    storage_limit: 100 * 1024 * 1024 * 1024, // 100 GB
    upload_limit: 50 * 1024 * 1024 * 1024, // 50 GB
    ai_daily_limit: 500,
    features: [
      '100 GB storage',
      '50 GB upload limit',
      'Unlimited AI Assistant',
      'AI File Organization',
      'Advanced AI Tasks',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: null,
    storage_limit: 1024 * 1024 * 1024 * 1024, // 1 TB
    upload_limit: 100 * 1024 * 1024 * 1024, // 100 GB
    ai_daily_limit: 99999,
    features: [
      'Custom storage',
      'Custom upload limits',
      'Unlimited AI features',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
}

// Helper functions
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function getFileIcon(mimeType: string | null): string {
  if (!mimeType) return 'file'
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc'
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet'
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive'
  if (mimeType.includes('text')) return 'text'
  return 'file'
}
