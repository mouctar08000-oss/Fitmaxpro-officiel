"""
Tests for Running / Course à Pied feature
Testing endpoints:
- POST /api/running/log - Log a running session
- GET /api/running/history - Get user's running history
- GET /api/running/stats - Get user's running stats
- GET /api/running/{run_id} - Get specific run details
- DELETE /api/running/{run_id} - Delete a run
- GET /api/admin/running/all - Admin: Get all runs
- GET /api/admin/running/stats - Admin: Get global running stats
- GET /api/admin/running/user/{user_id} - Admin: Get specific user's running data
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials from test setup
ADMIN_TOKEN = "admin_test_session_1772529324426"
ADMIN_USER_ID = "admin_user_1772529324426"


class TestRunningEndpoints:
    """Test running endpoints for authenticated user"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.headers = {
            "Authorization": f"Bearer {ADMIN_TOKEN}",
            "Content-Type": "application/json"
        }
    
    def test_01_running_log_creates_run(self):
        """POST /api/running/log - should create a new running session"""
        payload = {
            "distance": 2.5,
            "duration": 900,  # 15 minutes in seconds
            "pace": 6.0,
            "calories": 150
        }
        
        response = requests.post(
            f"{BASE_URL}/api/running/log",
            json=payload,
            headers=self.headers
        )
        
        print(f"Log run response: {response.status_code} - {response.text[:200]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Response should indicate success"
        assert "run_id" in data, "Response should contain run_id"
        assert data["distance"] == 2.5, "Distance should match"
        assert data["duration"] == 900, "Duration should match"
        
        # Store run_id for later tests
        self.__class__.created_run_id = data["run_id"]
        print(f"Created run_id: {self.__class__.created_run_id}")
    
    def test_02_running_history_returns_runs(self):
        """GET /api/running/history - should return user's running history"""
        response = requests.get(
            f"{BASE_URL}/api/running/history",
            headers=self.headers
        )
        
        print(f"History response: {response.status_code} - {response.text[:300]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) >= 1, "Should have at least one run in history"
        
        # Verify run structure
        first_run = data[0]
        assert "run_id" in first_run, "Run should have run_id"
        assert "distance" in first_run, "Run should have distance"
        assert "duration" in first_run, "Run should have duration"
        assert "created_at" in first_run, "Run should have created_at"
        print(f"History contains {len(data)} runs")
    
    def test_03_running_stats_returns_statistics(self):
        """GET /api/running/stats - should return user's running statistics"""
        response = requests.get(
            f"{BASE_URL}/api/running/stats",
            headers=self.headers
        )
        
        print(f"Stats response: {response.status_code} - {response.text[:400]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "total_runs" in data, "Stats should contain total_runs"
        assert "total_distance" in data, "Stats should contain total_distance"
        assert "total_time" in data, "Stats should contain total_time"
        assert "total_calories" in data, "Stats should contain total_calories"
        assert "best_distance" in data, "Stats should contain best_distance"
        
        assert data["total_runs"] >= 1, "Should have at least 1 run"
        assert data["total_distance"] > 0, "Total distance should be > 0"
        print(f"Stats: {data['total_runs']} runs, {data['total_distance']} km total")
    
    def test_04_get_specific_run(self):
        """GET /api/running/{run_id} - should return specific run details"""
        # Use the run_id from our created run
        run_id = getattr(self.__class__, 'created_run_id', None)
        
        if not run_id:
            # Get from history
            response = requests.get(
                f"{BASE_URL}/api/running/history",
                headers=self.headers
            )
            runs = response.json()
            if runs:
                run_id = runs[0]["run_id"]
        
        if not run_id:
            pytest.skip("No run_id available for test")
        
        response = requests.get(
            f"{BASE_URL}/api/running/{run_id}",
            headers=self.headers
        )
        
        print(f"Get run response: {response.status_code} - {response.text[:300]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["run_id"] == run_id, "Run ID should match"
        assert "distance" in data, "Run should have distance"
        assert "duration" in data, "Run should have duration"
    
    def test_05_delete_run(self):
        """DELETE /api/running/{run_id} - should delete a run"""
        run_id = getattr(self.__class__, 'created_run_id', None)
        
        if not run_id:
            pytest.skip("No run_id available for deletion test")
        
        response = requests.delete(
            f"{BASE_URL}/api/running/{run_id}",
            headers=self.headers
        )
        
        print(f"Delete run response: {response.status_code} - {response.text[:200]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data.get("success") == True, "Should indicate success"
        
        # Verify deletion - should return 404
        verify_response = requests.get(
            f"{BASE_URL}/api/running/{run_id}",
            headers=self.headers
        )
        assert verify_response.status_code == 404, "Run should not exist after deletion"


class TestAdminRunningEndpoints:
    """Test admin running endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.headers = {
            "Authorization": f"Bearer {ADMIN_TOKEN}",
            "Content-Type": "application/json"
        }
    
    def test_admin_running_all(self):
        """GET /api/admin/running/all - should return all runs from all users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/running/all",
            headers=self.headers
        )
        
        print(f"Admin all runs response: {response.status_code} - {response.text[:400]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "runs" in data, "Response should contain 'runs' field"
        assert "total" in data, "Response should contain 'total' count"
        assert isinstance(data["runs"], list), "Runs should be a list"
        
        # Verify run structure if runs exist
        if data["runs"]:
            run = data["runs"][0]
            assert "run_id" in run, "Run should have run_id"
            assert "user_id" in run, "Run should have user_id"
            assert "user_name" in run, "Run should have user_name"
            assert "distance" in run, "Run should have distance"
        
        print(f"Admin sees {data['total']} total runs")
    
    def test_admin_running_stats(self):
        """GET /api/admin/running/stats - should return global running statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/running/stats",
            headers=self.headers
        )
        
        print(f"Admin stats response: {response.status_code} - {response.text[:500]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "global_stats" in data, "Response should contain global_stats"
        assert "top_runners" in data, "Response should contain top_runners"
        
        # Verify global stats structure
        stats = data["global_stats"]
        assert "total_runs" in stats, "Should have total_runs"
        assert "total_distance" in stats, "Should have total_distance"
        assert "total_time" in stats, "Should have total_time"
        assert "total_calories" in stats, "Should have total_calories"
        
        print(f"Global stats: {stats['total_runs']} runs, {stats['total_distance']} km")
        
        # Verify top runners structure
        if data["top_runners"]:
            runner = data["top_runners"][0]
            assert "user_id" in runner, "Top runner should have user_id"
            assert "user_name" in runner, "Top runner should have user_name"
            assert "total_distance" in runner, "Top runner should have total_distance"
            print(f"Top runner: {runner['user_name']} - {runner['total_distance']} km")
    
    def test_admin_running_user_detail(self):
        """GET /api/admin/running/user/{user_id} - should return specific user's running data"""
        response = requests.get(
            f"{BASE_URL}/api/admin/running/user/{ADMIN_USER_ID}",
            headers=self.headers
        )
        
        print(f"Admin user running response: {response.status_code} - {response.text[:500]}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "user" in data, "Response should contain 'user' info"
        assert "runs" in data, "Response should contain 'runs' list"
        assert "stats" in data, "Response should contain 'stats'"
        
        # Verify user info
        assert data["user"]["user_id"] == ADMIN_USER_ID, "User ID should match"
        
        # Verify stats
        stats = data["stats"]
        assert "total_runs" in stats, "Stats should have total_runs"
        assert "total_distance" in stats, "Stats should have total_distance"
        
        print(f"User {data['user'].get('name')}: {stats['total_runs']} runs, {stats['total_distance']} km")


class TestUnauthorizedAccess:
    """Test unauthorized access to running endpoints"""
    
    def test_running_log_without_auth(self):
        """POST /api/running/log without auth should return 401"""
        response = requests.post(
            f"{BASE_URL}/api/running/log",
            json={"distance": 1.0, "duration": 300}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_running_history_without_auth(self):
        """GET /api/running/history without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/running/history")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
    
    def test_running_stats_without_auth(self):
        """GET /api/running/stats without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/running/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
