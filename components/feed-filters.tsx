'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PROJECT_CATEGORIES, PROJECT_STAGES, UPDATE_TYPES } from '@/lib/types/specialization'
import type { ProjectCategory, ProjectStage, UpdateType } from '@/lib/types/specialization'

export function FeedFilters() {
  const [selectedUpdateType, setSelectedUpdateType] = useState<UpdateType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory | null>(null)
  const [selectedStage, setSelectedStage] = useState<ProjectStage | null>(null)

  return (
    <div className="space-y-4 sticky top-20">
      {/* Update Types Filter - Instagram Story Style */}
      <Card className="border-2 border-gray-100 hover:border-purple-200 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span>📝</span>
            <span>Update Type</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedUpdateType === null ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => setSelectedUpdateType(null)}
          >
            All Updates
          </Button>
          {Object.entries(UPDATE_TYPES).map(([key, value]) => (
            <Button
              key={key}
              variant={selectedUpdateType === key ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => setSelectedUpdateType(key as UpdateType)}
            >
              <span className="mr-2">{value.icon}</span>
              {value.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Project Categories Filter */}
      <Card className="border-2 border-gray-100 hover:border-purple-200 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span>🏷️</span>
            <span>Category</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </Button>
          {Object.entries(PROJECT_CATEGORIES).map(([key, value]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => setSelectedCategory(key as ProjectCategory)}
            >
              <span className="mr-2">{value.icon}</span>
              {value.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Project Stages Filter */}
      <Card className="border-2 border-gray-100 hover:border-purple-200 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span>🚀</span>
            <span>Stage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedStage === null ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start text-xs"
            onClick={() => setSelectedStage(null)}
          >
            All Stages
          </Button>
          {Object.entries(PROJECT_STAGES).map(([key, value]) => (
            <Button
              key={key}
              variant={selectedStage === key ? 'default' : 'ghost'}
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => setSelectedStage(key as ProjectStage)}
            >
              <span className="mr-2">{value.icon}</span>
              {value.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Trending Tags - Twitter Style */}
      <Card className="border-2 border-gray-100 hover:border-purple-200 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <span>🔥</span>
            <span>Trending</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-2">
            {['buildinpublic', 'saas', 'indiehacker', 'startup', 'launch'].map((tag) => (
              <button
                key={tag}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-600 group-hover:text-purple-700 font-medium">
                    #{tag}
                  </span>
                  <span className="text-xs text-gray-400">
                    {Math.floor(Math.random() * 100)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats - Instagram Style */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-100">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {Math.floor(Math.random() * 500) + 100}
              </p>
              <p className="text-xs text-gray-600">Active Builders</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {Math.floor(Math.random() * 200) + 50}
              </p>
              <p className="text-xs text-gray-600">Projects Launched</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-pink-600">
                ${Math.floor(Math.random() * 50) + 10}K
              </p>
              <p className="text-xs text-gray-600">Total MRR</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
