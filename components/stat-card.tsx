'use client'

import { memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StatCardProps {
  title: string
  description: string
  value: number
  suffix?: string
  className?: string
  icon?: React.ReactNode
  delay?: number
}

export const StatCard = memo(function StatCard({
  title,
  description,
  value,
  suffix = '',
  className = '',
  icon,
  delay = 0
}: StatCardProps) {
  return (
    <Card
      className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}
      style={{
        animation: `fadeInUp 0.4s ease-out ${delay}ms forwards`,
        opacity: 0
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">
          {value}
          {suffix}
        </p>
      </CardContent>
    </Card>
  )
})
