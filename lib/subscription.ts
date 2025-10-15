import { createClient } from '@/lib/supabase/server'

export interface SubscriptionLimits {
  maxProjects: number | null // null = unlimited
  maxUpdatesPerDay: number | null // null = unlimited
  maxImagesPerUpdate: number
  canUseAI: boolean
  canUseAnalytics: boolean
  hasPremiumBadge: boolean
}

export const FREE_LIMITS: SubscriptionLimits = {
  maxProjects: 3,
  maxUpdatesPerDay: 5,
  maxImagesPerUpdate: 1,
  canUseAI: false,
  canUseAnalytics: false,
  hasPremiumBadge: false,
}

export const PRO_LIMITS: SubscriptionLimits = {
  maxProjects: null, // unlimited
  maxUpdatesPerDay: null, // unlimited
  maxImagesPerUpdate: 5,
  canUseAI: true,
  canUseAnalytics: true,
  hasPremiumBadge: true,
}

/**
 * Check if user has an active Pro subscription
 */
export async function isProUser(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, subscription_end_date')
    .eq('id', userId)
    .single()

  if (!data) return false

  const isPro = data.subscription_tier === 'pro' &&
                data.subscription_status === 'active' &&
                (!data.subscription_end_date || new Date(data.subscription_end_date) > new Date())

  return isPro
}

/**
 * Get user's subscription limits
 */
export async function getSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
  const isPro = await isProUser(userId)
  return isPro ? PRO_LIMITS : FREE_LIMITS
}

/**
 * Check if user can create a new project
 */
export async function canCreateProject(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const limits = await getSubscriptionLimits(userId)

  // Pro users have unlimited projects
  if (limits.maxProjects === null) {
    return { allowed: true }
  }

  // Check current project count
  const supabase = await createClient()
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  if ((count || 0) >= limits.maxProjects) {
    return {
      allowed: false,
      reason: `Free users can only have ${limits.maxProjects} projects. Upgrade to Pro for unlimited projects!`
    }
  }

  return { allowed: true }
}

/**
 * Check if user can create a new update today
 */
export async function canCreateUpdate(userId: string): Promise<{ allowed: boolean; reason?: string; count?: number }> {
  const limits = await getSubscriptionLimits(userId)

  // Pro users have unlimited updates
  if (limits.maxUpdatesPerDay === null) {
    return { allowed: true }
  }

  // Check today's update count
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { count } = await supabase
    .from('updates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)

  const todayCount = count || 0

  if (todayCount >= limits.maxUpdatesPerDay) {
    return {
      allowed: false,
      reason: `Free users can post ${limits.maxUpdatesPerDay} updates per day. You've reached your limit. Upgrade to Pro for unlimited updates!`,
      count: todayCount
    }
  }

  return { allowed: true, count: todayCount }
}

/**
 * Get user's project count
 */
export async function getProjectCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  return count || 0
}

/**
 * Get user's update count for today
 */
export async function getTodayUpdateCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { count } = await supabase
    .from('updates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)

  return count || 0
}
