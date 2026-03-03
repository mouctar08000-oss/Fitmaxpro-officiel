"""
Test Live Request Feature - Testing the live request form with category and exercise type selection
Tests:
- POST /api/live/request - Create live request with category, exercise_type
- GET /api/live/requests - Retrieve requests (user's own and admin view)
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://fitmax-gains.preview.emergentagent.com').rstrip('/')

# Test tokens created during test session
USER_TOKEN = None
ADMIN_TOKEN = None
TEST_REQUEST_ID = None


class TestLiveRequestAPI:
    """Test live request API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self, create_test_users):
        """Set up test tokens"""
        global USER_TOKEN, ADMIN_TOKEN
        USER_TOKEN = create_test_users["user_token"]
        ADMIN_TOKEN = create_test_users["admin_token"]
    
    def test_create_live_request_with_category(self):
        """Test POST /api/live/request with category selection"""
        global TEST_REQUEST_ID
        
        response = requests.post(
            f"{BASE_URL}/api/live/request",
            headers={"Authorization": f"Bearer {USER_TOKEN}"},
            json={
                "title": "TEST_Mass Gain Session",
                "message": "I want to build muscle mass",
                "category": "masse",
                "category_label": "Mass Gain",
                "exercise_type": None,
                "exercise_label": None
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("success") is True
        assert "request_id" in data
        TEST_REQUEST_ID = data["request_id"]
        print(f"Created live request: {TEST_REQUEST_ID}")
    
    def test_create_live_request_with_category_and_exercise_type(self):
        """Test POST /api/live/request with both category and exercise type"""
        response = requests.post(
            f"{BASE_URL}/api/live/request",
            headers={"Authorization": f"Bearer {USER_TOKEN}"},
            json={
                "title": "TEST_Legs - Beginner Level",
                "message": "Basic leg exercises for beginners",
                "category": "jambes",
                "category_label": "Legs",
                "exercise_type": "debutant",
                "exercise_label": "Beginner Level"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") is True
        assert "request_id" in data
        print(f"Created live request with exercise type: {data['request_id']}")
    
    def test_create_live_request_requires_auth(self):
        """Test POST /api/live/request requires authentication"""
        response = requests.post(
            f"{BASE_URL}/api/live/request",
            json={
                "title": "TEST_Unauthorized Request",
                "category": "yoga"
            }
        )
        
        assert response.status_code == 401
        print("Correctly rejected unauthenticated request")
    
    def test_get_user_own_requests(self):
        """Test GET /api/live/requests returns user's own requests"""
        response = requests.get(
            f"{BASE_URL}/api/live/requests",
            headers={"Authorization": f"Bearer {USER_TOKEN}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "requests" in data
        assert isinstance(data["requests"], list)
        
        # Verify at least the test requests exist
        test_requests = [r for r in data["requests"] if "TEST_" in r.get("title", "")]
        assert len(test_requests) >= 1, "Expected at least one test request"
        
        # Verify request structure
        for req in test_requests:
            assert "request_id" in req
            assert "user_id" in req
            assert "title" in req
            assert "status" in req
            assert "created_at" in req
        
        print(f"User can see {len(data['requests'])} requests")
    
    def test_get_admin_all_requests(self):
        """Test GET /api/live/requests as admin returns all requests"""
        response = requests.get(
            f"{BASE_URL}/api/live/requests",
            headers={"Authorization": f"Bearer {ADMIN_TOKEN}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "requests" in data
        
        # Admin should see all requests
        print(f"Admin can see {len(data['requests'])} total requests")
        
        # Verify category and exercise_type fields in requests
        for req in data["requests"]:
            if "TEST_" in req.get("title", ""):
                assert "category" in req, "Request should have category field"
                # exercise_type is optional
                print(f"Request: {req.get('title')} - Category: {req.get('category')}, Exercise Type: {req.get('exercise_type')}")
    
    def test_request_has_correct_fields(self):
        """Verify request includes all expected fields including category_label and exercise_label"""
        # Create a new request with all fields
        response = requests.post(
            f"{BASE_URL}/api/live/request",
            headers={"Authorization": f"Bearer {USER_TOKEN}"},
            json={
                "title": "TEST_Full Request",
                "message": "Testing all fields",
                "category": "cardio",
                "category_label": "Cardio & HIIT",
                "exercise_type": "avance",
                "exercise_label": "Advanced Level"
            }
        )
        
        assert response.status_code == 200
        request_id = response.json()["request_id"]
        
        # Get the request to verify fields
        get_response = requests.get(
            f"{BASE_URL}/api/live/requests",
            headers={"Authorization": f"Bearer {USER_TOKEN}"}
        )
        
        assert get_response.status_code == 200
        requests_list = get_response.json()["requests"]
        
        # Find the created request
        created_request = next((r for r in requests_list if r["request_id"] == request_id), None)
        assert created_request is not None, "Created request not found"
        
        # Verify all fields
        assert created_request["category"] == "cardio"
        assert created_request["category_label"] == "Cardio & HIIT"
        assert created_request["exercise_type"] == "avance"
        assert created_request["exercise_label"] == "Advanced Level"
        assert created_request["status"] == "pending"
        
        print(f"Request has all correct fields: {created_request['title']}")


@pytest.fixture(scope="session")
def create_test_users():
    """Create test users for the session"""
    import subprocess
    import time
    
    timestamp = int(time.time() * 1000)
    user_id = f"test_user_lr_{timestamp}"
    user_token = f"test_session_lr_{timestamp}"
    admin_id = f"admin_user_lr_{timestamp}"
    admin_token = f"admin_session_lr_{timestamp}"
    
    # Create users via mongosh
    mongo_script = f"""
    use('test_database');
    
    // Create regular user
    db.users.deleteOne({{ email: 'testlr@test.com' }});
    db.users.insertOne({{
        user_id: '{user_id}',
        email: 'testlr@test.com',
        name: 'Test User LR',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4lKoEn7j3Y5KK2fK',
        picture: null,
        subscription_tier: 'standard',
        subscription_status: 'active',
        role: 'user',
        created_at: new Date()
    }});
    
    db.user_sessions.insertOne({{
        user_id: '{user_id}',
        session_token: '{user_token}',
        expires_at: new Date(Date.now() + 7*24*60*60*1000),
        created_at: new Date()
    }});
    
    // Create admin user
    db.users.deleteOne({{ email: 'adminlr@test.com' }});
    db.users.insertOne({{
        user_id: '{admin_id}',
        email: 'adminlr@test.com',
        name: 'Admin User LR',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4lKoEn7j3Y5KK2fK',
        picture: null,
        subscription_tier: 'vip',
        subscription_status: 'active',
        role: 'admin',
        created_at: new Date()
    }});
    
    db.user_sessions.insertOne({{
        user_id: '{admin_id}',
        session_token: '{admin_token}',
        expires_at: new Date(Date.now() + 7*24*60*60*1000),
        created_at: new Date()
    }});
    
    print('Users created successfully');
    """
    
    result = subprocess.run(
        ["mongosh", "--eval", mongo_script],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"Warning: MongoDB script may have issues: {result.stderr}")
    
    return {
        "user_token": user_token,
        "admin_token": admin_token,
        "user_id": user_id,
        "admin_id": admin_id
    }


@pytest.fixture(scope="session", autouse=True)
def cleanup(request, create_test_users):
    """Cleanup test data after all tests"""
    def cleanup_data():
        import subprocess
        cleanup_script = """
        use('test_database');
        db.live_requests.deleteMany({ title: /^TEST_/ });
        db.users.deleteMany({ email: { $in: ['testlr@test.com', 'adminlr@test.com'] } });
        db.user_sessions.deleteMany({ session_token: /^test_session_lr_|^admin_session_lr_/ });
        print('Cleanup complete');
        """
        subprocess.run(["mongosh", "--eval", cleanup_script], capture_output=True)
    
    request.addfinalizer(cleanup_data)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
