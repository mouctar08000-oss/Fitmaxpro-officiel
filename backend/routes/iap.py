"""
FitMaxPro - RevenueCat In-App Purchase Routes
Handles subscription management via RevenueCat webhooks for iOS/Android
"""
from fastapi import APIRouter, HTTPException, Depends, Request, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import logging
import os
import httpx

import sys
sys.path.insert(0, "/app/backend")
from utils.config import db, REVENUECAT_API_KEY
from models.schemas import User
from routes.auth import get_current_user, verify_admin

router = APIRouter(prefix="/iap", tags=["In-App Purchases"])

# RevenueCat webhook auth (set in RevenueCat dashboard)
REVENUECAT_WEBHOOK_AUTH = os.environ.get('REVENUECAT_WEBHOOK_AUTH', 'fitmaxpro-webhook-secret')
REVENUECAT_API_BASE = "https://api.revenuecat.com/v1"


class IAPSubscriptionStatus(BaseModel):
    platform: str  # ios, android
    product_id: str
    is_active: bool
    expires_at: Optional[str] = None
    entitlements: list = []


class IAPPurchaseVerify(BaseModel):
    platform: str
    receipt_data: str
    product_id: str


@router.get("/status")
async def get_iap_status(current_user: User = Depends(get_current_user)):
    """Get user's In-App Purchase subscription status from RevenueCat"""
    if not REVENUECAT_API_KEY:
        return {
            "configured": False,
            "message": "RevenueCat not configured"
        }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{REVENUECAT_API_BASE}/subscribers/{current_user.user_id}",
                headers={
                    "Authorization": f"Bearer {REVENUECAT_API_KEY}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 404:
                return {
                    "configured": True,
                    "has_subscription": False,
                    "entitlements": []
                }
            
            response.raise_for_status()
            data = response.json()
            
            subscriber = data.get("subscriber", {})
            entitlements = subscriber.get("entitlements", {})
            subscriptions = subscriber.get("subscriptions", {})
            
            active_entitlements = []
            for ent_id, ent_data in entitlements.items():
                if ent_data.get("expires_date"):
                    expires = datetime.fromisoformat(ent_data["expires_date"].replace("Z", "+00:00"))
                    if expires > datetime.now(timezone.utc):
                        active_entitlements.append({
                            "id": ent_id,
                            "expires_at": ent_data["expires_date"],
                            "product_id": ent_data.get("product_identifier")
                        })
            
            return {
                "configured": True,
                "has_subscription": len(active_entitlements) > 0,
                "entitlements": active_entitlements,
                "subscriptions": subscriptions
            }
            
    except httpx.HTTPError as e:
        logging.error(f"RevenueCat API error: {e}")
        return {
            "configured": True,
            "error": "Failed to fetch subscription status"
        }


@router.post("/webhook")
async def revenuecat_webhook(
    request: Request,
    authorization: Optional[str] = Header(None)
):
    """Handle RevenueCat webhook events for subscription updates"""
    # Validate webhook auth
    expected_auth = f"Bearer {REVENUECAT_WEBHOOK_AUTH}"
    if authorization != expected_auth:
        logging.warning(f"Invalid webhook auth: {authorization}")
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    event = body.get("event", {})
    event_type = event.get("type")
    app_user_id = event.get("app_user_id")
    
    logging.info(f"RevenueCat webhook: {event_type} for user {app_user_id}")
    
    # Store webhook event for audit
    await db.iap_events.insert_one({
        "event_id": event.get("id"),
        "event_type": event_type,
        "app_user_id": app_user_id,
        "product_id": event.get("product_id"),
        "environment": event.get("environment"),
        "raw_event": event,
        "received_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Process based on event type
    if event_type == "INITIAL_PURCHASE":
        await handle_initial_purchase(event, app_user_id)
    elif event_type == "RENEWAL":
        await handle_renewal(event, app_user_id)
    elif event_type == "CANCELLATION":
        await handle_cancellation(event, app_user_id)
    elif event_type == "EXPIRATION":
        await handle_expiration(event, app_user_id)
    elif event_type == "BILLING_ISSUE":
        await handle_billing_issue(event, app_user_id)
    
    return {"status": "received"}


async def handle_initial_purchase(event: dict, app_user_id: str):
    """Handle new subscription purchase"""
    product_id = event.get("product_id", "")
    entitlement_id = event.get("entitlement_id")
    expiration_ms = event.get("expiration_at_ms")
    
    # Determine tier from product_id
    tier = "standard"
    if "vip" in product_id.lower() or "premium" in product_id.lower():
        tier = "vip"
    elif "supplement" in product_id.lower():
        tier = "supplements"
    
    expiration_date = None
    if expiration_ms:
        expiration_date = datetime.fromtimestamp(expiration_ms / 1000, tz=timezone.utc)
    
    # Update user subscription
    await db.users.update_one(
        {"user_id": app_user_id},
        {"$set": {
            "subscription_tier": tier,
            "subscription_status": "active",
            "iap_product_id": product_id,
            "iap_entitlement": entitlement_id,
            "iap_expires_at": expiration_date.isoformat() if expiration_date else None,
            "iap_platform": event.get("store", "unknown")
        }}
    )
    
    logging.info(f"Initial purchase processed: {app_user_id} -> {tier}")


async def handle_renewal(event: dict, app_user_id: str):
    """Handle subscription renewal"""
    expiration_ms = event.get("expiration_at_ms")
    
    if expiration_ms:
        expiration_date = datetime.fromtimestamp(expiration_ms / 1000, tz=timezone.utc)
        
        await db.users.update_one(
            {"user_id": app_user_id},
            {"$set": {
                "subscription_status": "active",
                "iap_expires_at": expiration_date.isoformat()
            }}
        )
        
        logging.info(f"Renewal processed: {app_user_id}")


async def handle_cancellation(event: dict, app_user_id: str):
    """Handle subscription cancellation"""
    await db.users.update_one(
        {"user_id": app_user_id},
        {"$set": {
            "subscription_status": "cancelled"
        }}
    )
    
    logging.info(f"Cancellation processed: {app_user_id}")


async def handle_expiration(event: dict, app_user_id: str):
    """Handle subscription expiration"""
    await db.users.update_one(
        {"user_id": app_user_id},
        {"$set": {
            "subscription_tier": "none",
            "subscription_status": "expired",
            "iap_expires_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    logging.info(f"Expiration processed: {app_user_id}")


async def handle_billing_issue(event: dict, app_user_id: str):
    """Handle billing issues (payment failed)"""
    await db.users.update_one(
        {"user_id": app_user_id},
        {"$set": {
            "subscription_status": "billing_issue"
        }}
    )
    
    logging.info(f"Billing issue recorded: {app_user_id}")


@router.get("/products")
async def get_iap_products():
    """Get available In-App Purchase products"""
    return {
        "products": [
            {
                "product_id": "fitmaxpro_standard_monthly",
                "name": "Standard Mensuel",
                "price": "6.99",
                "currency": "EUR",
                "tier": "standard",
                "billing": "monthly"
            },
            {
                "product_id": "fitmaxpro_standard_annual",
                "name": "Standard Annuel",
                "price": "69.99",
                "currency": "EUR",
                "tier": "standard",
                "billing": "annual"
            },
            {
                "product_id": "fitmaxpro_vip_monthly",
                "name": "VIP Mensuel",
                "price": "9.99",
                "currency": "EUR",
                "tier": "vip",
                "billing": "monthly"
            },
            {
                "product_id": "fitmaxpro_vip_annual",
                "name": "VIP Annuel",
                "price": "99.99",
                "currency": "EUR",
                "tier": "vip",
                "billing": "annual"
            }
        ]
    }


# Admin routes
@router.get("/admin/events")
async def admin_get_iap_events(admin: User = Depends(verify_admin)):
    """Admin: Get all IAP webhook events"""
    events = await db.iap_events.find(
        {},
        {"_id": 0, "raw_event": 0}
    ).sort("received_at", -1).to_list(100)
    
    return {"events": events}


@router.get("/admin/subscribers")
async def admin_get_iap_subscribers(admin: User = Depends(verify_admin)):
    """Admin: Get all users with active IAP subscriptions"""
    users = await db.users.find(
        {"iap_product_id": {"$exists": True, "$ne": None}},
        {"_id": 0, "password": 0}
    ).to_list(200)
    
    return {"subscribers": users}
