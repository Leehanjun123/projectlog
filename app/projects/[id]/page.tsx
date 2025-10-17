import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import Link from 'next/link'
import { PROJECT_CATEGORIES, PROJECT_STAGES } from '@/lib/types/specialization'
import type { ProjectCategory, ProjectStage } from '@/lib/types/specialization'

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

  // Get project metadata
  const projectCategory = project.category as ProjectCategory
  const projectStage = project.stage as ProjectStage
  const totalDays = updates?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        {/* 🎯 ENHANCED HERO SECTION */}
        <Card className="mb-8 border-2 border-purple-200">
          <CardHeader className="pb-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                  {project.title}
                </CardTitle>
                {project.description && (
                  <p className="text-gray-600 text-lg mb-4">{project.description}</p>
                )}
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Link href={`/projects/${project.id}/new-update`}>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      + Post Update
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/edit`}>
                    <Button variant="outline">Edit</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Category & Stage Badges */}
            <div className="flex items-center gap-3 flex-wrap mb-4">
              {projectCategory && PROJECT_CATEGORIES[projectCategory] && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium flex items-center gap-2">
                  <span>{PROJECT_CATEGORIES[projectCategory].icon}</span>
                  <span>{PROJECT_CATEGORIES[projectCategory].label}</span>
                </span>
              )}
              {projectStage && PROJECT_STAGES[projectStage] && (
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${PROJECT_STAGES[projectStage].color}`}>
                  <span>{PROJECT_STAGES[projectStage].icon}</span>
                  <span>{PROJECT_STAGES[projectStage].label}</span>
                </span>
              )}
              {totalDays > 0 && (
                <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-2">
                  <span>🔥</span>
                  <span>Day {totalDays}</span>
                </span>
              )}
              <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Started {new Date(project.started_at).toLocaleDateString()}
              </span>
            </div>

            {/* Progress Bar */}
            {projectStage && PROJECT_STAGES[projectStage] && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Project Journey</span>
                  <span className="font-semibold text-purple-600">
                    {projectStage === 'idea' && '5%'}
                    {projectStage === 'planning' && '15%'}
                    {projectStage === 'building' && '45%'}
                    {projectStage === 'beta' && '70%'}
                    {projectStage === 'launched' && '85%'}
                    {projectStage === 'growing' && '92%'}
                    {projectStage === 'profitable' && '100%'}
                    {projectStage === 'acquired' && '100%'}
                    {projectStage === 'shutdown' && '0%'}
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{
                      width:
                        projectStage === 'idea' ? '5%' :
                        projectStage === 'planning' ? '15%' :
                        projectStage === 'building' ? '45%' :
                        projectStage === 'beta' ? '70%' :
                        projectStage === 'launched' ? '85%' :
                        projectStage === 'growing' ? '92%' :
                        projectStage === 'profitable' ? '100%' :
                        projectStage === 'acquired' ? '100%' : '5%'
                    }}
                  />
                </div>
              </div>
            )}

            {project.goal && (
              <div className="mt-4 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                <p className="text-purple-800 font-medium flex items-center gap-2">
                  <span>🎯</span>
                  <span>{project.goal}</span>
                </p>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* 📖 JOURNEY TIMELINE */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <span>📖</span>
              <span>Building Journey</span>
            </CardTitle>
            <CardDescription className="text-base">
              {updates && updates.length > 0
                ? `Day 1 to Day ${totalDays} - Following the complete story`
                : 'The journey begins here'}
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
