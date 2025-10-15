'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CommentsSection } from '@/components/comments-section'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import Link from 'next/link'

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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link href={`/profile/${update.user_id}`}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-80 transition-opacity">
                  {update.profile?.display_name?.[0]?.toUpperCase() || 'U'}
                </div>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${update.user_id}`}>
                    <p className="font-semibold hover:text-purple-600 transition-colors cursor-pointer">
                      {update.profile?.display_name || 'Anonymous Builder'}
                    </p>
                  </Link>
                  {update.profile?.subscription_tier === 'pro' && update.profile?.subscription_status === 'active' && (
                    <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(update.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <Link href={`/projects/${update.project?.id}`}>
              <CardTitle className="text-xl hover:text-purple-600 transition-colors cursor-pointer">
                {update.project?.title}
              </CardTitle>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {update.day_number && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Day {update.day_number}
              </span>
            )}
            {update.mood && (
              <span className="text-2xl">
                {update.mood === 'happy' && '😊'}
                {update.mood === 'neutral' && '😐'}
                {update.mood === 'tired' && '😴'}
                {update.mood === 'frustrated' && '😤'}
                {update.mood === 'excited' && '🤩'}
              </span>
            )}
          </div>
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
