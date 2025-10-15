'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function NewProjectPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limitCheck, setLimitCheck] = useState<{ allowed: boolean; reason?: string; current?: number; limit?: number | null } | null>(null)
  const [checkingLimit, setCheckingLimit] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Check project creation limit on mount
  useEffect(() => {
    async function checkLimit() {
      try {
        const response = await fetch('/api/check-limits?type=project')
        const data = await response.json()
        setLimitCheck(data)
      } catch (err) {
        console.error('Failed to check limit:', err)
      } finally {
        setCheckingLimit(false)
      }
    }
    checkLimit()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title,
          description,
          goal,
          is_public: isPublic,
          status: 'active'
        })

      if (insertError) throw insertError

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Show loading state while checking limit
  if (checkingLimit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Checking your subscription...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show upgrade screen if limit reached
  if (limitCheck && !limitCheck.allowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/dashboard">
              <Button variant="ghost">← Back to Dashboard</Button>
            </Link>
          </div>

          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-3xl">Project Limit Reached</CardTitle>
              <CardDescription className="text-lg">
                You've reached the Free tier limit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p className="text-purple-900 font-medium mb-2">
                  {limitCheck.reason}
                </p>
                <p className="text-purple-700 text-sm">
                  Currently: {limitCheck.current} / {limitCheck.limit} projects
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Free Plan</p>
                  <p className="text-2xl font-bold text-gray-900">3 Projects</p>
                  <p className="text-xs text-gray-500 mt-1">Current plan</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
                  <p className="text-sm text-purple-700 mb-2">Pro Plan</p>
                  <p className="text-2xl font-bold text-purple-900">Unlimited Projects</p>
                  <p className="text-xs text-purple-600 mt-1">$9/month</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700">
                  <strong>Upgrade to Pro</strong> to unlock:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Unlimited projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Unlimited daily updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>AI insights & feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Premium badge</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4">
                <Link href="/pricing" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Upgrade to Pro
                  </Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        {/* Show current usage for free users */}
        {limitCheck && limitCheck.limit !== null && (
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Projects</p>
                    <p className="text-lg font-semibold text-purple-900">
                      {limitCheck.current} / {limitCheck.limit} used
                    </p>
                  </div>
                  <Link href="/pricing">
                    <Button variant="outline" size="sm" className="border-purple-300 text-purple-700 hover:bg-purple-100">
                      Upgrade for Unlimited
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Project</CardTitle>
            <CardDescription>
              Start documenting your indie hacker journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  placeholder="My Awesome SaaS Project"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is your project about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Goal</Label>
                <Textarea
                  id="goal"
                  placeholder="What do you want to achieve? (e.g., Reach $1000 MRR in 6 months)"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  Make this project public (others can see your updates)
                </Label>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
