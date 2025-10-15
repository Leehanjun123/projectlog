import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { UpgradeButton } from '@/components/upgrade-button'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's subscription info if logged in
  let subscription = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status')
      .eq('id', user.id)
      .single()
    subscription = data
  }

  const isPro = subscription?.subscription_tier === 'pro' && subscription?.subscription_status === 'active'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start building in public for free. Upgrade when you need more power.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="relative border-2 hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription className="text-lg">Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>3 projects</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>5 updates/day</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Markdown support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Community feed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Likes & comments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Streak tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Image uploads (1/update)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Profile page</span>
                </li>
              </ul>

              {!user ? (
                <Link href="/signup">
                  <Button variant="outline" className="w-full mt-6">
                    Sign up for free
                  </Button>
                </Link>
              ) : !isPro ? (
                <Button variant="outline" className="w-full mt-6" disabled>
                  Current Plan
                </Button>
              ) : (
                <Button variant="outline" className="w-full mt-6" disabled>
                  You're on Pro
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-4 border-purple-500 hover:shadow-2xl transition-shadow">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>

            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                Pro
                <span className="text-lg font-normal text-purple-600">⭐</span>
              </CardTitle>
              <CardDescription className="text-lg">For serious builders</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-sm text-gray-500">or $90/year (save $18)</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="font-semibold text-purple-700">Everything in Free, plus:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span><strong>Unlimited projects</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span><strong>Unlimited updates</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span><strong>AI insights & feedback</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Multi-image uploads (5/update)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Premium badge on profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>Custom profile themes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">✓</span>
                    <span>PDF export</span>
                  </li>
                </ul>
              </div>

              {!user ? (
                <Link href="/signup">
                  <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Sign up to upgrade
                  </Button>
                </Link>
              ) : isPro ? (
                <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600" disabled>
                  Current Plan ✓
                </Button>
              ) : (
                <UpgradeButton />
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes! You can cancel your Pro subscription at any time. Your Pro features will remain active until the end of your billing period.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens to my projects if I downgrade?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All your projects and updates are safe! If you downgrade from Pro to Free, you'll keep all existing projects but won't be able to create new ones beyond the Free tier limit (3 projects).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We offer a 14-day money-back guarantee. If you're not satisfied with Pro within the first 14 days, contact us for a full refund.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We accept all major credit cards (Visa, Mastercard, American Express) through Stripe, our secure payment processor.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a student or early adopter discount?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We're currently offering an early adopter discount! The first 100 users get Pro for $5/month (lifetime). Check our homepage for current promotions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">
            Have questions? <Link href="/contact" className="text-purple-600 hover:underline">Contact us</Link>
          </p>
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
