'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CommentsSection } from '@/components/comments-section'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import Link from 'next/link'
import { UPDATE_TYPES, PROJECT_CATEGORIES, PROJECT_STAGES } from '@/lib/types/specialization'
import type { UpdateType, ProjectCategory, ProjectStage } from '@/lib/types/specialization'

interface UpdateCardProps {
  update: any
  currentUserId: string
}

export function UpdateCard({ update, currentUserId }: UpdateCardProps) {
  const [liked, setLiked] = useState(
    update.likes?.some((like: any) => like.user_id === currentUserId) || false
  )
  const [likeCount, setLikeCount] = useState(update.likes?.length || 0)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (loading) return
    setLoading(true)

    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ update_id: update.id }),
      })

      const data = await response.json()

      if (data.liked !== undefined) {
        setLiked(data.liked)
        setLikeCount((prev: number) => data.liked ? prev + 1 : prev - 1)
      }
    } catch (error) {
      console.error('Error liking update:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get update type info
  const updateType = update.update_type as UpdateType || 'log'
  const updateTypeInfo = UPDATE_TYPES[updateType]

  // Get project category and stage
  const projectCategory = (update.project?.category as ProjectCategory) || null
  const projectStage = (update.project?.stage as ProjectStage) || null

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-200">
      <CardHeader className="pb-3">
        {/* Header with user info and badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${update.user_id}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform shadow-md">
                {update.profile?.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/profile/${update.user_id}`}>
                  <p className="font-bold hover:text-purple-600 transition-colors cursor-pointer text-sm">
                    {update.profile?.display_name || 'Anonymous Builder'}
                  </p>
                </Link>
                {update.profile?.subscription_tier === 'pro' && update.profile?.subscription_status === 'active' && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {new Date(update.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Update Type Badge - Instagram Story style */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${updateTypeInfo.color}`}>
            <span>{updateTypeInfo.icon}</span>
            <span>{updateTypeInfo.label}</span>
          </div>
        </div>

        {/* Project Title and Meta */}
        <div className="space-y-2">
          <Link href={`/projects/${update.project?.id}`}>
            <CardTitle className="text-lg hover:text-purple-600 transition-colors cursor-pointer line-clamp-2">
              {update.project?.title}
            </CardTitle>
          </Link>

          {/* Category, Stage, Day badges - horizontal row */}
          <div className="flex items-center gap-2 flex-wrap">
            {projectCategory && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium flex items-center gap-1">
                <span>{PROJECT_CATEGORIES[projectCategory].icon}</span>
                <span>{PROJECT_CATEGORIES[projectCategory].label}</span>
              </span>
            )}
            {projectStage && (
              <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${PROJECT_STAGES[projectStage].color}`}>
                <span>{PROJECT_STAGES[projectStage].icon}</span>
                <span>{PROJECT_STAGES[projectStage].label}</span>
              </span>
            )}
            {update.day_number && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                Day {update.day_number}
              </span>
            )}
            {update.mood && (
              <span className="text-lg">
                {update.mood === 'happy' && '😊'}
                {update.mood === 'neutral' && '😐'}
                {update.mood === 'tired' && '😴'}
                {update.mood === 'frustrated' && '😤'}
                {update.mood === 'excited' && '🤩'}
              </span>
            )}
          </div>

          {/* Tags - Twitter style */}
          {update.tags && update.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {update.tags.map((tag: string, index: number) => (
                <Link key={index} href={`/search?tag=${encodeURIComponent(tag)}`}>
                  <span className="text-xs text-purple-600 hover:text-purple-700 hover:underline cursor-pointer font-medium">
                    #{tag}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <MarkdownRenderer content={update.content} />

        {/* Image Display */}
        {update.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={update.image_url}
              alt="Update image"
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        )}

        {update.challenges && (
          <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
            <p className="text-sm font-semibold text-orange-700">Challenges:</p>
            <p className="text-sm text-orange-600">{update.challenges}</p>
          </div>
        )}

        {update.time_spent && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>⏱️ {update.time_spent} minutes</span>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={loading}
              className={liked ? 'text-purple-600' : 'text-gray-500 hover:text-purple-600'}
            >
              {liked ? '❤️' : '🤍'} {likeCount}
            </Button>
          </div>

          <CommentsSection updateId={update.id} currentUserId={currentUserId} />
        </div>
      </CardContent>
    </Card>
  )
}
