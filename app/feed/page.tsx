import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UpdateCard } from '@/components/update-card'
import Link from 'next/link'

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get public updates from all users with likes
  const { data: updates } = await supabase
    .from('updates')
    .select(`
      *,
      project:projects(id, title, user_id),
      profile:profiles!updates_user_id_fkey(display_name, avatar_url),
      likes(user_id)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Community Feed
            </h1>
            <p className="text-gray-600 mt-2">
              See what other builders are working on
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/search">
              <Button variant="outline">🔍 Search</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">My Dashboard</Button>
            </Link>
          </div>
        </div>

        {updates && updates.length > 0 ? (
          <div className="space-y-6">
            {updates.map((update) => (
              <UpdateCard key={update.id} update={update} currentUserId={user.id} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No public updates yet</p>
              <p className="text-sm text-gray-400">
                Be the first to share your progress with the community!
              </p>
              <Link href="/dashboard">
                <Button className="mt-4">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
