"""
FitMaxPro - Shared Configuration
Central configuration for all app settings and environment variables.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv
import os

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB Connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe Configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')
STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# Email Configuration (Resend)
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# App Configuration
APP_URL = os.environ.get('APP_URL', 'https://fitmax-gains.preview.emergentagent.com')
SECRET_KEY = os.environ.get('SECRET_KEY', 'fitmaxpro-secret-key-change-in-production')

# LiveKit WebRTC Configuration
LIVEKIT_URL = os.environ.get('LIVEKIT_URL', '')
LIVEKIT_API_KEY = os.environ.get('LIVEKIT_API_KEY', '')
LIVEKIT_API_SECRET = os.environ.get('LIVEKIT_API_SECRET', '')

# RevenueCat (In-App Purchases)
REVENUECAT_API_KEY = os.environ.get('REVENUECAT_API_KEY', '')

# VAPID Keys for Push Notifications
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY', 'Bmw7bEZI0X6QZkQQJ1Y9TWFU7h_sA_Tz5t8mKlkMfms')
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY', 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U')
VAPID_CLAIMS = {"sub": "mailto:admin@fitmaxpro.com"}
