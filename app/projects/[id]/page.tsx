import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import Link from 'next/link'

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get project details
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) {
    redirect('/dashboard')
  }

  // Get project updates
  const { data: updates } = await supabase
    .from('updates')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const isOwner = project.user_id === user.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        {/* Project Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">{project.title}</CardTitle>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : project.status === 'paused'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Started {new Date(project.started_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Link href={`/projects/${project.id}/new-update`}>
                    <Button>+ Post Update</Button>
                  </Link>
                  <Link href={`/projects/${project.id}/edit`}>
                    <Button variant="outline">Edit Project</Button>
                  </Link>
                </div>
              )}
            </div>
          </CardHeader>
          {(project.description || project.goal) && (
            <CardContent className="space-y-4">
              {project.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{project.description}</p>
                </div>
              )}
              {project.goal && (
                <div>
                  <h3 className="font-semibold mb-2">Goal</h3>
                  <p className="text-purple-700">🎯 {project.goal}</p>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Updates Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Updates</CardTitle>
            <CardDescription>
              {updates && updates.length > 0
                ? `${updates.length} update${updates.length > 1 ? 's' : ''} posted`
                : 'No updates yet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {updates && updates.length > 0 ? (
              <div className="space-y-6">
                {updates.map((update, index) => (
                  <div key={update.id} className="border-l-4 border-purple-200 pl-6 pb-6 relative">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-purple-500"></div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        {update.day_number && (
                          <span className="font-bold text-purple-600">Day {update.day_number}</span>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(update.created_at).toLocaleDateString()}
                        </span>
                        {update.mood && (
                          <span className="text-sm">
                            {update.mood === 'happy' && '😊'}
                            {update.mood === 'neutral' && '😐'}
                            {update.mood === 'tired' && '😴'}
                            {update.mood === 'frustrated' && '😤'}
                            {update.mood === 'excited' && '🤩'}
                          </span>
                        )}
                        {update.time_spent && (
                          <span className="text-sm text-gray-500">
                            ⏱️ {update.time_spent} min
                          </span>
                        )}
                      </div>
                    </div>
                    <MarkdownRenderer content={update.content} />
                    {update.image_url && (
                      <div className="mt-3 rounded-lg overflow-hidden">
                        <img
                          src={update.image_url}
                          alt="Update image"
                          className="w-full h-auto object-cover max-h-96"
                        />
                      </div>
                    )}
                    {update.challenges && (
                      <div className="mt-3 p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                        <p className="text-sm font-semibold text-orange-700">Challenges:</p>
                        <p className="text-sm text-orange-600">{update.challenges}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No updates yet for this project</p>
                {isOwner && (
                  <Link href={`/projects/${project.id}/new-update`}>
                    <Button>Post Your First Update</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
