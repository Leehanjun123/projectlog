import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function AIInsightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single()

  const isPro = profile?.subscription_tier === 'pro' && profile?.subscription_status === 'active'

  if (!isPro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-3xl">AI Insights - Pro Feature</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                AI-powered insights are available for Pro members only.
              </p>
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                  Upgrade to Pro
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="text-center pb-8">
            <div className="mb-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                <span className="text-5xl">🤖</span>
              </div>
            </div>
            <CardTitle className="text-4xl mb-4">
              AI Insights Coming Soon!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <p className="text-lg text-gray-700">
                안녕하세요, Pro 멤버님! 👋
              </p>
              <p className="text-gray-600">
                AI 인사이트 기능을 준비하고 있어요. 하지만 솔직히 말씀드리면...
              </p>

              <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <p className="text-2xl mb-3">💸</p>
                <p className="font-semibold text-purple-900 mb-2">
                  OpenAI API 비용이 부담스러워요!
                </p>
                <p className="text-sm text-purple-700">
                  지금은 작은 스타트업이라 AI 서버 비용이 좀 부담되네요.
                  구독자가 더 늘면 곧 추가할게요! 🚀
                </p>
              </div>

              <div className="pt-4">
                <p className="text-gray-600 mb-6">
                  대신 지금 즐길 수 있는 Pro 기능:
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-left">
                  <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>무제한 프로젝트</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>무제한 업데이트</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>프리미엄 배지</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-white rounded-lg">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>우선 지원</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-gray-500 mb-4">
                  업데이트 소식은 이메일로 알려드릴게요!
                  Pro 멤버십을 믿고 구독해주셔서 감사합니다 ❤️
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/dashboard">
                    <Button variant="outline">
                      대시보드로 돌아가기
                    </Button>
                  </Link>
                  <Link href="/feed">
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                      커뮤니티 피드 보기
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
