'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goal, setGoal] = useState('')
  const [status, setStatus] = useState('active')
  const [isPublic, setIsPublic] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProject()
  }, [])

  const loadProject = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (!project) {
      router.push('/dashboard')
      return
    }

    if (project.user_id !== user.id) {
      router.push(`/projects/${id}`)
      return
    }

    setTitle(project.title)
    setDescription(project.description || '')
    setGoal(project.goal || '')
    setStatus(project.status)
    setIsPublic(project.is_public)
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

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          title,
          description,
          goal,
          status,
          is_public: isPublic,
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      router.push(`/projects/${id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
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
            <CardTitle className="text-3xl">Edit Project</CardTitle>
            <CardDescription>
              Update your project details
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
                  placeholder="What do you want to achieve?"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
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
                  Make this project public
                </Label>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Link href={`/projects/${id}`} className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-600 mb-4">
                Deleting a project will permanently remove it and all associated updates.
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
