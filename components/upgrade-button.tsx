'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function UpgradeButton() {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No URL returned from checkout')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
    >
      {loading ? 'Loading...' : 'Upgrade to Pro'}
    </Button>
  )
}
