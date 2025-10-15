import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('🔐 Auth check:', { user: user?.email, authError })

    if (!user) {
      console.error('❌ No user found, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      })

      customerId = customer.id

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create Checkout Session
    console.log('💳 Creating Checkout Session...', {
      customerId,
      priceId: process.env.STRIPE_PRICE_ID_MONTHLY,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    })

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_MONTHLY!, // You'll need to create this in Stripe Dashboard
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        user_id: user.id,
      },
    })

    console.log('✅ Checkout Session created:', {
      sessionId: session.id,
      url: session.url,
      status: session.status
    })

    // Return URL for client-side redirect
    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({
      error: error.message || 'Failed to create checkout session'
    }, { status: 500 })
  }
}
