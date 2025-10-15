import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { update_id } = await request.json()

  // Check if already liked
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('update_id', update_id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Delete notification
    await supabase
      .from('notifications')
      .delete()
      .eq('type', 'like')
      .eq('update_id', update_id)
      .eq('actor_id', user.id)

    return NextResponse.json({ liked: false })
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert({ update_id, user_id: user.id })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get update owner
    const { data: update } = await supabase
      .from('updates')
      .select('user_id')
      .eq('id', update_id)
      .single()

    // Create notification (if not liking own update)
    if (update && update.user_id !== user.id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: update.user_id,
          actor_id: user.id,
          type: 'like',
          update_id: update_id
        })
    }

    return NextResponse.json({ liked: true })
  }
}
