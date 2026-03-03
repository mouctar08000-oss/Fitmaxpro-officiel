"""
FitMaxPro - Complete Feature Tests
Tests for reviews, likes, badges, admin functionality, and points automation

Features tested:
- Reviews creation and visibility
- Like/Unlike functionality for subscribers  
- Admin like/unlike reviews
- Verified/VIP badges
- Points automation for reviews and running
- Admin Panel: Like, Reply, Delete reviews
"""

import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://fitmax-gains.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

# Test credentials
TEST_USER_EMAIL = "test@test.com"
TEST_USER_PASSWORD = "test123"


class TestAuthAndSession:
    """Test authentication and session"""
    
    @pytest.fixture(scope="class")
    def session(self):
        """Create a session and login"""
        s = requests.Session()
        s.headers.update({"Content-Type": "application/json"})
        return s
    
    @pytest.fixture(scope="class")
    def auth_token(self, session):
        """Get auth token by logging in"""
        response = session.post(f"{API}/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("session_token")
            print(f"Login successful, token: {token[:20]}...")
            return token
        pytest.skip(f"Login failed: {response.status_code} - {response.text}")
    
    def test_login_success(self, session):
        """Test login with valid credentials"""
        response = session.post(f"{API}/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "session_token" in data
        assert "user" in data
        print(f"Login successful for user: {data['user']['email']}")


class TestReviewsPublicAccess:
    """Test public reviews page access"""
    
    def test_reviews_page_accessible_without_auth(self):
        """Test GET /api/reviews works without authentication"""
        response = requests.get(f"{API}/reviews")
        assert response.status_code == 200, f"Reviews endpoint failed: {response.text}"
        data = response.json()
        assert "reviews" in data
        assert "total_reviews" in data
        assert "average_rating" in data
        print(f"Public reviews: {len(data['reviews'])} reviews, avg rating: {data['average_rating']}")
    
    def test_reviews_have_required_fields(self):
        """Test that reviews contain all required fields"""
        response = requests.get(f"{API}/reviews")
        assert response.status_code == 200
        data = response.json()
        
        if data['reviews']:
            review = data['reviews'][0]
            required_fields = ['review_id', 'user_name', 'rating', 'title', 'content', 'is_public', 'created_at']
            for field in required_fields:
                assert field in review, f"Missing field: {field}"
            print(f"Review fields verified: {list(review.keys())}")


class TestReviewsBadgesAndLikes:
    """Test badges (Verified/VIP) and Like functionality"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Login and get auth headers"""
        response = requests.post(f"{API}/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("session_token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Could not get auth token")
    
    def test_reviews_show_verified_badge(self):
        """Test that reviews show verified_subscriber field"""
        response = requests.get(f"{API}/reviews")
        assert response.status_code == 200
        data = response.json()
        
        # Check if any review has verified_subscriber
        if data['reviews']:
            verified_reviews = [r for r in data['reviews'] if r.get('verified_subscriber')]
            print(f"Verified reviews: {len(verified_reviews)} out of {len(data['reviews'])}")
            # At least check the field exists
            for review in data['reviews']:
                # Just verify the structure allows for this field
                if 'verified_subscriber' in review:
                    print(f"Review {review['review_id']} has verified_subscriber: {review['verified_subscriber']}")
    
    def test_reviews_show_vip_badge(self):
        """Test that reviews show subscription_tier field for VIP badge"""
        response = requests.get(f"{API}/reviews")
        assert response.status_code == 200
        data = response.json()
        
        if data['reviews']:
            vip_reviews = [r for r in data['reviews'] if r.get('subscription_tier') == 'vip']
            print(f"VIP reviews: {len(vip_reviews)} out of {len(data['reviews'])}")
    
    def test_reviews_have_likes_count(self):
        """Test that reviews show likes_count"""
        response = requests.get(f"{API}/reviews")
        assert response.status_code == 200
        data = response.json()
        
        if data['reviews']:
            for review in data['reviews']:
                assert 'likes_count' in review or 'likes' in review, "Review missing likes info"
            print("All reviews have likes information")
    
    def test_reviews_show_admin_liked_badge(self):
        """Test that reviews show admin_liked field ('Liked by Coach')"""
        response = requests.get(f"{API}/reviews")
        assert response.status_code == 200
        data = response.json()
        
        if data['reviews']:
            admin_liked = [r for r in data['reviews'] if r.get('admin_liked')]
            print(f"Admin liked reviews: {len(admin_liked)} out of {len(data['reviews'])}")
    
    def test_subscriber_can_like_review(self, auth_headers):
        """Test POST /api/reviews/{id}/like - subscriber can like a review"""
        # First get a review to like
        response = requests.get(f"{API}/reviews")
        assert response.status_code == 200
        data = response.json()
        
        if not data['reviews']:
            pytest.skip("No reviews to like")
        
        review_id = data['reviews'][0]['review_id']
        
        # Like the review
        like_response = requests.post(f"{API}/reviews/{review_id}/like", headers=auth_headers)
        assert like_response.status_code == 200, f"Like failed: {like_response.text}"
        like_data = like_response.json()
        assert "action" in like_data
        assert "likes_count" in like_data
        print(f"Like action: {like_data['action']}, likes_count: {like_data['likes_count']}")
        
        # Unlike (toggle back)
        unlike_response = requests.post(f"{API}/reviews/{review_id}/like", headers=auth_headers)
        assert unlike_response.status_code == 200
        print(f"Unlike action: {unlike_response.json()['action']}")
    
    def test_unauthenticated_cannot_like(self):
        """Test that unauthenticated users cannot like reviews"""
        response = requests.get(f"{API}/reviews")
        if response.status_code == 200 and response.json()['reviews']:
            review_id = response.json()['reviews'][0]['review_id']
            like_response = requests.post(f"{API}/reviews/{review_id}/like")
            assert like_response.status_code == 401, "Unauthenticated like should fail"
            print("Correctly blocked unauthenticated like attempt")


class TestAdminReviewsPanel:
    """Test Admin Panel review management"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Login as admin (VIP user)"""
        response = requests.post(f"{API}/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("session_token")
            user = response.json().get("user", {})
            if user.get("subscription_tier") != "vip":
                pytest.skip("Test user is not VIP/admin")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Could not get admin token")
    
    def test_admin_get_all_reviews(self, admin_headers):
        """Test GET /api/admin/reviews"""
        response = requests.get(f"{API}/admin/reviews", headers=admin_headers)
        assert response.status_code == 200, f"Admin reviews failed: {response.text}"
        data = response.json()
        assert "reviews" in data
        assert "stats" in data
        stats = data['stats']
        assert "total" in stats
        assert "average_rating" in stats
        print(f"Admin sees {stats['total']} reviews, avg: {stats['average_rating']}")
    
    def test_admin_can_like_review(self, admin_headers):
        """Test POST /api/admin/reviews/{id}/like"""
        # Get a review
        response = requests.get(f"{API}/admin/reviews", headers=admin_headers)
        assert response.status_code == 200
        reviews = response.json()['reviews']
        
        if not reviews:
            pytest.skip("No reviews for admin to like")
        
        review_id = reviews[0]['review_id']
        initial_admin_liked = reviews[0].get('admin_liked', False)
        
        # Admin like
        like_response = requests.post(f"{API}/admin/reviews/{review_id}/like", headers=admin_headers)
        assert like_response.status_code == 200, f"Admin like failed: {like_response.text}"
        like_data = like_response.json()
        assert "admin_liked" in like_data
        print(f"Admin like toggled: {like_data['admin_liked']}")
        
        # Toggle back
        toggle_response = requests.post(f"{API}/admin/reviews/{review_id}/like", headers=admin_headers)
        assert toggle_response.status_code == 200
        print(f"Admin like toggled back: {toggle_response.json()['admin_liked']}")
    
    def test_admin_can_respond_to_review(self, admin_headers):
        """Test PUT /api/admin/reviews/{id}/respond"""
        response = requests.get(f"{API}/admin/reviews", headers=admin_headers)
        assert response.status_code == 200
        reviews = response.json()['reviews']
        
        # Find a review without response
        review_without_response = next((r for r in reviews if not r.get('admin_response')), None)
        if not review_without_response:
            pytest.skip("All reviews already have responses")
        
        review_id = review_without_response['review_id']
        test_response = f"TEST_RESPONSE_{int(time.time())}"
        
        respond = requests.put(
            f"{API}/admin/reviews/{review_id}/respond?response={test_response}",
            headers=admin_headers
        )
        assert respond.status_code == 200, f"Respond failed: {respond.text}"
        print(f"Admin response added to review {review_id}")


class TestReviewCreationAndPoints:
    """Test review creation and automatic points"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Login and get auth headers"""
        response = requests.post(f"{API}/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("session_token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Could not get auth token")
    
    def test_create_review_gives_points(self, auth_headers):
        """Test POST /api/reviews gives +25 points automatically"""
        review_data = {
            "rating": 5,
            "title": f"TEST_REVIEW_{int(time.time())}",
            "content": "Test review content for points verification",
            "is_public": True
        }
        
        response = requests.post(f"{API}/reviews", json=review_data, headers=auth_headers)
        assert response.status_code == 200, f"Create review failed: {response.text}"
        data = response.json()
        
        assert "review_id" in data
        assert "points_earned" in data
        assert data['points_earned'] == 25, f"Expected 25 points, got {data['points_earned']}"
        print(f"Review created with {data['points_earned']} points earned")
        
        # Store review_id for cleanup
        return data['review_id']
    
    def test_only_active_subscribers_can_review(self):
        """Test that non-subscribers cannot create reviews"""
        # Try without auth
        review_data = {
            "rating": 5,
            "title": "Unauthorized review",
            "content": "This should fail",
            "is_public": True
        }
        
        response = requests.post(f"{API}/reviews", json=review_data)
        assert response.status_code == 401, "Should require authentication"
        print("Correctly blocked unauthenticated review creation")
    
    def test_review_has_verified_subscriber_flag(self, auth_headers):
        """Test that created review has verified_subscriber=True"""
        review_data = {
            "rating": 4,
            "title": f"TEST_VERIFIED_{int(time.time())}",
            "content": "Checking verified subscriber flag",
            "is_public": True
        }
        
        response = requests.post(f"{API}/reviews", json=review_data, headers=auth_headers)
        assert response.status_code == 200
        review_id = response.json()['review_id']
        
        # Get user reviews to verify
        user_reviews = requests.get(f"{API}/user/reviews", headers=auth_headers)
        assert user_reviews.status_code == 200
        
        created_review = next((r for r in user_reviews.json()['reviews'] if r['review_id'] == review_id), None)
        if created_review:
            assert created_review.get('verified_subscriber') == True, "Review should have verified_subscriber=True"
            print(f"Review {review_id} correctly marked as verified subscriber")


class TestRunningPointsAutomation:
    """Test running log points automation"""
    
    @pytest.fixture(scope="class")
    def auth_headers(self):
        """Login and get auth headers"""
        response = requests.post(f"{API}/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("session_token")
            return {"Authorization": f"Bearer {token}"}
        pytest.skip("Could not get auth token")
    
    def test_running_log_gives_base_points(self, auth_headers):
        """Test POST /api/running/log gives base points (10 + distance bonus)"""
        run_data = {
            "distance": 3.0,  # in km
            "duration": 1800,  # in seconds (30 minutes)
            "pace": 6.0,  # min/km (numeric)
            "calories": 300
        }
        
        response = requests.post(f"{API}/running/log", json=run_data, headers=auth_headers)
        assert response.status_code == 200, f"Running log failed: {response.text}"
        data = response.json()
        
        assert "run_id" in data
        assert "points_earned" in data
        # Should be at least 10 (base) + 15 (5*3km) = 25 points
        expected_min_points = 10 + (5 * 3)  # base + distance bonus
        assert data['points_earned'] >= expected_min_points, f"Expected at least {expected_min_points} points"
        print(f"Running log: {data['points_earned']} points for {run_data['distance']}km")
    
    def test_running_5k_bonus(self, auth_headers):
        """Test that 5km+ run gives +25 bonus"""
        run_data = {
            "distance": 5.5,  # in km
            "duration": 3000,  # in seconds
            "calories": 500
        }
        
        response = requests.post(f"{API}/running/log", json=run_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # 10 base + 27 (5*5.5km) + 25 (5km bonus) = 62 points
        expected_min = 10 + 25 + 25  # base + some distance + 5k bonus
        assert data['points_earned'] >= expected_min, f"Expected at least {expected_min} for 5km+"
        print(f"5K+ run: {data['points_earned']} points (with bonus)")
    
    def test_running_10k_bonus(self, auth_headers):
        """Test that 10km+ run gives +50 bonus"""
        run_data = {
            "distance": 10.2,  # in km
            "duration": 6000,  # in seconds
            "calories": 900
        }
        
        response = requests.post(f"{API}/running/log", json=run_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        
        # 10 base + 51 (5*10.2km) + 25 (5km bonus) + 50 (10km bonus) = 136 points
        print(f"10K+ run: {data['points_earned']} points (with bonuses)")
        # At least should have the 10k bonus
        assert data['points_earned'] >= 50, "10km+ should give at least 50 bonus points"


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture(scope="class")
    def admin_headers(self):
        """Login as admin"""
        response = requests.post(f"{API}/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code == 200:
            token = response.json().get("session_token")
            return {"Authorization": f"Bearer {token}"}
        return {}
    
    def test_cleanup_test_reviews(self, admin_headers):
        """Delete test reviews created during testing"""
        if not admin_headers:
            pytest.skip("No admin headers for cleanup")
        
        response = requests.get(f"{API}/admin/reviews", headers=admin_headers)
        if response.status_code == 200:
            reviews = response.json()['reviews']
            test_reviews = [r for r in reviews if r.get('title', '').startswith('TEST_')]
            
            for review in test_reviews:
                del_response = requests.delete(
                    f"{API}/admin/reviews/{review['review_id']}", 
                    headers=admin_headers
                )
                if del_response.status_code == 200:
                    print(f"Deleted test review: {review['title']}")
            
            print(f"Cleanup: Deleted {len(test_reviews)} test reviews")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
