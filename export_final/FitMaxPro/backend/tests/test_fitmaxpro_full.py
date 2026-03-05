"""
FitMaxPro Full API Test Suite
Tests: Auth, Reviews, Social Links, Workouts (abs), Routines (warmup), Inactivity Alerts
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://fitmax-gains.preview.emergentagent.com')
if BASE_URL.endswith('/'):
    BASE_URL = BASE_URL[:-1]

# Session token created via mongosh for admin user
ADMIN_SESSION_TOKEN = "admin_test_session_1772529324426"


@pytest.fixture(scope="module")
def api_client():
    """Base API client"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_client(api_client):
    """Authenticated client with admin session"""
    api_client.headers.update({
        "Authorization": f"Bearer {ADMIN_SESSION_TOKEN}"
    })
    return api_client


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_auth_me_with_valid_token(self, auth_client):
        """Test /api/auth/me returns user data"""
        response = auth_client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert data["subscription_tier"] == "vip"
        print(f"✓ Auth me: User {data['email']} authenticated with {data['subscription_tier']} tier")
    
    def test_auth_me_without_token(self, api_client):
        """Test /api/auth/me returns 401 without token"""
        # Create a fresh client without auth
        client = requests.Session()
        response = client.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Auth me: Returns 401 without token")


class TestWorkoutsAbsProgram:
    """Test workouts with abs program_type"""
    
    def test_get_abs_workouts_french(self, api_client):
        """Test GET /api/workouts?program_type=abs&language=fr"""
        response = api_client.get(f"{BASE_URL}/api/workouts?program_type=abs&language=fr")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3, f"Expected at least 3 abs workouts, got {len(data)}"
        
        # Verify workout structure
        if data:
            workout = data[0]
            assert "workout_id" in workout
            assert "title" in workout
            assert "exercises" in workout
            assert workout["program_type"] == "abs"
            print(f"✓ GET abs workouts (FR): {len(data)} workouts found")
            for w in data:
                print(f"   - {w['title']} ({w['level']})")
    
    def test_get_abs_workouts_english(self, api_client):
        """Test GET /api/workouts?program_type=abs&language=en"""
        response = api_client.get(f"{BASE_URL}/api/workouts?program_type=abs&language=en")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 3, f"Expected at least 3 abs workouts (EN), got {len(data)}"
        print(f"✓ GET abs workouts (EN): {len(data)} workouts found")


class TestRoutinesWarmup:
    """Test warmup routines with video URLs"""
    
    def test_get_warmup_routine_french(self, api_client):
        """Test GET /api/routines/warmup?language=fr returns exercises with video_url"""
        response = api_client.get(f"{BASE_URL}/api/routines/warmup?language=fr")
        assert response.status_code == 200
        data = response.json()
        
        assert "exercises" in data
        exercises = data["exercises"]
        assert len(exercises) >= 5, f"Expected at least 5 warmup exercises, got {len(exercises)}"
        
        # Check video URLs
        exercises_with_video = [e for e in exercises if e.get("video_url")]
        assert len(exercises_with_video) >= 5, f"Expected at least 5 exercises with video_url, got {len(exercises_with_video)}"
        
        print(f"✓ GET warmup (FR): {len(exercises)} exercises, {len(exercises_with_video)} with videos")
        for e in exercises[:3]:
            print(f"   - {e['name']}: {e.get('video_url', 'N/A')}")
    
    def test_warmup_video_urls_are_youtube(self, api_client):
        """Test that warmup video URLs are valid YouTube embed URLs"""
        response = api_client.get(f"{BASE_URL}/api/routines/warmup?language=fr")
        assert response.status_code == 200
        data = response.json()
        
        for exercise in data.get("exercises", []):
            video_url = exercise.get("video_url", "")
            if video_url:
                assert "youtube.com/embed" in video_url, f"Invalid YouTube URL: {video_url}"
        
        print("✓ All warmup video URLs are valid YouTube embed URLs")


class TestReviewsEndpoints:
    """Test reviews POST and GET"""
    
    def test_get_reviews_public(self, api_client):
        """Test GET /api/reviews returns public reviews"""
        response = api_client.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert "reviews" in data
        assert "total_reviews" in data
        assert "average_rating" in data
        print(f"✓ GET reviews: {data['total_reviews']} reviews, avg rating {data['average_rating']}")
    
    def test_post_review_authenticated(self, auth_client):
        """Test POST /api/reviews creates a new review"""
        review_data = {
            "rating": 5,
            "title": "Excellent programme test!",
            "content": "Test review from pytest - très bon programme de fitness",
            "is_public": True
        }
        response = auth_client.post(f"{BASE_URL}/api/reviews", json=review_data)
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        data = response.json()
        assert "review_id" in data or "message" in data
        print(f"✓ POST review: Review created successfully")
    
    def test_post_review_unauthenticated(self, api_client):
        """Test POST /api/reviews returns 401 without auth"""
        client = requests.Session()
        review_data = {
            "rating": 5,
            "title": "Test",
            "content": "Test content"
        }
        response = client.post(f"{BASE_URL}/api/reviews", json=review_data)
        assert response.status_code == 401
        print("✓ POST review: Returns 401 without auth")
    
    def test_get_reviews_after_post(self, api_client):
        """Test GET /api/reviews includes the new review"""
        response = api_client.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert data["total_reviews"] >= 1, "Expected at least 1 review after POST"
        print(f"✓ GET reviews after POST: {data['total_reviews']} reviews found")


class TestSocialLinksEndpoints:
    """Test social links GET and PUT"""
    
    def test_get_social_links(self, api_client):
        """Test GET /api/social-links returns links"""
        response = api_client.get(f"{BASE_URL}/api/social-links")
        assert response.status_code == 200
        data = response.json()
        assert "links" in data or "type" in data
        print(f"✓ GET social-links: {data}")
    
    def test_put_social_links_authenticated(self, auth_client):
        """Test PUT /api/admin/social-links updates links"""
        social_data = {
            "instagram": "https://instagram.com/fitmaxpro",
            "youtube": "https://youtube.com/@fitmaxpro",
            "tiktok": "https://tiktok.com/@fitmaxpro",
            "snapchat": "",
            "facebook": "https://facebook.com/fitmaxpro"
        }
        response = auth_client.put(f"{BASE_URL}/api/admin/social-links", json=social_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ PUT social-links: Updated successfully")
    
    def test_get_social_links_after_update(self, api_client):
        """Test GET /api/social-links returns updated links"""
        response = api_client.get(f"{BASE_URL}/api/social-links")
        assert response.status_code == 200
        data = response.json()
        links = data.get("links", {})
        assert links.get("instagram") == "https://instagram.com/fitmaxpro"
        print(f"✓ GET social-links after update: Instagram = {links.get('instagram')}")


class TestInactivityAlerts:
    """Test inactivity alerts endpoint"""
    
    def test_send_inactivity_alerts(self, auth_client):
        """Test POST /api/admin/send-inactivity-alerts"""
        response = auth_client.post(f"{BASE_URL}/api/admin/send-inactivity-alerts?days_threshold=3")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "sent" in data or "message" in data
        print(f"✓ POST send-inactivity-alerts: {data}")
    
    def test_send_inactivity_alerts_unauthenticated(self, api_client):
        """Test POST /api/admin/send-inactivity-alerts returns 401 without auth"""
        client = requests.Session()
        response = client.post(f"{BASE_URL}/api/admin/send-inactivity-alerts?days_threshold=3")
        assert response.status_code == 401
        print("✓ POST send-inactivity-alerts: Returns 401 without auth")


class TestAdminReviews:
    """Test admin reviews endpoints"""
    
    def test_admin_get_all_reviews(self, auth_client):
        """Test GET /api/admin/reviews returns all reviews"""
        response = auth_client.get(f"{BASE_URL}/api/admin/reviews")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "reviews" in data
        print(f"✓ GET admin/reviews: {len(data['reviews'])} reviews found")


class TestAdminWarmupStretching:
    """Test admin warmup/stretching management"""
    
    def test_admin_get_routines(self, auth_client):
        """Test GET /api/admin/routines returns all routines"""
        response = auth_client.get(f"{BASE_URL}/api/admin/routines")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "routines" in data
        routines = data["routines"]
        assert len(routines) >= 4, f"Expected at least 4 routines, got {len(routines)}"
        
        routine_ids = [r.get("routine_id") for r in routines]
        assert "warmup_fr" in routine_ids
        assert "warmup_en" in routine_ids
        assert "stretching_fr" in routine_ids
        assert "stretching_en" in routine_ids
        print(f"✓ GET admin/routines: {len(routines)} routines found")
        for r in routines:
            print(f"   - {r['routine_id']}: {len(r.get('exercises', []))} exercises")


class TestUserProgress:
    """Test user progress/evolution endpoint"""
    
    def test_user_evolution(self, auth_client):
        """Test GET /api/user/evolution returns user stats"""
        response = auth_client.get(f"{BASE_URL}/api/user/evolution")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "stats" in data or "evolution" in data or "daily" in data
        print(f"✓ GET user/evolution: Data received")
        if "stats" in data:
            print(f"   Stats: {data['stats']}")


class TestAdminSubscribers:
    """Test admin coaching/subscribers endpoints"""
    
    def test_admin_get_all_subscribers_evolution(self, auth_client):
        """Test GET /api/admin/all-subscribers-evolution"""
        response = auth_client.get(f"{BASE_URL}/api/admin/all-subscribers-evolution")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "subscribers" in data
        print(f"✓ GET admin/all-subscribers-evolution: {len(data['subscribers'])} subscribers")


class TestAdminProgressPhotos:
    """Test admin before/after photos endpoint"""
    
    def test_admin_get_progress_photos(self, auth_client):
        """Test GET /api/admin/progress-photos"""
        response = auth_client.get(f"{BASE_URL}/api/admin/progress-photos")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "users" in data
        print(f"✓ GET admin/progress-photos: {len(data['users'])} users with photos")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
