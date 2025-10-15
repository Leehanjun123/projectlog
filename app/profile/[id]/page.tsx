import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FollowButton } from '@/components/follow-button'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, subscription_tier, subscription_status')
    .eq('id', id)
    .single()

  if (!profile) {
    redirect('/dashboard')
  }

  // Get user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  // Get user's public updates
  const { data: updates } = await supabase
    .from('updates')
    .select(`
      *,
      project:projects(id, title)
    `)
    .eq('user_id', id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get stats
  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id)
    .eq('is_public', true)

  const { count: updateCount } = await supabase
    .from('updates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', id)
    .eq('is_public', true)

  const { count: followerCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', id)

  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', id)

  // Check if current user is following this profile
  const { data: followData } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', id)
    .single()

  const isOwnProfile = user.id === id
  const isFollowing = !!followData

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/feed">
            <Button variant="ghost">← Back to Feed</Button>
          </Link>
        </div>

        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-4xl font-bold">
                {profile.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold">{profile.display_name || 'Anonymous Builder'}</h1>
                      {profile.subscription_tier === 'pro' && profile.subscription_status === 'active' && (
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold rounded-full">
                          ⭐ PRO
                        </span>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="text-gray-600 mt-2">{profile.bio}</p>
                    )}
                  </div>
                  {isOwnProfile ? (
                    <Link href="/settings">
                      <Button variant="outline">Edit Profile</Button>
                    </Link>
                  ) : (
                    <FollowButton profileId={id} initialFollowing={isFollowing} />
                  )}
                </div>

                <div className="grid grid-cols-4 gap-6 mt-6">
                  <div>
                    <p className="text-2xl font-bold">{projectCount || 0}</p>
                    <p className="text-sm text-gray-600">Projects</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{updateCount || 0}</p>
                    <p className="text-sm text-gray-600">Updates</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{followerCount || 0}</p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{followingCount || 0}</p>
                    <p className="text-sm text-gray-600">Following</p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Projects */}
        {projects && projects.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <h3 className="font-semibold text-lg">{project.title}</h3>
                      {project.description && (
                        <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                      )}
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : project.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            {updates && updates.length > 0 ? (
              <div className="space-y-6">
                {updates.map((update) => (
                  <div key={update.id} className="border-l-4 border-purple-200 pl-6 pb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <Link href={`/projects/${update.project?.id}`}>
                          <span className="font-semibold text-purple-600 hover:underline cursor-pointer">
                            {update.project?.title}
                          </span>
                        </Link>
                        {update.day_number && (
                          <span className="text-sm text-gray-500">Day {update.day_number}</span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(update.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700">{update.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No public updates yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
