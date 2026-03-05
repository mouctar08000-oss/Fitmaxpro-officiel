"""
FitMaxPro - Payment Routes (Stripe)
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from datetime import datetime, timezone, timedelta
import logging
import os
import json
import stripe

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db, STRIPE_API_KEY
from models.schemas import User, CheckoutRequest
from routes.auth import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

stripe.api_key = STRIPE_API_KEY

PACKAGES = {
    "standard_monthly": {"amount": 699, "tier": "standard", "billing": "monthly", "interval": "month"},
    "standard_annual": {"amount": 6999, "tier": "standard", "billing": "annual", "interval": "year"},
    "vip_monthly": {"amount": 999, "tier": "vip", "billing": "monthly", "interval": "month"},
    "vip_annual": {"amount": 9999, "tier": "vip", "billing": "annual", "interval": "year"},
    "supplements_monthly": {"amount": 499, "tier": "supplements", "billing": "monthly", "interval": "month"}
}

FREE_TRIAL_DAYS = 7


@router.post("/checkout")
async def create_checkout(checkout_req: CheckoutRequest, current_user: User = Depends(get_current_user)):
    """Create Stripe checkout session"""
    if checkout_req.tier == "supplements":
        package_key = "supplements_monthly"
    else:
        package_key = f"{checkout_req.tier}_{checkout_req.billing_cycle}"
    
    if package_key not in PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package")
    
    package = PACKAGES[package_key]
    
    success_url = f"{checkout_req.origin_url}/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_req.origin_url}/pricing"
    
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': f"FitMaxPro - {checkout_req.tier.upper()} ({checkout_req.billing_cycle})",
                        'description': f"Abonnement {checkout_req.tier} avec 7 jours d'essai gratuit"
                    },
                    'unit_amount': package["amount"],
                    'recurring': {'interval': package["interval"]}
                },
                'quantity': 1,
            }],
            subscription_data={
                'trial_period_days': FREE_TRIAL_DAYS,
                'metadata': {
                    'user_id': current_user.user_id,
                    'tier': package["tier"],
                    'billing_cycle': package["billing"]
                }
            },
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': current_user.user_id,
                'tier': package["tier"],
                'billing_cycle': package["billing"]
            },
            customer_email=current_user.email
        )
        
        payment_doc = {
            "session_id": session.id,
            "user_id": current_user.user_id,
            "amount": package["amount"] / 100,
            "currency": "eur",
            "tier": package["tier"],
            "billing_cycle": package["billing"],
            "payment_status": "pending",
            "has_trial": True,
            "trial_days": FREE_TRIAL_DAYS,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payment_transactions.insert_one(payment_doc)
        
        return {"url": session.url, "session_id": session.id}
    except Exception as e:
        logging.error(f"Checkout error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status/{session_id}")
async def get_payment_status(session_id: str, current_user: User = Depends(get_current_user)):
    """Get payment status from Stripe"""
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        
        payment_doc = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if not payment_doc:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if session.status == "complete" and payment_doc["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {"payment_status": "paid", "subscription_id": session.subscription}}
            )
            
            tier = payment_doc["tier"]
            billing_cycle = payment_doc["billing_cycle"]
            trial_end = datetime.now(timezone.utc) + timedelta(days=FREE_TRIAL_DAYS)
            
            await db.users.update_one(
                {"user_id": current_user.user_id},
                {"$set": {
                    "subscription_tier": tier,
                    "subscription_status": "trialing",
                    "trial_ends_at": trial_end.isoformat()
                }}
            )
            
            subscription_doc = {
                "user_id": current_user.user_id,
                "tier": tier,
                "billing_cycle": billing_cycle,
                "status": "trialing",
                "trial_ends_at": trial_end.isoformat(),
                "started_at": datetime.now(timezone.utc).isoformat(),
                "stripe_subscription_id": session.subscription,
                "auto_renew": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.user_subscriptions.insert_one(subscription_doc)
        
        return {
            "status": session.status,
            "payment_status": session.payment_status or "trialing",
            "amount_total": session.amount_total,
            "currency": session.currency,
            "trial_days": FREE_TRIAL_DAYS
        }
    except Exception as e:
        logging.error(f"Payment status error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


# Stripe Webhook Router (separate for clarity)
webhook_router = APIRouter(prefix="/webhook", tags=["Webhooks"])


@webhook_router.post("/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
        
        if webhook_secret:
            event = stripe.Webhook.construct_event(body, signature, webhook_secret)
        else:
            event = stripe.Event.construct_from(
                json.loads(body.decode('utf-8')), stripe.api_key
            )
        
        if event['type'] == 'customer.subscription.trial_will_end':
            subscription = event['data']['object']
            logging.info(f"Trial ending soon for subscription: {subscription['id']}")
            
        elif event['type'] == 'customer.subscription.updated':
            subscription = event['data']['object']
            user_id = subscription.get('metadata', {}).get('user_id')
            
            if user_id:
                new_status = "active" if subscription['status'] == 'active' else subscription['status']
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {"subscription_status": new_status}}
                )
                
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            user_id = subscription.get('metadata', {}).get('user_id')
            
            if user_id:
                await db.users.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "subscription_tier": "free",
                        "subscription_status": "cancelled"
                    }}
                )
        
        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            subscription_id = invoice.get('subscription')
            
            if subscription_id:
                await db.user_subscriptions.update_one(
                    {"stripe_subscription_id": subscription_id},
                    {"$set": {"status": "active"}}
                )
        
        elif event['type'] == 'invoice.payment_failed':
            invoice = event['data']['object']
            subscription_id = invoice.get('subscription')
            
            if subscription_id:
                await db.user_subscriptions.update_one(
                    {"stripe_subscription_id": subscription_id},
                    {"$set": {"status": "past_due"}}
                )
        
        return {"status": "success"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
