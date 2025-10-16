'use client'

import { useEffect, useState } from 'react'
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

export function StatCard({
  title,
  description,
  value,
  suffix = '',
  className = '',
  icon,
  delay = 0
}: StatCardProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation after delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!isVisible) return

    // Animate counter from 0 to value
    const duration = 1000 // 1 second
    const steps = 30
    const increment = value / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      if (currentStep === steps) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(increment * currentStep))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value, isVisible])

  return (
    <Card
      className={`transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${className} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
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
          {count}
          {suffix}
        </p>
      </CardContent>
    </Card>
  )
}
