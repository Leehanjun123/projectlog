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

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      setDisplayName(profile.display_name || '')
      setBio(profile.bio || '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push(`/profile/${user.id}`)
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Link href="/settings/subscription">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-purple-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  💳 Subscription
                </CardTitle>
                <CardDescription>
                  Manage your plan and billing
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="border-2 border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                👤 Profile Settings
              </CardTitle>
              <CardDescription>
                Update your information below
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Profile Settings</CardTitle>
            <CardDescription>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-500 bg-green-50 p-3 rounded">
                  Profile updated successfully! Redirecting...
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : 'Save Changes'}
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
