'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CommentsSection } from '@/components/comments-section'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import Link from 'next/link'
import { UPDATE_TYPES, PROJECT_CATEGORIES, PROJECT_STAGES } from '@/lib/types/specialization'
import type { UpdateType, ProjectCategory, ProjectStage } from '@/lib/types/specialization'

interface InstagramUpdateCardProps {
  update: any
  currentUserId: string
}

export function InstagramUpdateCard({ update, currentUserId }: InstagramUpdateCardProps) {
  const [liked, setLiked] = useState(
    update.likes?.some((like: any) => like.user_id === currentUserId) || false
  )
  const [likeCount, setLikeCount] = useState(update.likes?.length || 0)
  const [loading, setLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)

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

  const updateType = update.update_type as UpdateType || 'log'
  const updateTypeInfo = UPDATE_TYPES[updateType]
  const projectCategory = (update.project?.category as ProjectCategory) || null
  const projectStage = (update.project?.stage as ProjectStage) || null

  return (
    <Card className="bg-white border border-gray-300 rounded-lg overflow-hidden">
      {/* Header - Instagram style */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${update.user_id}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:scale-110 transition-transform">
              {update.profile?.display_name?.[0]?.toUpperCase() || 'U'}
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/profile/${update.user_id}`}>
                <p className="text-sm font-semibold hover:text-gray-500 transition-colors cursor-pointer">
                  {update.profile?.display_name || 'Anonymous Builder'}
                </p>
              </Link>
              {update.profile?.subscription_tier === 'pro' && update.profile?.subscription_status === 'active' && (
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold rounded">
                  PRO
                </span>
              )}
            </div>
            <Link href={`/projects/${update.project?.id}`}>
              <p className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer">
                {update.project?.title}
              </p>
            </Link>
          </div>
        </div>
        <button className="text-gray-600 hover:text-gray-800 text-xl font-bold">
          •••
        </button>
      </div>

      {/* Image - Instagram style */}
      {update.image_url && (
        <div className="w-full aspect-square bg-gray-100">
          <img
            src={update.image_url}
            alt="Update"
            className="w-full h-full object-cover cursor-pointer"
            onDoubleClick={handleLike}
          />
        </div>
      )}

      {/* Action buttons - Instagram style */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={loading}
              className="hover:text-gray-500 transition-colors"
            >
              {liked ? (
                <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="hover:text-gray-500 transition-colors"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </button>
            <button className="hover:text-gray-500 transition-colors">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
            </button>
          </div>
          <button className="hover:text-gray-500 transition-colors">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </button>
        </div>

        {/* Likes count */}
        {likeCount > 0 && (
          <p className="text-sm font-semibold mb-2">
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption - Instagram style */}
        <div className="text-sm mb-2">
          <Link href={`/profile/${update.user_id}`}>
            <span className="font-semibold hover:text-gray-500 cursor-pointer mr-2">
              {update.profile?.display_name || 'Anonymous'}
            </span>
          </Link>
          <div className="inline">
            <MarkdownRenderer content={update.content} />
          </div>
        </div>

        {/* Tags - Instagram hashtag style */}
        {update.tags && update.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {update.tags.map((tag: string, index: number) => (
              <Link key={index} href={`/feed?tag=${encodeURIComponent(tag)}`}>
                <span className="text-sm text-blue-900 hover:text-blue-700 cursor-pointer font-normal">
                  #{tag}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Badges - compact */}
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${updateTypeInfo.color} font-medium`}>
            {updateTypeInfo.icon} {updateTypeInfo.label}
          </span>
          {projectCategory && (
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded font-medium">
              {PROJECT_CATEGORIES[projectCategory].icon} {PROJECT_CATEGORIES[projectCategory].label}
            </span>
          )}
          {projectStage && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${PROJECT_STAGES[projectStage].color}`}>
              {PROJECT_STAGES[projectStage].icon} {PROJECT_STAGES[projectStage].label}
            </span>
          )}
        </div>

        {/* Time */}
        <p className="text-xs text-gray-400 uppercase mb-3">
          {new Date(update.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Comments section - Instagram style */}
      {showComments && (
        <div className="border-t border-gray-200 px-4 py-3">
          <CommentsSection updateId={update.id} currentUserId={currentUserId} />
        </div>
      )}
    </Card>
  )
}
