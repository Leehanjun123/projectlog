'use client'

import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { PROJECT_CATEGORIES, PROJECT_STAGES, UPDATE_TYPES } from '@/lib/types/specialization'
import type { UpdateType, ProjectCategory, ProjectStage } from '@/lib/types/specialization'

interface ProjectCardProps {
  project: any
  latestUpdate?: any
  updateCount: number
}

export function ProjectCard({ project, latestUpdate, updateCount }: ProjectCardProps) {
  const projectCategory = project.category as ProjectCategory
  const projectStage = project.stage as ProjectStage

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-300 cursor-pointer">
        {/* Project Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 line-clamp-1">
                {project.title}
              </h2>
              {project.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {projectCategory && PROJECT_CATEGORIES[projectCategory] && (
              <span className="px-2 py-1 bg-white text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
                <span>{PROJECT_CATEGORIES[projectCategory].icon}</span>
                <span>{PROJECT_CATEGORIES[projectCategory].label}</span>
              </span>
            )}
            {projectStage && PROJECT_STAGES[projectStage] && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${PROJECT_STAGES[projectStage].color}`}>
                <span>{PROJECT_STAGES[projectStage].icon}</span>
                <span>{PROJECT_STAGES[projectStage].label}</span>
              </span>
            )}
            {updateCount > 0 && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium flex items-center gap-1">
                <span>🔥</span>
                <span>Day {updateCount}</span>
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {projectStage && PROJECT_STAGES[projectStage] && (
            <div className="mt-3">
              <div className="w-full h-2 bg-white rounded-full overflow-hidden">
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
        </div>

        {/* Latest Update Preview */}
        {latestUpdate && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-700">Latest Update</span>
              <span className="text-xs text-gray-500">
                {new Date(latestUpdate.created_at).toLocaleDateString()}
              </span>
              {latestUpdate.day_number && (
                <span className="text-xs text-purple-600 font-medium">
                  Day {latestUpdate.day_number}
                </span>
              )}
            </div>

            {/* Update Content Preview */}
            <div className="text-gray-700 text-sm line-clamp-3 mb-3">
              {latestUpdate.content}
            </div>

            {/* Update Image */}
            {latestUpdate.image_url && (
              <div className="rounded-lg overflow-hidden mb-3">
                <img
                  src={latestUpdate.image_url}
                  alt="Latest update"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Metrics */}
            <div className="flex items-center gap-2 flex-wrap">
              {latestUpdate.time_spent && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-full">
                  <span className="text-xs">⏱️</span>
                  <span className="text-xs font-medium text-blue-700">{latestUpdate.time_spent}min</span>
                </div>
              )}
              {latestUpdate.mood && (
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 rounded-full">
                  <span className="text-xs">
                    {latestUpdate.mood === 'happy' && '😊'}
                    {latestUpdate.mood === 'neutral' && '😐'}
                    {latestUpdate.mood === 'tired' && '😴'}
                    {latestUpdate.mood === 'frustrated' && '😤'}
                    {latestUpdate.mood === 'excited' && '🤩'}
                  </span>
                  <span className="text-xs font-medium text-yellow-700 capitalize">{latestUpdate.mood}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="flex items-center gap-1">
                <span>📝</span>
                <span>{updateCount} updates</span>
              </span>
            </div>
            <span className="text-purple-600 font-medium hover:text-purple-700">
              View Journey →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
