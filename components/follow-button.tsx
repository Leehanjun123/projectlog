'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface FollowButtonProps {
  profileId: string
  initialFollowing: boolean
}

export function FollowButton({ profileId, initialFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  const handleFollow = async () => {
    if (loading) return
    setLoading(true)

    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ following_id: profileId }),
      })

      const data = await response.json()

      if (data.following !== undefined) {
        setFollowing(data.following)
      }
    } catch (error) {
      console.error('Error following user:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={following ? 'outline' : 'default'}
    >
      {following ? 'Following' : 'Follow'}
    </Button>
  )
}
