'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateStreak } from '@/lib/streak'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function NewUpdatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [content, setContent] = useState('')
  const [challenges, setChallenges] = useState('')
  const [mood, setMood] = useState<string>('')
  const [timeSpent, setTimeSpent] = useState<number | ''>('')
  const [dayNumber, setDayNumber] = useState<number | ''>('')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [project, setProject] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [limitCheck, setLimitCheck] = useState<{ allowed: boolean; reason?: string; current?: number; limit?: number | null } | null>(null)
  const [checkingLimit, setCheckingLimit] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProject()
    checkLimit()
  }, [])

  const checkLimit = async () => {
    try {
      const response = await fetch('/api/check-limits?type=update')
      const data = await response.json()
      setLimitCheck(data)
    } catch (err) {
      console.error('Failed to check limit:', err)
    } finally {
      setCheckingLimit(false)
    }
  }

  const loadProject = async () => {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    setProject(data)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.')
      return
    }

    setImageFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

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

      // Upload image first if exists
      let imageUrl: string | null = null
      if (imageFile) {
        setUploadingImage(true)
        const formData = new FormData()
        formData.append('file', imageFile)

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Failed to upload image')
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
        setUploadingImage(false)
      }

      // Insert update with image URL
      const { error: insertError } = await supabase
        .from('updates')
        .insert({
          project_id: id,
          user_id: user.id,
          content,
          challenges: challenges || null,
          mood: mood || null,
          time_spent: timeSpent || null,
          day_number: dayNumber || null,
          is_public: isPublic,
          image_url: imageUrl
        })

      if (insertError) throw insertError

      // Update streak
      await updateStreak(user.id)

      router.push(`/projects/${id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
      setUploadingImage(false)
    }
  }

  const moods = [
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'tired', emoji: '😴', label: 'Tired' },
    { value: 'frustrated', emoji: '😤', label: 'Frustrated' },
    { value: 'excited', emoji: '🤩', label: 'Excited' }
  ]

  // Loading state
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

  // Limit reached
  if (limitCheck && !limitCheck.allowed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href={`/projects/${id}`}>
              <Button variant="ghost">← Back to Project</Button>
            </Link>
          </div>

          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-3xl">Daily Update Limit Reached</CardTitle>
              <CardDescription className="text-lg">
                You've hit today's limit on the Free plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p className="text-purple-900 font-medium mb-2">
                  {limitCheck.reason}
                </p>
                <p className="text-purple-700 text-sm">
                  Today: {limitCheck.current} / {limitCheck.limit} updates
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Free Plan</p>
                  <p className="text-2xl font-bold text-gray-900">5 Updates/Day</p>
                  <p className="text-xs text-gray-500 mt-1">Current plan</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
                  <p className="text-sm text-purple-700 mb-2">Pro Plan</p>
                  <p className="text-2xl font-bold text-purple-900">Unlimited Updates</p>
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
                <Link href={`/projects/${id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Project
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-gray-500 text-center pt-4 border-t">
                💡 Tip: Your limit resets every day at midnight
              </p>
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
          <Link href={`/projects/${id}`}>
            <Button variant="ghost">← Back to Project</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Post Update</CardTitle>
            <CardDescription>
              {project?.title && `Share your progress on ${project.title}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="content">What did you work on? *</Label>
                <Textarea
                  id="content"
                  placeholder="Share your progress, wins, learnings..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dayNumber">Day Number</Label>
                  <Input
                    id="dayNumber"
                    type="number"
                    placeholder="e.g., 1"
                    value={dayNumber}
                    onChange={(e) => setDayNumber(e.target.value ? parseInt(e.target.value) : '')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
                  <Input
                    id="timeSpent"
                    type="number"
                    placeholder="e.g., 120"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value ? parseInt(e.target.value) : '')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>How are you feeling?</Label>
                <div className="flex gap-2 flex-wrap">
                  {moods.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMood(mood === m.value ? '' : m.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        mood === m.value
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="ml-2 text-sm">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenges">Challenges (optional)</Label>
                <Textarea
                  id="challenges"
                  placeholder="Any obstacles or difficulties you faced?"
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Add Image (optional)</Label>
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">📸</span>
                        <p className="font-medium text-gray-700">Click to upload an image</p>
                        <p className="text-sm text-gray-500">JPG, PNG, GIF, WebP (max 5MB)</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}
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
                  Make this update public (visible to everyone)
                </Label>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading || uploadingImage} className="flex-1">
                  {uploadingImage ? 'Uploading Image...' : loading ? 'Posting...' : 'Post Update'}
                </Button>
                <Link href={`/projects/${id}`} className="flex-1">
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
