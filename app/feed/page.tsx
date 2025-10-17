import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectCard } from '@/components/project-card'
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
  const category = params.category as string | undefined
  const stage = params.stage as string | undefined

  // Get all public projects
  let projectsQuery = supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')

  // Apply filters
  if (category) {
    projectsQuery = projectsQuery.eq('category', category)
  }

  if (stage) {
    projectsQuery = projectsQuery.eq('stage', stage)
  }

  const { data: projects } = await projectsQuery
    .order('created_at', { ascending: false })
    .limit(20)

  // For each project, get update count and latest update
  const projectsWithUpdates = await Promise.all(
    (projects || []).map(async (project) => {
      // Get update count
      const { count } = await supabase
        .from('updates')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.id)
        .eq('is_public', true)

      // Get latest update
      const { data: latestUpdate } = await supabase
        .from('updates')
        .select('*')
        .eq('project_id', project.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return {
        project,
        updateCount: count || 0,
        latestUpdate: latestUpdate || null
      }
    })
  )

  // Filter out projects with no updates and sort by latest update
  const activeProjects = projectsWithUpdates
    .filter(p => p.updateCount > 0)
    .sort((a, b) => {
      if (!a.latestUpdate) return 1
      if (!b.latestUpdate) return -1
      return new Date(b.latestUpdate.created_at).getTime() - new Date(a.latestUpdate.created_at).getTime()
    })

  return (
    <>
      <Navbar />
      {/* Project-centric feed layout */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto pt-8 px-4">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
              🚀 Indie Projects
            </h1>
            <p className="text-gray-600 text-lg">
              Follow the building journey of indie hackers around the world
            </p>
          </div>

          <div className="flex gap-8">
            {/* Main Feed */}
            <div className="flex-1">
              {activeProjects && activeProjects.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeProjects.map(({ project, updateCount, latestUpdate }) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      updateCount={updateCount}
                      latestUpdate={latestUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg border-2 border-purple-200 p-12 text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    No projects yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to share your building journey!
                  </p>
                  <a
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                  >
                    Start Your Project
                  </a>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
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
