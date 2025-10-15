'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      // Search projects
      const { data: projectData } = await supabase
        .from('projects')
        .select('*, profile:profiles!projects_user_id_fkey(display_name)')
        .eq('is_public', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10)

      // Search users
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .ilike('display_name', `%${query}%`)
        .limit(10)

      setProjects(projectData || [])
      setUsers(userData || [])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/feed">
            <Button variant="ghost">← Back to Feed</Button>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">Search</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search projects and users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searched && (
          <>
            {/* Projects Results */}
            {projects.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Projects ({projects.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map((project) => (
                      <Link key={project.id} href={`/projects/${project.id}`}>
                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{project.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                by {project.profile?.display_name || 'Anonymous'}
                              </p>
                              {project.description && (
                                <p className="text-gray-600 text-sm mt-2">{project.description}</p>
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

            {/* Users Results */}
            {users.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {users.map((user) => (
                      <Link key={user.id} href={`/profile/${user.id}`}>
                        <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xl font-semibold">
                              {user.display_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h3 className="font-semibold">{user.display_name || 'Anonymous'}</h3>
                              {user.bio && (
                                <p className="text-sm text-gray-600 line-clamp-1">{user.bio}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Results */}
            {projects.length === 0 && users.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">No results found for "{query}"</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Try different keywords or browse the community feed
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
