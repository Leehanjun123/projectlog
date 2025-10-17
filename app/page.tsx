import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center mb-20">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
              For Indie Hackers & Builders
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Build in Public,
            <br />
            Grow Together
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Your journey deserves to be shared. Track projects, post updates, and connect with a community that gets it.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="rounded-full text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                Start Building 🚀
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features - Phase 1 핵심 가치 */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="border-2 hover:border-purple-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <CardTitle className="text-xl">Your PROJECT is the Star</CardTitle>
              <CardDescription className="text-base">
                Unlike Twitter or Instagram, your project gets its own page. Track the complete journey from Day 1 to launch.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <CardTitle className="text-xl">Visual Progress Tracking</CardTitle>
              <CardDescription className="text-base">
                See your progress with beautiful bars. Stage badges (Idea → Building → Launched). Day streaks to keep you motivated.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-indigo-200 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <span className="text-3xl">📖</span>
              </div>
              <CardTitle className="text-xl">Building Journey Timeline</CardTitle>
              <CardDescription className="text-base">
                Every update in chronological order. Your entire story in one place. No more scattered tweets.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Social Proof / Example */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-100 mb-20">
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-gray-500 mb-6 text-sm uppercase tracking-wide font-semibold">
              How it works
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Create Your Project</h3>
                  <p className="text-gray-600">Start with your idea. Set a goal. Make it public or keep it private.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Post Daily Updates</h3>
                  <p className="text-gray-600">Share what you built, how you felt, and what challenges you faced.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Connect & Grow</h3>
                  <p className="text-gray-600">Get feedback, make friends, and watch your project come to life.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to start your journey?</h2>
          <p className="text-xl text-gray-600 mb-8">Join indie hackers who are building openly</p>
          <Link href="/signup">
            <Button size="lg" className="rounded-full text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Built with ❤️ for indie hackers everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
