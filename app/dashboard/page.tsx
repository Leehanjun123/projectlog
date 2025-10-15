import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NotificationBell } from '@/components/notification-bell'
import { getStreakEmoji } from '@/lib/streak'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Streak Banner */}
        {!updatedToday && currentStreak > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-lg">
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
          <div className="mb-6 p-4 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{streakEmoji}</span>
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

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {profile?.display_name || user.email}!
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <NotificationBell />
            <Link href="/feed">
              <Button variant="outline">🌍 Community</Button>
            </Link>
            <Link href="/projects/new">
              <Button>+ New Project</Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline">⚙️ Settings</Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="outline">Sign out</Button>
            </form>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Your active projects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{projectCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
              <CardDescription>Total updates posted</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{updatesCount || 0}</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{streakEmoji}</span>
                Current Streak
              </CardTitle>
              <CardDescription>Consecutive days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
              {longestStreak > currentStreak && (
                <p className="text-sm text-gray-600 mt-1">Best: {longestStreak} days</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Followers</CardTitle>
              <CardDescription>People following you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>

        {/* Pro Status Card for Pro users */}
        {isPro && (
          <Card className="mb-8 bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300">
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
          <Card className="mb-8 bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300">
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

        {/* Projects List */}
        {projects && projects.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>Manage your active projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          {project.description && (
                            <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                          )}
                          {project.goal && (
                            <p className="text-purple-600 text-sm mt-2">🎯 {project.goal}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started with ProjectLog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="font-semibold">Create your first project</h3>
                <p className="text-sm text-gray-600">
                  Start documenting your indie hacker journey
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">🚀</span>
              </div>
              <div>
                <h3 className="font-semibold">Post your first update</h3>
                <p className="text-sm text-gray-600">
                  Share what you're working on with the community
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-full">
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
  )
}
