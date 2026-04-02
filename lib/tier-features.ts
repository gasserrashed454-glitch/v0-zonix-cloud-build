export const TIER_FEATURES = {
  free: {
    name: 'Free',
    storage: '5 GB',
    storageBytes: 5 * 1024 * 1024 * 1024,
    uploadLimit: '2 GB',
    uploadLimitBytes: 2 * 1024 * 1024 * 1024,
    price: '$0/month',
    features: [
      'Basic file storage and organization',
      '5 GB total storage',
      '2 GB maximum file size',
      '50 AI daily queries',
      'File sharing with up to 5 people',
      'Basic file preview',
      'Standard support',
    ],
    ai: {
      dailyLimit: 50,
      features: ['File info lookup', 'Storage summary', 'Basic organization hints'],
    },
  },
  student: {
    name: 'Student',
    storage: '50 GB',
    storageBytes: 50 * 1024 * 1024 * 1024,
    uploadLimit: '20 GB',
    uploadLimitBytes: 20 * 1024 * 1024 * 1024,
    price: 'Free (with verification)',
    features: [
      'Verified student discount',
      '50 GB total storage',
      '20 GB maximum file size',
      'Unlimited AI queries',
      'Unlimited file sharing',
      'Advanced file organization',
      'Priority support',
      'Collaboration tools',
    ],
    ai: {
      dailyLimit: null, // unlimited
      features: [
        'File info lookup',
        'Advanced organization',
        'File analysis',
        'Smart tagging',
        'Content search',
      ],
    },
  },
  premium: {
    name: 'Premium',
    storage: '100 GB',
    storageBytes: 100 * 1024 * 1024 * 1024,
    uploadLimit: '50 GB',
    uploadLimitBytes: 50 * 1024 * 1024 * 1024,
    price: '$4.99/month',
    features: [
      'Maximum personal storage',
      '100 GB total storage',
      '50 GB maximum file size',
      'Unlimited AI queries',
      'Unlimited file sharing',
      'Advanced file organization',
      'Priority support',
      'Collaboration tools',
      'Version history',
      'Advanced security',
    ],
    ai: {
      dailyLimit: null, // unlimited
      features: [
        'All student features',
        'Advanced analytics',
        'Duplicate detection',
        'Smart recommendations',
      ],
    },
  },
  enterprise: {
    name: 'Enterprise',
    storage: 'Custom',
    storageBytes: Infinity,
    uploadLimit: 'Custom',
    uploadLimitBytes: Infinity,
    price: 'Contact Sales',
    features: [
      'Custom storage solutions',
      'Unlimited file size',
      'Unlimited AI queries',
      'Custom integrations',
      'Dedicated support team',
      'Admin controls & audit logs',
      'SSO & advanced security',
      'SLA guarantees',
      'Custom workflows',
    ],
    ai: {
      dailyLimit: null,
      features: ['All premium features', 'Custom AI models', 'Advanced integrations'],
    },
  },
}

export function getTierDescription(tier: string): string {
  const tierData = TIER_FEATURES[tier as keyof typeof TIER_FEATURES]
  if (!tierData) return 'Unknown tier'
  
  return `${tierData.name} Plan: ${tierData.storage} storage, ${tierData.uploadLimit} max file size, ${
    tierData.ai.dailyLimit ? tierData.ai.dailyLimit + ' AI queries/day' : 'Unlimited AI queries'
  }. Features: ${tierData.features.slice(0, 3).join(', ')}...`
}
