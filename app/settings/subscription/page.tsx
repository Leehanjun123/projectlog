import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SubscriptionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, subscription_end_date, stripe_customer_id, stripe_subscription_id')
    .eq('id', user.id)
    .single()

  const isPro = profile?.subscription_tier === 'pro' && profile?.subscription_status === 'active'

  // Debug: Log the profile data
  console.log('🔍 Subscription Page Debug:', {
    subscription_tier: profile?.subscription_tier,
    subscription_status: profile?.subscription_status,
    isPro,
    email: user.email
  })

  // Format subscription end date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Subscription</h1>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isPro ? (
              <>
                <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-purple-900 mb-2">Pro Plan</p>
                      <p className="text-sm text-purple-700">$9/month</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      ACTIVE
                    </span>
                  </div>
                </div>

                {/* Subscription Details */}
                <div className="space-y-3 p-4 bg-white/50 rounded-lg">
                  <h3 className="font-semibold text-gray-900">Subscription Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">
                        {profile?.subscription_status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan:</span>
                      <span className="font-medium">Pro Monthly</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    {profile?.subscription_end_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next billing date:</span>
                        <span className="font-medium">{formatDate(profile.subscription_end_date)}</span>
                      </div>
                    )}
                    {profile?.stripe_customer_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer ID:</span>
                        <span className="font-mono text-xs">{profile.stripe_customer_id.slice(0, 20)}...</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Your Pro Features:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span>
                      <span>Unlimited projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span>
                      <span>Unlimited daily updates</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span>
                      <span>AI insights (coming soon)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span>
                      <span>Premium badge</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-600">✓</span>
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-4">
                    To cancel or manage your subscription, visit the Stripe Customer Portal.
                  </p>
                  <Button variant="outline">
                    Manage Subscription
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mb-2">Free Plan</p>
                      <p className="text-sm text-gray-600">$0/month</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                      FREE
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Your Free Features:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>3 projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>5 updates/day</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Markdown support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Community feed</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Likes & comments</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-4">
                    Ready to unlock unlimited projects and updates?
                  </p>
                  <Link href="/pricing">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
