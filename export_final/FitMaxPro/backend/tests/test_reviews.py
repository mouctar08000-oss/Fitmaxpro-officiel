"""
Test suite for Reviews feature in FitMaxPro
Tests: GET /api/reviews, POST /api/reviews, GET /api/admin/reviews
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://fitmax-gains.preview.emergentagent.com').rstrip('/')

# Test credentials - VIP user for testing
TEST_USER_EMAIL = "test@test.com"
TEST_USER_PASSWORD = "test123"


class TestReviewsAPI:
    """Test Reviews API endpoints"""
    
    @pytest.fixture(scope="class")
    def session_token(self):
        """Login and get session token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "session_token" in data, "No session token in response"
        print(f"✅ Login successful - User: {data['user']['name']}, Tier: {data['user']['subscription_tier']}")
        return data["session_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, session_token):
        """Auth headers for authenticated requests"""
        return {"Authorization": f"Bearer {session_token}"}
    
    # ==================== PUBLIC ENDPOINTS ====================
    
    def test_get_public_reviews_no_auth(self):
        """GET /api/reviews - Returns public reviews without authentication"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "reviews" in data, "Response should contain 'reviews' key"
        assert "total_reviews" in data, "Response should contain 'total_reviews' key"
        assert "average_rating" in data, "Response should contain 'average_rating' key"
        
        # Verify data types
        assert isinstance(data["reviews"], list), "reviews should be a list"
        assert isinstance(data["total_reviews"], int), "total_reviews should be an int"
        assert isinstance(data["average_rating"], (int, float)), "average_rating should be numeric"
        
        # Verify reviews are public
        for review in data["reviews"]:
            assert review.get("is_public") == True, "All returned reviews should be public"
        
        print(f"✅ GET /api/reviews - Found {data['total_reviews']} reviews, avg rating: {data['average_rating']}")
    
    def test_reviews_contain_expected_fields(self):
        """Reviews should contain all expected fields"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        
        if data["reviews"]:
            review = data["reviews"][0]
            expected_fields = ["review_id", "user_id", "user_name", "rating", "title", "content", "is_public", "created_at"]
            for field in expected_fields:
                assert field in review, f"Review missing field: {field}"
            print(f"✅ Reviews contain all expected fields: {expected_fields}")
    
    # ==================== AUTHENTICATED ENDPOINTS ====================
    
    def test_create_review_success(self, auth_headers):
        """POST /api/reviews - Create a new review"""
        unique_id = str(uuid.uuid4())[:8]
        review_data = {
            "rating": 4,
            "title": f"TEST_Review_{unique_id}",
            "content": f"This is a test review created by pytest - {unique_id}",
            "is_public": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/reviews",
            json=review_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "message" in data, "Response should contain message"
        assert "review_id" in data, "Response should contain review_id"
        assert data["message"] == "Review created", "Unexpected message"
        
        print(f"✅ POST /api/reviews - Created review: {data['review_id']}")
        return data["review_id"]
    
    def test_create_review_private(self, auth_headers):
        """POST /api/reviews - Create a private review"""
        unique_id = str(uuid.uuid4())[:8]
        review_data = {
            "rating": 3,
            "title": f"TEST_PrivateReview_{unique_id}",
            "content": f"Private review - {unique_id}",
            "is_public": False
        }
        
        response = requests.post(
            f"{BASE_URL}/api/reviews",
            json=review_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "review_id" in data
        
        # Verify private review is NOT in public reviews
        public_response = requests.get(f"{BASE_URL}/api/reviews")
        public_reviews = public_response.json()["reviews"]
        
        review_ids = [r["review_id"] for r in public_reviews]
        assert data["review_id"] not in review_ids, "Private review should not appear in public list"
        
        print(f"✅ POST /api/reviews - Private review created and hidden from public: {data['review_id']}")
    
    def test_create_review_without_auth(self):
        """POST /api/reviews - Should fail without authentication"""
        review_data = {
            "rating": 5,
            "title": "Unauthorized review",
            "content": "This should fail",
            "is_public": True
        }
        
        response = requests.post(f"{BASE_URL}/api/reviews", json=review_data)
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ POST /api/reviews - Correctly returns 401 without authentication")
    
    def test_rating_validation(self, auth_headers):
        """POST /api/reviews - Rating should be clamped between 1-5"""
        # Test rating > 5
        review_data = {
            "rating": 10,
            "title": f"TEST_RatingOver5_{uuid.uuid4().hex[:6]}",
            "content": "Testing rating clamp",
            "is_public": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/reviews",
            json=review_data,
            headers=auth_headers
        )
        assert response.status_code == 200
        
        # Verify created review has rating clamped to 5
        reviews_response = requests.get(f"{BASE_URL}/api/reviews")
        reviews = reviews_response.json()["reviews"]
        created_review = next((r for r in reviews if r["title"] == review_data["title"]), None)
        if created_review:
            assert created_review["rating"] <= 5, "Rating should be clamped to max 5"
            print(f"✅ Rating validation - Rating clamped to {created_review['rating']}")
    
    # ==================== ADMIN ENDPOINTS ====================
    
    def test_admin_get_all_reviews(self, auth_headers):
        """GET /api/admin/reviews - Admin can see all reviews (public and private)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/reviews",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "reviews" in data, "Response should contain reviews"
        assert "stats" in data, "Response should contain stats"
        
        # Verify stats structure
        stats = data["stats"]
        assert "total" in stats, "Stats should contain total"
        assert "average_rating" in stats, "Stats should contain average_rating"
        assert "distribution" in stats, "Stats should contain distribution"
        
        # Check that admin can see private reviews
        private_count = len([r for r in data["reviews"] if not r.get("is_public")])
        print(f"✅ GET /api/admin/reviews - Found {len(data['reviews'])} reviews ({private_count} private)")
        print(f"   Stats: total={stats['total']}, avg_rating={stats['average_rating']}")
    
    def test_admin_reviews_without_auth(self):
        """GET /api/admin/reviews - Should fail without authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/reviews")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ GET /api/admin/reviews - Correctly returns 401 without authentication")
    
    # ==================== USER REVIEWS ====================
    
    def test_get_user_reviews(self, auth_headers):
        """GET /api/user/reviews - Get current user's reviews"""
        response = requests.get(
            f"{BASE_URL}/api/user/reviews",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "reviews" in data, "Response should contain reviews"
        assert isinstance(data["reviews"], list), "reviews should be a list"
        
        print(f"✅ GET /api/user/reviews - Found {len(data['reviews'])} reviews for current user")


class TestReviewsIntegration:
    """Integration tests for reviews flow"""
    
    @pytest.fixture(scope="class")
    def session_token(self):
        """Login and get session token"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_USER_EMAIL, "password": TEST_USER_PASSWORD}
        )
        assert response.status_code == 200
        return response.json()["session_token"]
    
    @pytest.fixture(scope="class")
    def auth_headers(self, session_token):
        return {"Authorization": f"Bearer {session_token}"}
    
    def test_full_review_flow(self, auth_headers):
        """Test complete review flow: create -> verify in list -> admin can see"""
        # 1. Create review
        unique_id = str(uuid.uuid4())[:8]
        review_data = {
            "rating": 5,
            "title": f"TEST_IntegrationReview_{unique_id}",
            "content": f"Integration test review - {unique_id}",
            "is_public": True
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/reviews",
            json=review_data,
            headers=auth_headers
        )
        assert create_response.status_code == 200
        review_id = create_response.json()["review_id"]
        print(f"Step 1: Created review {review_id}")
        
        # 2. Verify in public reviews
        public_response = requests.get(f"{BASE_URL}/api/reviews")
        assert public_response.status_code == 200
        public_reviews = public_response.json()["reviews"]
        
        found_review = next((r for r in public_reviews if r["review_id"] == review_id), None)
        assert found_review is not None, "Created review should appear in public list"
        assert found_review["title"] == review_data["title"]
        assert found_review["rating"] == review_data["rating"]
        print(f"Step 2: Review found in public list with correct data")
        
        # 3. Verify in admin reviews
        admin_response = requests.get(
            f"{BASE_URL}/api/admin/reviews",
            headers=auth_headers
        )
        assert admin_response.status_code == 200
        admin_reviews = admin_response.json()["reviews"]
        
        found_in_admin = next((r for r in admin_reviews if r["review_id"] == review_id), None)
        assert found_in_admin is not None, "Created review should appear in admin list"
        print(f"Step 3: Review found in admin list")
        
        # 4. Verify in user's reviews
        user_response = requests.get(
            f"{BASE_URL}/api/user/reviews",
            headers=auth_headers
        )
        assert user_response.status_code == 200
        user_reviews = user_response.json()["reviews"]
        
        found_in_user = next((r for r in user_reviews if r["review_id"] == review_id), None)
        assert found_in_user is not None, "Created review should appear in user's reviews"
        print(f"Step 4: Review found in user's reviews")
        
        print("✅ Full review flow test passed!")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
