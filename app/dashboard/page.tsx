import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { getStreakEmoji } from '@/lib/streak'
import { StatCard } from '@/components/stat-card'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile with streak data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, current_streak, longest_streak, last_update_date, subscription_tier, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro = profile?.subscription_tier === 'pro' && profile?.subscription_status === 'active'

  // Get user's projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get recent updates
  const { data: recentUpdates } = await supabase
    .from('updates')
    .select('*, projects(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get project count
  const projectCount = projects?.length || 0

  // Get total updates count
  const { count: updatesCount } = await supabase
    .from('updates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const currentStreak = profile?.current_streak || 0
  const longestStreak = profile?.longest_streak || 0
  const streakEmoji = getStreakEmoji(currentStreak)

  // Check if updated today
  const today = new Date().toISOString().split('T')[0]
  const updatedToday = profile?.last_update_date === today

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Streak Banner */}
          {!updatedToday && currentStreak > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-lg animate-in slide-in-from-top duration-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-orange-900">
                  🔥 Don't break your streak! You have a {currentStreak}-day streak going!
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Post an update today to keep it alive
                </p>
              </div>
              <Link href="/projects/new">
                <Button variant="outline" className="bg-white">
                  Post Update
                </Button>
              </Link>
            </div>
          </div>
        )}

        {updatedToday && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-lg animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">{streakEmoji}</span>
              <div>
                <p className="font-semibold text-green-900">
                  Great job! You've posted today!
                </p>
                <p className="text-sm text-green-700">
                  Current streak: {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 animate-in fade-in slide-in-from-top duration-700">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
            Welcome back, {profile?.display_name || user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Here's what's happening with your projects
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            title="Projects"
            description="Your active projects"
            value={projectCount}
            icon={<span className="text-xl">📁</span>}
            delay={0}
          />

          <StatCard
            title="Updates"
            description="Total updates posted"
            value={updatesCount || 0}
            icon={<span className="text-xl">📝</span>}
            delay={100}
          />

          <StatCard
            title="Current Streak"
            description="Consecutive days"
            value={currentStreak}
            suffix={currentStreak === 1 ? ' day' : ' days'}
            icon={<span>{streakEmoji}</span>}
            className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50"
            delay={200}
          />

          <StatCard
            title="Followers"
            description="People following you"
            value={0}
            icon={<span className="text-xl">👥</span>}
            delay={300}
          />
        </div>

        {/* Pro Status Card for Pro users */}
        {isPro && (
          <Card className="mb-8 bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 animate-in fade-in slide-in-from-left duration-700 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⭐ Pro Member
              </CardTitle>
              <CardDescription>
                You have full access to all features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                <div>
                  <p className="font-semibold text-purple-900">Status</p>
                  <p className="text-sm text-purple-700">Active</p>
                </div>
                <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  PRO
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-sm">Unlimited projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-sm">Unlimited updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-sm">AI insights (coming soon)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-sm">Premium badge</span>
                </div>
              </div>
              <Link href="/settings/subscription">
                <Button variant="outline" className="w-full">
                  Manage Subscription →
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Upgrade CTA for Free users */}
        {!isPro && (
          <Card className="mb-8 bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 animate-in fade-in slide-in-from-left duration-700 hover:shadow-xl hover:scale-105 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⭐ Upgrade to Pro
              </CardTitle>
              <CardDescription>
                Unlock unlimited projects & updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-sm">Unlimited projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-sm">Unlimited updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-sm">AI insights (coming soon)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">✓</span>
                  <span className="text-sm">Premium badge</span>
                </div>
              </div>
              <Link href="/pricing">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Upgrade for $9/month →
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Projects List */}
          {projects && projects.length > 0 && (
            <Card className="animate-in fade-in slide-in-from-bottom duration-700 hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>Manage your active projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all hover:shadow-lg hover:scale-105 cursor-pointer group">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold">{project.title}</h3>
                            {project.description && (
                              <p className="text-gray-600 text-sm mt-1 line-clamp-1">{project.description}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${
                            project.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : project.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {projects.length > 3 && (
                    <Link href="/projects">
                      <Button variant="outline" className="w-full">
                        View all {projects.length} projects →
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Updates Timeline */}
          <Card className="animate-in fade-in slide-in-from-bottom duration-700 delay-150 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentUpdates && recentUpdates.length > 0 ? (
                <div className="space-y-4">
                  {recentUpdates.map((update: any) => (
                    <div key={update.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <div className="w-0.5 h-full bg-purple-200"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium text-gray-900">{update.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {update.projects?.title} • {new Date(update.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Link href="/feed">
                    <Button variant="outline" className="w-full">
                      View all activity →
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm mb-4">No updates yet</p>
                  <Link href="/projects/new">
                    <Button>Post your first update</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="animate-in fade-in slide-in-from-bottom duration-700 delay-300 hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started with ProjectLog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform">
              <div className="bg-purple-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="font-semibold">Create your first project</h3>
                <p className="text-sm text-gray-600">
                  Start documenting your indie hacker journey
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform">
              <div className="bg-blue-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h3 className="font-semibold">Post your first update</h3>
                <p className="text-sm text-gray-600">
                  Share what you're working on with the community
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 group hover:translate-x-2 transition-transform">
              <div className="bg-green-100 p-3 rounded-full group-hover:scale-110 transition-transform">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-semibold">Connect with other builders</h3>
                <p className="text-sm text-gray-600">
                  Follow other indie hackers and get inspired
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}
