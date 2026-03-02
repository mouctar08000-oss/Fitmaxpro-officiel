"""
Test suite for FitMaxPro Routines API (Warm-Up & Stretching)
Tests: GET routines, Admin CRUD for exercises, Session tracking
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://fitmax-gains.preview.emergentagent.com')

# Admin credentials from test request
ADMIN_EMAIL = "mouctar08000@hotmail.com"
ADMIN_PASSWORD = "Football-du-08"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def admin_session_token(api_client):
    """Get admin session token via email/password login"""
    response = api_client.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        token = response.json().get("session_token")
        print(f"✓ Admin login successful, token obtained")
        return token
    else:
        print(f"Admin login failed: {response.status_code} - {response.text}")
        pytest.skip("Admin authentication failed - skipping admin tests")


@pytest.fixture(scope="module")
def auth_headers(admin_session_token):
    """Headers with admin auth"""
    return {"Authorization": f"Bearer {admin_session_token}"}


class TestRoutinesPublicEndpoints:
    """Test public GET routines endpoints - no auth required"""
    
    def test_get_warmup_routine_french(self, api_client):
        """GET /api/routines/warmup?language=fr - Returns warmup exercises"""
        response = api_client.get(f"{BASE_URL}/api/routines/warmup?language=fr")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "exercises" in data, "Response should contain exercises"
        assert "title" in data, "Response should contain title"
        assert len(data["exercises"]) > 0, "Warmup should have exercises"
        
        # Verify French warmup content
        assert data["title"] == "Échauffement", f"Expected 'Échauffement', got {data['title']}"
        
        # Check exercise structure
        exercise = data["exercises"][0]
        assert "name" in exercise, "Exercise should have name"
        assert "description" in exercise, "Exercise should have description"
        assert "duration" in exercise, "Exercise should have duration"
        print(f"✓ GET warmup (fr): {len(data['exercises'])} exercises, title: {data['title']}")
    
    def test_get_warmup_routine_english(self, api_client):
        """GET /api/routines/warmup?language=en - Returns English warmup"""
        response = api_client.get(f"{BASE_URL}/api/routines/warmup?language=en")
        
        assert response.status_code == 200
        data = response.json()
        assert "exercises" in data
        assert data["title"] == "Warm-Up", f"Expected 'Warm-Up', got {data['title']}"
        print(f"✓ GET warmup (en): {len(data['exercises'])} exercises, title: {data['title']}")
    
    def test_get_stretching_routine_french(self, api_client):
        """GET /api/routines/stretching?language=fr - Returns stretching exercises"""
        response = api_client.get(f"{BASE_URL}/api/routines/stretching?language=fr")
        
        assert response.status_code == 200
        data = response.json()
        assert "exercises" in data
        assert len(data["exercises"]) > 0, "Stretching should have exercises"
        assert data["title"] == "Étirements", f"Expected 'Étirements', got {data['title']}"
        
        # Check exercise has all required fields
        exercise = data["exercises"][0]
        assert "name" in exercise
        assert "description" in exercise
        assert "duration" in exercise
        print(f"✓ GET stretching (fr): {len(data['exercises'])} exercises, title: {data['title']}")
    
    def test_get_stretching_routine_english(self, api_client):
        """GET /api/routines/stretching?language=en - Returns English stretching"""
        response = api_client.get(f"{BASE_URL}/api/routines/stretching?language=en")
        
        assert response.status_code == 200
        data = response.json()
        assert "exercises" in data
        assert data["title"] == "Stretching", f"Expected 'Stretching', got {data['title']}"
        print(f"✓ GET stretching (en): {len(data['exercises'])} exercises")
    
    def test_invalid_routine_type(self, api_client):
        """GET /api/routines/invalid - Should return 400"""
        response = api_client.get(f"{BASE_URL}/api/routines/invalid?language=fr")
        
        assert response.status_code == 400
        print(f"✓ Invalid routine type returns 400")


class TestAdminRoutinesEndpoints:
    """Test admin endpoints for managing routines - requires VIP auth"""
    
    def test_admin_get_all_routines(self, api_client, auth_headers):
        """GET /api/admin/routines - Admin should see all routines"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/routines",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "routines" in data, "Response should contain routines list"
        
        routines = data["routines"]
        assert len(routines) >= 4, f"Expected at least 4 routines (warmup/stretching x fr/en), got {len(routines)}"
        
        # Verify all expected routines exist
        routine_ids = [r.get("routine_id") for r in routines]
        expected_ids = ["warmup_fr", "warmup_en", "stretching_fr", "stretching_en"]
        for expected_id in expected_ids:
            assert expected_id in routine_ids, f"Missing routine: {expected_id}"
        
        print(f"✓ Admin GET routines: {len(routines)} routines found")
        for r in routines:
            print(f"  - {r.get('routine_id')}: {len(r.get('exercises', []))} exercises")
    
    def test_admin_update_routine_exercise(self, api_client, auth_headers):
        """PUT /api/admin/routines/{routine_id}/exercises/{index} - Update exercise"""
        routine_id = "warmup_fr"
        exercise_index = 0
        
        # Update only video_url to test
        update_data = {
            "video_url": "https://www.youtube.com/embed/TEST_VIDEO_123"
        }
        
        response = api_client.put(
            f"{BASE_URL}/api/admin/routines/{routine_id}/exercises/{exercise_index}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["message"] == "Exercise updated successfully"
        
        # Verify update was applied by fetching routine
        verify_response = api_client.get(f"{BASE_URL}/api/routines/warmup?language=fr")
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        updated_exercise = verify_data["exercises"][0]
        assert updated_exercise["video_url"] == "https://www.youtube.com/embed/TEST_VIDEO_123"
        
        # Revert back to original video_url
        revert_data = {"video_url": "https://www.youtube.com/embed/CtxCrJkLkCM"}
        api_client.put(
            f"{BASE_URL}/api/admin/routines/{routine_id}/exercises/{exercise_index}",
            json=revert_data,
            headers=auth_headers
        )
        
        print(f"✓ Admin UPDATE routine exercise: Successfully updated and reverted")
    
    def test_admin_add_and_delete_routine_exercise(self, api_client, auth_headers):
        """POST and DELETE exercise - Full CRUD test"""
        routine_id = "warmup_fr"
        
        # First get current exercise count
        get_response = api_client.get(f"{BASE_URL}/api/routines/warmup?language=fr")
        initial_count = len(get_response.json()["exercises"])
        
        # Add new exercise
        new_exercise = {
            "name": "TEST_Exercise_To_Delete",
            "description": "This is a test exercise that will be deleted",
            "duration": "60 seconds",
            "image_url": "https://test.com/image.jpg",
            "video_url": "https://www.youtube.com/embed/TEST123"
        }
        
        add_response = api_client.post(
            f"{BASE_URL}/api/admin/routines/{routine_id}/exercises",
            json=new_exercise,
            headers=auth_headers
        )
        
        assert add_response.status_code == 200, f"Add exercise failed: {add_response.text}"
        assert add_response.json()["message"] == "Exercise added successfully"
        
        # Verify exercise was added
        verify_response = api_client.get(f"{BASE_URL}/api/routines/warmup?language=fr")
        after_add_count = len(verify_response.json()["exercises"])
        assert after_add_count == initial_count + 1, f"Exercise count should increase by 1"
        
        # Find index of the new exercise (should be last)
        new_exercise_index = after_add_count - 1
        
        # Delete the test exercise
        delete_response = api_client.delete(
            f"{BASE_URL}/api/admin/routines/{routine_id}/exercises/{new_exercise_index}",
            headers=auth_headers
        )
        
        assert delete_response.status_code == 200, f"Delete exercise failed: {delete_response.text}"
        assert delete_response.json()["message"] == "Exercise deleted successfully"
        
        # Verify exercise was deleted
        final_response = api_client.get(f"{BASE_URL}/api/routines/warmup?language=fr")
        final_count = len(final_response.json()["exercises"])
        assert final_count == initial_count, "Exercise count should return to initial"
        
        print(f"✓ Admin ADD/DELETE exercise: Initial={initial_count}, After add={after_add_count}, Final={final_count}")
    
    def test_admin_update_invalid_exercise_index(self, api_client, auth_headers):
        """PUT with invalid index should return 400"""
        response = api_client.put(
            f"{BASE_URL}/api/admin/routines/warmup_fr/exercises/999",
            json={"name": "Test"},
            headers=auth_headers
        )
        
        assert response.status_code == 400
        print(f"✓ Admin UPDATE invalid index returns 400")
    
    def test_admin_update_nonexistent_routine(self, api_client, auth_headers):
        """PUT to non-existent routine should return 404"""
        response = api_client.put(
            f"{BASE_URL}/api/admin/routines/nonexistent_routine/exercises/0",
            json={"name": "Test"},
            headers=auth_headers
        )
        
        assert response.status_code == 404
        print(f"✓ Admin UPDATE non-existent routine returns 404")


class TestRoutineSessionTracking:
    """Test routine session start/end tracking - requires auth"""
    
    def test_start_warmup_session(self, api_client, auth_headers):
        """POST /api/routine/start?routine_type=warmup - Start warmup session"""
        response = api_client.post(
            f"{BASE_URL}/api/routine/start?routine_type=warmup",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "session_id" in data, "Response should contain session_id"
        assert data["routine_type"] == "warmup"
        assert "started" in data["message"].lower()
        
        # Store session_id for end test
        pytest.warmup_session_id = data["session_id"]
        print(f"✓ Start warmup session: session_id={data['session_id']}")
    
    def test_end_warmup_session(self, api_client, auth_headers):
        """POST /api/routine/end?session_id={id}&completed=true - End session"""
        session_id = getattr(pytest, 'warmup_session_id', None)
        if not session_id:
            pytest.skip("No warmup session started")
        
        # Small delay to get measurable duration
        time.sleep(1)
        
        response = api_client.post(
            f"{BASE_URL}/api/routine/end?session_id={session_id}&completed=true",
            headers=auth_headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["session_id"] == session_id
        assert data["completed"] == True
        assert "duration_seconds" in data
        assert "duration_formatted" in data
        assert data["duration_seconds"] >= 1, "Duration should be at least 1 second"
        
        print(f"✓ End warmup session: duration={data['duration_formatted']}, completed={data['completed']}")
    
    def test_start_stretching_session(self, api_client, auth_headers):
        """POST /api/routine/start?routine_type=stretching - Start stretching"""
        response = api_client.post(
            f"{BASE_URL}/api/routine/start?routine_type=stretching",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["routine_type"] == "stretching"
        pytest.stretching_session_id = data["session_id"]
        print(f"✓ Start stretching session: session_id={data['session_id']}")
    
    def test_end_stretching_session_incomplete(self, api_client, auth_headers):
        """POST /api/routine/end?...&completed=false - End incomplete session"""
        session_id = getattr(pytest, 'stretching_session_id', None)
        if not session_id:
            pytest.skip("No stretching session started")
        
        response = api_client.post(
            f"{BASE_URL}/api/routine/end?session_id={session_id}&completed=false",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] == False
        print(f"✓ End stretching session (incomplete): completed={data['completed']}")
    
    def test_start_invalid_routine_type(self, api_client, auth_headers):
        """POST /api/routine/start?routine_type=invalid - Should return 400"""
        response = api_client.post(
            f"{BASE_URL}/api/routine/start?routine_type=invalid",
            headers=auth_headers
        )
        
        assert response.status_code == 400
        print(f"✓ Start invalid routine type returns 400")
    
    def test_end_nonexistent_session(self, api_client, auth_headers):
        """POST /api/routine/end?session_id=nonexistent - Should return 404"""
        response = api_client.post(
            f"{BASE_URL}/api/routine/end?session_id=nonexistent-session-id&completed=true",
            headers=auth_headers
        )
        
        assert response.status_code == 404
        print(f"✓ End non-existent session returns 404")


class TestAdminAccessControl:
    """Verify admin endpoints require VIP subscription"""
    
    def test_admin_routines_without_auth(self):
        """GET /api/admin/routines without auth should return 401"""
        # Use fresh session without cookies
        fresh_client = requests.Session()
        fresh_client.headers.update({"Content-Type": "application/json"})
        response = fresh_client.get(f"{BASE_URL}/api/admin/routines")
        
        assert response.status_code == 401
        print(f"✓ Admin routines without auth returns 401")
    
    def test_routine_session_without_auth(self):
        """POST /api/routine/start without auth should return 401"""
        # Use fresh session without cookies
        fresh_client = requests.Session()
        fresh_client.headers.update({"Content-Type": "application/json"})
        response = fresh_client.post(
            f"{BASE_URL}/api/routine/start?routine_type=warmup"
        )
        
        assert response.status_code == 401
        print(f"✓ Routine session without auth returns 401")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
