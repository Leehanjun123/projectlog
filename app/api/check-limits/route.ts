import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { canCreateProject, canCreateUpdate, getProjectCount, getTodayUpdateCount, getSubscriptionLimits } from '@/lib/subscription'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'project' or 'update'

    if (type === 'project') {
      const { allowed, reason } = await canCreateProject(user.id)
      const projectCount = await getProjectCount(user.id)
      const limits = await getSubscriptionLimits(user.id)

      return NextResponse.json({
        allowed,
        reason,
        current: projectCount,
        limit: limits.maxProjects,
      })
    } else if (type === 'update') {
      const { allowed, reason, count } = await canCreateUpdate(user.id)
      const limits = await getSubscriptionLimits(user.id)

      return NextResponse.json({
        allowed,
        reason,
        current: count,
        limit: limits.maxUpdatesPerDay,
      })
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })

  } catch (error: any) {
    console.error('Check limits error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to check limits'
    }, { status: 500 })
  }
}
