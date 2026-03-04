"""
Test P2 Features: 
- Inactive users alerts system
- Annual subscription cancellation logic (12 month commitment)
- In-App Purchases preparation (RevenueCat)
- Subscriber likes on reviews
"""
import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test@test.com"
TEST_PASSWORD = "test123"


@pytest.fixture(scope="module")
def session():
    """Create a requests session"""
    return requests.Session()


@pytest.fixture(scope="module")
def auth_token(session):
    """Login and get auth token for VIP user"""
    response = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    if response.status_code == 200:
        data = response.json()
        return data.get("session_token")
    pytest.skip(f"Login failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(auth_token):
    """Auth headers for admin requests"""
    return {"Authorization": f"Bearer {auth_token}"}


# ==================== INACTIVE USERS API TESTS ====================

class TestInactiveUsersAPI:
    """Tests for /api/admin/inactive-users endpoints"""
    
    def test_get_inactive_users_7_days(self, session, auth_headers):
        """GET /api/admin/inactive-users - Get users inactive for 7+ days"""
        response = session.get(f"{BASE_URL}/api/admin/inactive-users?days=7", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "inactive_users" in data, "Response should have 'inactive_users' key"
        assert "total_count" in data, "Response should have 'total_count' key"
        assert "threshold_days" in data, "Response should have 'threshold_days' key"
        assert data["threshold_days"] == 7, "Threshold days should be 7"
        
        print(f"✓ Found {data['total_count']} inactive users (7+ days)")
        
        # If there are inactive users, validate structure
        if data["inactive_users"]:
            user = data["inactive_users"][0]
            assert "user_id" in user, "User should have user_id"
            assert "name" in user, "User should have name"
            assert "email" in user, "User should have email"
            assert "days_inactive" in user, "User should have days_inactive"
            print(f"✓ Inactive user structure validated: {user['name']} - {user['days_inactive']} days inactive")
    
    def test_get_inactive_users_3_days(self, session, auth_headers):
        """GET /api/admin/inactive-users - Get users inactive for 3+ days"""
        response = session.get(f"{BASE_URL}/api/admin/inactive-users?days=3", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["threshold_days"] == 3
        print(f"✓ Found {data['total_count']} inactive users (3+ days)")
    
    def test_get_inactive_users_14_days(self, session, auth_headers):
        """GET /api/admin/inactive-users - Get users inactive for 14+ days"""
        response = session.get(f"{BASE_URL}/api/admin/inactive-users?days=14", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["threshold_days"] == 14
        print(f"✓ Found {data['total_count']} inactive users (14+ days)")
    
    def test_get_inactive_users_30_days(self, session, auth_headers):
        """GET /api/admin/inactive-users - Get users inactive for 30+ days"""
        response = session.get(f"{BASE_URL}/api/admin/inactive-users?days=30", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["threshold_days"] == 30
        print(f"✓ Found {data['total_count']} inactive users (30+ days)")
    
    def test_get_inactive_users_requires_admin(self):
        """GET /api/admin/inactive-users - Requires VIP/admin access"""
        # Use fresh session without auth
        new_session = requests.Session()
        response = new_session.get(f"{BASE_URL}/api/admin/inactive-users?days=7")
        
        # Should fail without auth
        assert response.status_code == 401, f"Endpoint should require authentication, got {response.status_code}: {response.text[:200]}"
        print("✓ Inactive users endpoint properly requires authentication")
    
    def test_send_reminder_endpoint_exists(self, session, auth_headers):
        """POST /api/admin/inactive-users/send-reminder - Endpoint exists"""
        # Send to empty list - should work but send 0
        response = session.post(
            f"{BASE_URL}/api/admin/inactive-users/send-reminder",
            json=[],
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response
        assert "sent" in data, "Response should have 'sent' count"
        print(f"✓ Send reminder endpoint works - sent: {data.get('sent', 0)}")
    
    def test_send_reminder_with_user_ids(self, session, auth_headers):
        """POST /api/admin/inactive-users/send-reminder - With fake user IDs (MOCKED - stores in pending_emails)"""
        # Use fake user IDs - should handle gracefully
        fake_user_ids = ["fake_user_123", "fake_user_456"]
        
        response = session.post(
            f"{BASE_URL}/api/admin/inactive-users/send-reminder",
            json=fake_user_ids,
            headers=auth_headers
        )
        
        # Should return 200 but fail to send (users don't exist)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "sent" in data or "failed" in data
        print(f"✓ Send reminder handles non-existent users gracefully")


# ==================== SUBSCRIPTION CANCELLATION API TESTS ====================

class TestSubscriptionCancellationAPI:
    """Tests for subscription cancellation logic"""
    
    def test_can_cancel_endpoint(self, session, auth_headers):
        """GET /api/subscription/can-cancel - Check if cancellation is possible"""
        response = session.get(f"{BASE_URL}/api/subscription/can-cancel", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Response should have these fields
        assert "can_cancel" in data, "Response should have 'can_cancel' boolean"
        print(f"✓ Can cancel check: can_cancel={data.get('can_cancel')}, plan_type={data.get('plan_type')}")
        
        # If there's a message, print it
        if "message_fr" in data:
            print(f"  Message FR: {data['message_fr']}")
    
    def test_can_cancel_requires_auth(self):
        """GET /api/subscription/can-cancel - Requires authentication"""
        # Use fresh session without auth
        new_session = requests.Session()
        response = new_session.get(f"{BASE_URL}/api/subscription/can-cancel")
        
        assert response.status_code == 401, f"Endpoint should require authentication, got {response.status_code}"
        print("✓ Can-cancel endpoint properly requires authentication")
    
    def test_request_cancel_requires_auth(self):
        """POST /api/subscription/request-cancel - Requires authentication"""
        # Use fresh session without auth
        new_session = requests.Session()
        response = new_session.post(f"{BASE_URL}/api/subscription/request-cancel")
        
        assert response.status_code == 401, f"Endpoint should require authentication, got {response.status_code}"
        print("✓ Request-cancel endpoint properly requires authentication")
    
    def test_admin_get_cancellation_requests(self, session, auth_headers):
        """GET /api/admin/cancellation-requests - Admin can list cancellation requests"""
        response = session.get(f"{BASE_URL}/api/admin/cancellation-requests", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "requests" in data, "Response should have 'requests' array"
        assert isinstance(data["requests"], list)
        
        print(f"✓ Found {len(data['requests'])} cancellation requests")
        
        # If there are requests, validate structure
        if data["requests"]:
            req = data["requests"][0]
            assert "request_id" in req or "user_id" in req, "Request should have identifier"
            print(f"  First request: {req.get('user_email', 'N/A')} - status: {req.get('status', 'N/A')}")
    
    def test_admin_cancellation_requires_auth(self):
        """GET /api/admin/cancellation-requests - Requires admin auth"""
        # Use fresh session without auth
        new_session = requests.Session()
        response = new_session.get(f"{BASE_URL}/api/admin/cancellation-requests")
        
        assert response.status_code == 401, f"Admin endpoint should require authentication, got {response.status_code}"
        print("✓ Admin cancellation requests properly requires auth")
    
    def test_process_cancellation_requires_auth(self):
        """PUT /api/admin/cancellation-requests/{id}/process - Requires admin auth"""
        # Use fresh session without auth
        new_session = requests.Session()
        response = new_session.put(f"{BASE_URL}/api/admin/cancellation-requests/fake-id/process?action=approve")
        
        assert response.status_code == 401, f"Process endpoint should require authentication, got {response.status_code}"
        print("✓ Process cancellation endpoint properly requires auth")


# ==================== IN-APP PURCHASES (RevenueCat) API TESTS ====================

class TestIAPAPI:
    """Tests for In-App Purchase preparation endpoints"""
    
    def test_get_iap_products(self, session):
        """GET /api/iap/products - Get available IAP products (PUBLIC)"""
        response = session.get(f"{BASE_URL}/api/iap/products")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "products" in data, "Response should have 'products' array"
        products = data["products"]
        
        assert len(products) == 4, f"Should have 4 products, got {len(products)}"
        
        # Validate product IDs
        product_ids = [p["product_id"] for p in products]
        expected_ids = [
            "fitmaxpro_standard_monthly",
            "fitmaxpro_standard_annual",
            "fitmaxpro_vip_monthly",
            "fitmaxpro_vip_annual"
        ]
        
        for expected in expected_ids:
            assert expected in product_ids, f"Missing product: {expected}"
        
        print(f"✓ All 4 IAP products available:")
        for p in products:
            print(f"  - {p['product_id']}: {p['name_fr']}")
    
    def test_iap_product_structure(self, session):
        """GET /api/iap/products - Validate product structure"""
        response = session.get(f"{BASE_URL}/api/iap/products")
        data = response.json()
        
        for product in data["products"]:
            assert "product_id" in product, "Product should have product_id"
            assert "name_fr" in product, "Product should have French name"
            assert "name_en" in product, "Product should have English name"
            assert "price_tier" in product, "Product should have price_tier"
            assert "duration" in product, "Product should have duration"
            assert "features" in product, "Product should have features list"
            
            # Annual products should have discount
            if "annual" in product["product_id"]:
                assert "discount_percent" in product, f"Annual product {product['product_id']} should have discount"
        
        print("✓ All IAP products have correct structure with multilingual support")
    
    def test_verify_purchase_requires_auth(self):
        """POST /api/iap/verify-purchase - Requires authentication"""
        # Use fresh session without auth
        new_session = requests.Session()
        response = new_session.post(f"{BASE_URL}/api/iap/verify-purchase", json={
            "platform": "ios",
            "receipt_data": "fake_receipt",
            "product_id": "test_product"
        })
        
        assert response.status_code == 401, f"Verify purchase should require authentication, got {response.status_code}"
        print("✓ Verify purchase endpoint properly requires authentication")
    
    def test_verify_purchase_mocked(self, session, auth_headers):
        """POST /api/iap/verify-purchase - Returns pending status (MOCKED without RevenueCat key)"""
        response = session.post(
            f"{BASE_URL}/api/iap/verify-purchase",
            json={
                "platform": "ios",
                "receipt_data": "test_receipt_data_123",
                "product_id": "fitmaxpro_vip_monthly"
            },
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "status" in data, "Response should have status"
        assert data["status"] == "pending", "Status should be 'pending' without RevenueCat API key"
        
        print(f"✓ IAP verify purchase returns MOCKED pending status (RevenueCat key not configured)")
        print(f"  Status: {data['status']}")
        print(f"  Message: {data.get('message', 'N/A')}")


# ==================== SUBSCRIBER LIKE REVIEWS TESTS ====================

class TestSubscriberLikeReviews:
    """Tests for subscriber liking reviews"""
    
    def test_subscriber_can_like_review(self, session, auth_headers):
        """POST /api/reviews/{id}/like - Subscriber can like reviews"""
        # First get existing reviews - API returns nested structure
        reviews_response = session.get(f"{BASE_URL}/api/reviews")
        assert reviews_response.status_code == 200
        data = reviews_response.json()
        
        # Handle nested structure
        reviews = data.get("reviews", []) if isinstance(data, dict) else data
        
        if not reviews:
            pytest.skip("No reviews to test like functionality")
        
        review_id = reviews[0].get("review_id")
        if not review_id:
            pytest.skip("Review has no review_id")
        
        # Like the review
        response = session.post(f"{BASE_URL}/api/reviews/{review_id}/like", headers=auth_headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "liked" in data or "likes_count" in data, "Response should indicate like status"
        print(f"✓ Subscriber can like reviews: {data}")
    
    def test_reviews_have_likes_structure(self, session):
        """GET /api/reviews - Reviews have likes_count and likes array"""
        response = session.get(f"{BASE_URL}/api/reviews")
        assert response.status_code == 200
        data = response.json()
        
        reviews = data.get("reviews", []) if isinstance(data, dict) else data
        if not reviews:
            pytest.skip("No reviews available")
        
        review = reviews[0]
        assert "likes_count" in review, "Review should have likes_count"
        assert "likes" in review, "Review should have likes array"
        print(f"✓ Reviews have proper like structure: likes_count={review['likes_count']}")


# ==================== SUMMARY ====================

class TestAPISummary:
    """Summary of all P2 features"""
    
    def test_all_endpoints_accessible(self, session, auth_headers):
        """Verify all P2 endpoints are accessible"""
        endpoints = [
            ("GET", "/api/admin/inactive-users?days=7", auth_headers, 200),
            ("POST", "/api/admin/inactive-users/send-reminder", auth_headers, 200),
            ("GET", "/api/subscription/can-cancel", auth_headers, 200),
            ("GET", "/api/admin/cancellation-requests", auth_headers, 200),
            ("GET", "/api/iap/products", None, 200),
        ]
        
        results = []
        for method, endpoint, headers, expected_status in endpoints:
            url = f"{BASE_URL}{endpoint}"
            if method == "GET":
                response = session.get(url, headers=headers)
            else:
                response = session.post(url, json=[], headers=headers)
            
            status = "✓" if response.status_code == expected_status else "✗"
            results.append(f"{status} {method} {endpoint}: {response.status_code}")
        
        print("\n=== P2 Endpoints Summary ===")
        for r in results:
            print(r)
        
        # All should be accessible
        assert all("✓" in r for r in results), f"Some endpoints failed: {results}"
        print("\n✓ All P2 API endpoints accessible")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
