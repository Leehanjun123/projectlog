import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const update_id = searchParams.get('update_id')

  if (!update_id) {
    return NextResponse.json({ error: 'update_id required' }, { status: 400 })
  }

  const { data: comments } = await supabase
    .from('comments')
    .select(`
      *,
      profile:profiles!comments_user_id_fkey(display_name, avatar_url)
    `)
    .eq('update_id', update_id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ comments })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { update_id, content } = await request.json()

  if (!content || content.trim() === '') {
    return NextResponse.json({ error: 'Content required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      update_id,
      user_id: user.id,
      content: content.trim()
    })
    .select(`
      *,
      profile:profiles!comments_user_id_fkey(display_name, avatar_url)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get update owner
  const { data: update } = await supabase
    .from('updates')
    .select('user_id')
    .eq('id', update_id)
    .single()

  // Create notification (if not commenting on own update)
  if (update && update.user_id !== user.id) {
    await supabase
      .from('notifications')
      .insert({
        user_id: update.user_id,
        actor_id: user.id,
        type: 'comment',
        update_id: update_id,
        comment_id: data.id
      })
  }

  return NextResponse.json({ comment: data })
}
