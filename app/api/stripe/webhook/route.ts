import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Create Supabase admin client (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // You'll need to add this to .env.local
)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        if (userId) {
          // Update user's subscription status
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_tier: 'pro',
              subscription_status: 'active',
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
            })
            .eq('id', userId)

          console.log(`✅ User ${userId} upgraded to Pro`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user by customer ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          const status = subscription.status === 'active' ? 'active' :
                        subscription.status === 'past_due' ? 'past_due' :
                        subscription.status === 'canceled' ? 'canceled' : 'inactive'

          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: status,
              subscription_end_date: subscription.cancel_at
                ? new Date(subscription.cancel_at * 1000).toISOString()
                : null,
            })
            .eq('id', profile.id)

          // Create/update subscription record
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: profile.id,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0].price.id,
              status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              canceled_at: subscription.canceled_at
                ? new Date(subscription.canceled_at * 1000).toISOString()
                : null,
              updated_at: new Date().toISOString(),
            })

          console.log(`✅ Subscription updated for user ${profile.id}: ${status}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user by customer ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          // Downgrade to free
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: 'inactive',
              subscription_end_date: new Date().toISOString(),
            })
            .eq('id', profile.id)

          // Update subscription record
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)

          console.log(`✅ User ${profile.id} downgraded to Free`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Get user by customer ID
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: 'past_due' })
            .eq('id', profile.id)

          console.log(`⚠️ Payment failed for user ${profile.id}`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({
      error: error.message || 'Webhook handler failed'
    }, { status: 500 })
  }
}
