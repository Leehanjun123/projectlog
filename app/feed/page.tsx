import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UpdateCard } from '@/components/update-card'
import { Navbar } from '@/components/navbar'
import { FeedFilters } from '@/components/feed-filters'

export default async function FeedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get public updates from all users with likes and new specialized fields
  const { data: updates } = await supabase
    .from('updates')
    .select(`
      *,
      project:projects(id, title, user_id, category, stage),
      profile:profiles!updates_user_id_fkey(display_name, avatar_url, subscription_tier, subscription_status),
      likes(user_id)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        {/* Hero Section - Instagram Story Style */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                  🌟 Community Feed
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  {updates?.length || 0} builders sharing their journey
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Filters (Instagram style) */}
            <div className="lg:col-span-1">
              <FeedFilters />
            </div>

            {/* Main Feed - Twitter/Instagram hybrid */}
            <div className="lg:col-span-3">
              {updates && updates.length > 0 ? (
                <div className="space-y-4">
                  {updates.map((update) => (
                    <UpdateCard key={update.id} update={update} currentUserId={user.id} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <div className="text-6xl mb-4">👋</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No updates yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to share your journey with the community!
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-200"
                  >
                    ✨ Start Building
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
