'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

interface CommentsSectionProps {
  updateId: string
  currentUserId: string
}

export function CommentsSection({ updateId, currentUserId }: CommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    if (showComments) {
      loadComments()
    }
  }, [showComments])

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/comments?update_id=${updateId}`)
      const data = await response.json()
      if (data.comments) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          update_id: updateId,
          content: newComment,
        }),
      })

      const data = await response.json()
      if (data.comment) {
        setComments([...comments, data.comment])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="text-gray-500 hover:text-purple-600"
      >
        💬 {comments.length > 0 ? `${comments.length} Comments` : 'Comment'}
      </Button>

      {showComments && (
        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !newComment.trim()} size="sm">
                {loading ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Link href={`/profile/${comment.user_id}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0">
                      {comment.profile?.display_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </Link>
                  <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/profile/${comment.user_id}`}>
                        <span className="font-semibold text-sm hover:text-purple-600 cursor-pointer">
                          {comment.profile?.display_name || 'Anonymous'}
                        </span>
                      </Link>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
