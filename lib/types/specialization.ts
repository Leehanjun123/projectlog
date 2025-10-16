// ========================================
// PROJECT SPECIALIZATION TYPES
// ========================================

export type ProjectCategory =
  | 'saas'
  | 'mobile_app'
  | 'web_app'
  | 'api'
  | 'tool'
  | 'content'
  | 'ecommerce'
  | 'marketplace'
  | 'chrome_extension'
  | 'other'

export type ProjectStage =
  | 'idea'
  | 'planning'
  | 'building'
  | 'beta'
  | 'launched'
  | 'growing'
  | 'profitable'
  | 'acquired'
  | 'shutdown'

export type UpdateType =
  | 'log'
  | 'milestone'
  | 'launch'
  | 'feature'
  | 'challenge'
  | 'learning'
  | 'metrics'
  | 'announcement'

export type MilestoneType =
  | 'first_user'
  | 'first_paying_user'
  | 'first_dollar'
  | 'first_hundred'
  | 'first_thousand'
  | 'launch'
  | 'custom'

// ========================================
// DISPLAY LABELS
// ========================================

export const PROJECT_CATEGORIES: Record<ProjectCategory, { label: string; icon: string; description: string }> = {
  saas: {
    label: 'SaaS',
    icon: '💼',
    description: 'Software as a Service'
  },
  mobile_app: {
    label: 'Mobile App',
    icon: '📱',
    description: 'iOS/Android Application'
  },
  web_app: {
    label: 'Web App',
    icon: '🌐',
    description: 'Web Application'
  },
  api: {
    label: 'API',
    icon: '🔌',
    description: 'API/Backend Service'
  },
  tool: {
    label: 'Tool',
    icon: '🛠️',
    description: 'Developer Tool'
  },
  content: {
    label: 'Content',
    icon: '📝',
    description: 'Content/Media'
  },
  ecommerce: {
    label: 'E-commerce',
    icon: '🛒',
    description: 'Online Store'
  },
  marketplace: {
    label: 'Marketplace',
    icon: '🏪',
    description: 'Two-sided Marketplace'
  },
  chrome_extension: {
    label: 'Browser Extension',
    icon: '🧩',
    description: 'Chrome/Browser Extension'
  },
  other: {
    label: 'Other',
    icon: '✨',
    description: 'Other Type'
  }
}

export const PROJECT_STAGES: Record<ProjectStage, { label: string; icon: string; color: string }> = {
  idea: {
    label: 'Idea',
    icon: '💡',
    color: 'bg-gray-100 text-gray-700'
  },
  planning: {
    label: 'Planning',
    icon: '📋',
    color: 'bg-blue-100 text-blue-700'
  },
  building: {
    label: 'Building',
    icon: '🔨',
    color: 'bg-yellow-100 text-yellow-700'
  },
  beta: {
    label: 'Beta',
    icon: '🧪',
    color: 'bg-purple-100 text-purple-700'
  },
  launched: {
    label: 'Launched',
    icon: '🚀',
    color: 'bg-green-100 text-green-700'
  },
  growing: {
    label: 'Growing',
    icon: '📈',
    color: 'bg-teal-100 text-teal-700'
  },
  profitable: {
    label: 'Profitable',
    icon: '💰',
    color: 'bg-emerald-100 text-emerald-700'
  },
  acquired: {
    label: 'Acquired',
    icon: '🏆',
    color: 'bg-pink-100 text-pink-700'
  },
  shutdown: {
    label: 'Shutdown',
    icon: '🔴',
    color: 'bg-red-100 text-red-700'
  }
}

export const UPDATE_TYPES: Record<UpdateType, { label: string; icon: string; color: string }> = {
  log: {
    label: 'Daily Log',
    icon: '📝',
    color: 'bg-gray-100 text-gray-700'
  },
  milestone: {
    label: 'Milestone',
    icon: '🎯',
    color: 'bg-purple-100 text-purple-700'
  },
  launch: {
    label: 'Launch',
    icon: '🚀',
    color: 'bg-green-100 text-green-700'
  },
  feature: {
    label: 'New Feature',
    icon: '✨',
    color: 'bg-blue-100 text-blue-700'
  },
  challenge: {
    label: 'Challenge',
    icon: '⚠️',
    color: 'bg-orange-100 text-orange-700'
  },
  learning: {
    label: 'Learning',
    icon: '💡',
    color: 'bg-yellow-100 text-yellow-700'
  },
  metrics: {
    label: 'Metrics',
    icon: '📊',
    color: 'bg-teal-100 text-teal-700'
  },
  announcement: {
    label: 'Announcement',
    icon: '📢',
    color: 'bg-pink-100 text-pink-700'
  }
}

export const MILESTONE_TYPES: Record<MilestoneType, { label: string; icon: string }> = {
  first_user: {
    label: 'First User',
    icon: '👤'
  },
  first_paying_user: {
    label: 'First Paying Customer',
    icon: '💳'
  },
  first_dollar: {
    label: 'First Dollar Earned',
    icon: '💵'
  },
  first_hundred: {
    label: 'First $100 MRR',
    icon: '💰'
  },
  first_thousand: {
    label: 'First $1000 MRR',
    icon: '🎉'
  },
  launch: {
    label: 'Product Launch',
    icon: '🚀'
  },
  custom: {
    label: 'Custom Milestone',
    icon: '🎯'
  }
}

// ========================================
// DATABASE TYPES
// ========================================

export interface ProjectMetrics {
  id: string
  project_id: string
  user_id: string
  mrr: number // in cents
  revenue: number // in cents
  total_users: number
  active_users: number
  paying_users: number
  user_growth_rate: number | null
  revenue_growth_rate: number | null
  custom_metrics: Record<string, any>
  recorded_at: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
  usage_count: number
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  project_id: string
  user_id: string
  title: string
  description: string | null
  milestone_type: MilestoneType
  achieved_at: string
  created_at: string
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cents / 100)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function formatGrowthRate(rate: number | null): string {
  if (rate === null) return 'N/A'
  const sign = rate >= 0 ? '+' : ''
  return `${sign}${rate.toFixed(1)}%`
}
