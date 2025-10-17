'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
      >
        <span className="text-2xl">💬</span>
      </button>

      {/* Feedback Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>We'd love your feedback! 💜</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </CardTitle>
              <CardDescription>
                Help us make ProjectLog better for indie hackers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <a
                  href="https://tally.so/r/mODdqV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full" size="lg">
                    📝 Fill out feedback form
                  </Button>
                </a>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <a
                  href="mailto:feedback@projectlog.com?subject=ProjectLog Feedback"
                  className="block"
                >
                  <Button variant="outline" className="w-full" size="lg">
                    📧 Email us directly
                  </Button>
                </a>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 text-center">
                    Found a bug or have a feature request?
                  </p>
                  <a
                    href="https://github.com/Leehanjun123/projectlog/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2"
                  >
                    <Button variant="ghost" className="w-full" size="sm">
                      🐛 Open GitHub Issue
                    </Button>
                  </a>
                </div>
              </div>

              <div className="pt-4 text-center">
                <p className="text-xs text-gray-500">
                  This is Phase 1 MVP - your feedback shapes what we build next!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
