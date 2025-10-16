import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InstagramUpdateCard } from '@/components/instagram-update-card'
import { Navbar } from '@/components/navbar'
import { FeedFilters } from '@/components/feed-filters'

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Extract filter parameters
  const updateType = params.update_type as string | undefined
  const category = params.category as string | undefined
  const stage = params.stage as string | undefined
  const tag = params.tag as string | undefined

  // Build query with filters
  let query = supabase
    .from('updates')
    .select(`
      *,
      project:projects(id, title, user_id, category, stage),
      profile:profiles!updates_user_id_fkey(display_name, avatar_url, subscription_tier, subscription_status),
      likes(user_id)
    `)
    .eq('is_public', true)

  // Apply update type filter
  if (updateType) {
    query = query.eq('update_type', updateType)
  }

  // Apply tag filter
  if (tag) {
    query = query.contains('tags', [tag])
  }

  const { data: allUpdates } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  // Client-side filtering for category and stage (since they're in related table)
  let updates = allUpdates || []

  if (category) {
    updates = updates.filter((update: any) => update.project?.category === category)
  }

  if (stage) {
    updates = updates.filter((update: any) => update.project?.stage === stage)
  }

  return (
    <>
      <Navbar />
      {/* Instagram-style layout */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-[935px] mx-auto pt-8 px-4">
          <div className="flex gap-8">
            {/* Main Feed - Instagram center column */}
            <div className="flex-1 max-w-[614px]">
              {updates && updates.length > 0 ? (
                <div className="space-y-6">
                  {updates.map((update) => (
                    <InstagramUpdateCard key={update.id} update={update} currentUserId={user.id} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="text-6xl mb-4">📸</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No posts yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start sharing your journey with the community!
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Create Post
                  </a>
                </div>
              )}
            </div>

            {/* Right Sidebar - Instagram style */}
            <div className="hidden lg:block w-[320px]">
              <div className="sticky top-20">
                <FeedFilters />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
