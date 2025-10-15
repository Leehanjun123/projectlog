import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { following_id } = await request.json()

  if (user.id === following_id) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
  }

  // Check if already following
  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', following_id)
    .single()

  if (existing) {
    // Unfollow
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Delete notification
    await supabase
      .from('notifications')
      .delete()
      .eq('type', 'follow')
      .eq('user_id', following_id)
      .eq('actor_id', user.id)

    return NextResponse.json({ following: false })
  } else {
    // Follow
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: following_id,
        actor_id: user.id,
        type: 'follow'
      })

    return NextResponse.json({ following: true })
  }
}
