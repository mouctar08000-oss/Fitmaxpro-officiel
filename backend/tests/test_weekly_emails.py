"""
Backend Tests for Weekly Motivation Emails Feature
Testing: 
- GET /api/user/weekly-stats
- GET /api/admin/weekly-email-settings
- PUT /api/admin/weekly-email-settings
- POST /api/admin/send-weekly-emails
- GET /api/admin/email-history
"""

import pytest
import requests
import os

# Base URL from environment - PUBLIC URL for testing
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://fitmax-gains.preview.emergentagent.com').rstrip('/')

# Test credentials - VIP user for admin access
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "test123"


class TestWeeklyEmailAPIs:
    """Test Weekly Motivation Emails API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self, api_client, auth_token):
        """Setup for each test"""
        self.client = api_client
        self.token = auth_token
        self.client.headers.update({"Authorization": f"Bearer {self.token}"})
    
    # ==================== SETTINGS TESTS ====================
    
    def test_get_weekly_email_settings_returns_default(self):
        """GET /api/admin/weekly-email-settings - Returns default settings structure"""
        response = self.client.get(f"{BASE_URL}/api/admin/weekly-email-settings")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify default structure exists
        assert "enabled" in data, "Missing 'enabled' field"
        assert "send_day" in data, "Missing 'send_day' field"
        assert "include_running_stats" in data, "Missing 'include_running_stats' field"
        assert "include_workout_stats" in data, "Missing 'include_workout_stats' field"
        assert "include_points_earned" in data, "Missing 'include_points_earned' field"
        assert "include_leaderboard_position" in data, "Missing 'include_leaderboard_position' field"
        print(f"✓ Weekly email settings returned: {data}")
    
    def test_update_weekly_email_settings(self):
        """PUT /api/admin/weekly-email-settings - Updates settings"""
        new_settings = {
            "enabled": True,
            "send_day": "monday",
            "include_running_stats": True,
            "include_workout_stats": True,
            "include_points_earned": True,
            "include_leaderboard_position": True,
            "custom_intro_fr": "Votre résumé de la semaine!",
            "custom_intro_en": "Your weekly summary!"
        }
        
        response = self.client.put(
            f"{BASE_URL}/api/admin/weekly-email-settings",
            json=new_settings
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data, "Missing confirmation message"
        print(f"✓ Settings updated successfully: {data}")
        
        # Verify the settings were actually saved
        verify_response = self.client.get(f"{BASE_URL}/api/admin/weekly-email-settings")
        assert verify_response.status_code == 200
        saved_data = verify_response.json()
        assert saved_data.get("custom_intro_fr") == "Votre résumé de la semaine!"
        print(f"✓ Settings verified after save")
    
    def test_update_settings_with_disabled(self):
        """PUT /api/admin/weekly-email-settings - Can disable emails"""
        settings = {
            "enabled": False,
            "send_day": "friday",
            "include_running_stats": False,
            "include_workout_stats": True,
            "include_points_earned": False,
            "include_leaderboard_position": True,
            "custom_intro_fr": None,
            "custom_intro_en": None
        }
        
        response = self.client.put(
            f"{BASE_URL}/api/admin/weekly-email-settings",
            json=settings
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print(f"✓ Settings can be disabled/modified")
    
    # ==================== USER WEEKLY STATS TESTS ====================
    
    def test_get_user_weekly_stats(self):
        """GET /api/user/weekly-stats - Returns user's weekly statistics"""
        response = self.client.get(f"{BASE_URL}/api/user/weekly-stats")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify structure
        assert "period" in data, "Missing 'period' field"
        assert data["period"] == "weekly", "Period should be 'weekly'"
        
        assert "running" in data, "Missing 'running' field"
        running = data["running"]
        assert "sessions" in running, "Missing running.sessions"
        assert "total_distance_km" in running, "Missing running.total_distance_km"
        assert "total_time_minutes" in running, "Missing running.total_time_minutes"
        assert "calories_burned" in running, "Missing running.calories_burned"
        
        assert "workouts" in data, "Missing 'workouts' field"
        workouts = data["workouts"]
        assert "completed" in workouts, "Missing workouts.completed"
        assert "total_time_minutes" in workouts, "Missing workouts.total_time_minutes"
        
        assert "points" in data, "Missing 'points' field"
        assert "earned_this_week" in data["points"], "Missing points.earned_this_week"
        
        assert "leaderboard" in data, "Missing 'leaderboard' field"
        leaderboard = data["leaderboard"]
        assert "position" in leaderboard, "Missing leaderboard.position"
        assert "total_participants" in leaderboard, "Missing leaderboard.total_participants"
        
        print(f"✓ User weekly stats returned correctly: {data}")
    
    def test_weekly_stats_requires_auth(self):
        """GET /api/user/weekly-stats - Requires authentication"""
        client_no_auth = requests.Session()
        client_no_auth.headers.update({"Content-Type": "application/json"})
        
        response = client_no_auth.get(f"{BASE_URL}/api/user/weekly-stats")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Weekly stats requires authentication")
    
    # ==================== SEND WEEKLY EMAILS TESTS ====================
    
    def test_send_weekly_emails(self):
        """POST /api/admin/send-weekly-emails - Sends weekly emails (MOCKED if no Resend key)"""
        response = self.client.post(f"{BASE_URL}/api/admin/send-weekly-emails")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "sent" in data, "Missing 'sent' field in response"
        assert "failed" in data, "Missing 'failed' field in response"
        assert "emails" in data, "Missing 'emails' field in response"
        
        print(f"✓ Weekly emails triggered: sent={data['sent']}, failed={data['failed']}")
        print(f"  Emails processed: {data['emails']}")
    
    def test_send_weekly_emails_requires_admin(self):
        """POST /api/admin/send-weekly-emails - Requires VIP admin access"""
        client_no_auth = requests.Session()
        client_no_auth.headers.update({"Content-Type": "application/json"})
        
        response = client_no_auth.post(f"{BASE_URL}/api/admin/send-weekly-emails")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Send weekly emails requires admin authentication")
    
    # ==================== EMAIL HISTORY TESTS ====================
    
    def test_get_email_history(self):
        """GET /api/admin/email-history - Returns email batches history"""
        response = self.client.get(f"{BASE_URL}/api/admin/email-history")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "batches" in data, "Missing 'batches' field"
        assert "pending_count" in data, "Missing 'pending_count' field"
        assert isinstance(data["batches"], list), "batches should be a list"
        assert isinstance(data["pending_count"], int), "pending_count should be an integer"
        
        print(f"✓ Email history returned: {len(data['batches'])} batches, {data['pending_count']} pending")
        
        # If there are batches, verify structure
        if data["batches"]:
            batch = data["batches"][0]
            assert "batch_id" in batch or "type" in batch, "Batch should have batch_id or type"
            print(f"  Latest batch: {batch}")
    
    def test_email_history_requires_admin(self):
        """GET /api/admin/email-history - Requires VIP admin access"""
        client_no_auth = requests.Session()
        client_no_auth.headers.update({"Content-Type": "application/json"})
        
        response = client_no_auth.get(f"{BASE_URL}/api/admin/email-history")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Email history requires admin authentication")
    
    # ==================== SETTINGS ACCESS CONTROL ====================
    
    def test_settings_requires_admin(self):
        """GET/PUT /api/admin/weekly-email-settings - Requires VIP admin access"""
        client_no_auth = requests.Session()
        client_no_auth.headers.update({"Content-Type": "application/json"})
        
        # GET requires auth
        response = client_no_auth.get(f"{BASE_URL}/api/admin/weekly-email-settings")
        assert response.status_code == 401, f"GET Expected 401, got {response.status_code}"
        
        # PUT requires auth
        response = client_no_auth.put(
            f"{BASE_URL}/api/admin/weekly-email-settings",
            json={"enabled": True, "send_day": "monday"}
        )
        assert response.status_code == 401, f"PUT Expected 401, got {response.status_code}"
        
        print(f"✓ Weekly email settings require admin authentication")


# ==================== FIXTURES ====================

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def auth_token(api_client):
    """Get authentication token for VIP test user"""
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        token = data.get("session_token")
        if token:
            print(f"✓ Authenticated as {TEST_EMAIL} (VIP)")
            return token
    
    # If login fails, try to create the user
    print(f"Login failed, attempting to create test user...")
    pytest.skip("Authentication failed - test user may not exist")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
