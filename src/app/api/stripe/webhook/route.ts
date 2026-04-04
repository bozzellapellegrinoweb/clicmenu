import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id;
      if (!userId) break;

      await db.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: "active",
          expires_at: null,
        },
        { onConflict: "user_id" }
      );
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id;
      if (!userId) break;

      const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
      const expiresAt =
        sub.status === "canceled" && periodEnd
          ? new Date(periodEnd * 1000).toISOString()
          : null;

      await db
        .from("subscriptions")
        .update({ status: sub.status as string, expires_at: expiresAt })
        .eq("user_id", userId);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const invoiceSubId = (invoice as unknown as { subscription?: string }).subscription;
      if (invoiceSubId) {
        const sub = await getStripe().subscriptions.retrieve(invoiceSubId);
        const userId = sub.metadata?.supabase_user_id;
        if (userId) {
          await db.from("subscriptions").update({ status: "past_due" }).eq("user_id", userId);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
