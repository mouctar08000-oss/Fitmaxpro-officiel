#!/usr/bin/env python3

import requests
import sys
import json
import os
from datetime import datetime

class FitMaxProAPITester:
    def __init__(self):
        self.base_url = "https://fitmax-gains.preview.emergentagent.com/api"
        self.session_token = "test_session_1772031670892"  # From MongoDB setup
        self.user_id = "test-user-1772031670892"
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.session_token}'
        }
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append(f"{test_name}: {details}")
            print(f"   Details: {details}")
        
        if details and success:
            print(f"   {details}")
        print()

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request and return response"""
        url = f"{self.base_url}/{endpoint}"
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=self.headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, headers=self.headers, json=data, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, headers=self.headers, json=data, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=self.headers, timeout=10)
            
            return response, response.status_code == expected_status
            
        except requests.exceptions.RequestException as e:
            return None, False

    # Auth Tests
    def test_auth_me(self):
        """Test GET /api/auth/me endpoint"""
        response, success = self.make_request('GET', 'auth/me', expected_status=200)
        
        if success and response:
            try:
                data = response.json()
                has_user_id = 'user_id' in data
                has_email = 'email' in data
                has_name = 'name' in data
                
                success = has_user_id and has_email and has_name
                details = f"User: {data.get('name')}, ID: {data.get('user_id')}, Tier: {data.get('subscription_tier')}"
                
            except (json.JSONDecodeError, KeyError) as e:
                success = False
                details = f"Invalid JSON response: {e}"
        else:
            details = f"HTTP {response.status_code if response else 'Connection Error'}"
            
        self.log_test("Auth Me Endpoint", success, details)

    def test_auth_unauthenticated(self):
        """Test unauthenticated access returns 401"""
        headers_no_auth = {'Content-Type': 'application/json'}
        
        try:
            response = requests.get(f"{self.base_url}/auth/me", headers=headers_no_auth, timeout=10)
            success = response.status_code == 401
            details = f"Status: {response.status_code}"
        except Exception as e:
            success = False
            details = f"Request failed: {e}"
            
        self.log_test("Unauthenticated Access (401)", success, details)

    # Workout Tests
    def test_workouts_list(self):
        """Test GET /api/workouts endpoint"""
        response, success = self.make_request('GET', 'workouts', expected_status=200)
        
        if success and response:
            try:
                data = response.json()
                is_list = isinstance(data, list)
                has_workouts = len(data) > 0
                
                success = is_list and has_workouts
                details = f"Found {len(data)} workouts"
                
                if has_workouts:
                    sample_workout = data[0]
                    required_fields = ['workout_id', 'title', 'level', 'program_type']
                    missing_fields = [field for field in required_fields if field not in sample_workout]
                    
                    if missing_fields:
                        success = False
                        details += f", Missing fields: {missing_fields}"
                        
            except (json.JSONDecodeError, KeyError) as e:
                success = False
                details = f"Invalid response: {e}"
        else:
            details = f"HTTP {response.status_code if response else 'Connection Error'}"
            
        self.log_test("Workouts List", success, details)

    def test_workouts_filters(self):
        """Test workout filtering"""
        # Test level filter
        response, success = self.make_request('GET', 'workouts?level=beginner', expected_status=200)
        
        if success and response:
            try:
                data = response.json()
                if data:
                    # Check if all returned workouts match the filter
                    all_beginner = all(workout.get('level') == 'beginner' for workout in data)
                    details = f"Beginner filter: {len(data)} results, All match: {all_beginner}"
                    success = all_beginner
                else:
                    details = "No beginner workouts found"
                    success = True  # Could be valid if no data
            except Exception as e:
                success = False
                details = f"Filter test failed: {e}"
        else:
            details = f"HTTP {response.status_code if response else 'Connection Error'}"
            
        self.log_test("Workout Level Filter", success, details)

    def test_workout_detail(self):
        """Test GET /api/workouts/{workout_id}"""
        # First get a workout ID
        response, success = self.make_request('GET', 'workouts', expected_status=200)
        
        if success and response:
            try:
                workouts = response.json()
                if workouts:
                    workout_id = workouts[0]['workout_id']
                    
                    # Test single workout detail
                    detail_response, detail_success = self.make_request('GET', f'workouts/{workout_id}', expected_status=200)
                    
                    if detail_success and detail_response:
                        workout_data = detail_response.json()
                        has_exercises = 'exercises' in workout_data
                        has_duration = 'duration' in workout_data
                        
                        success = has_exercises and has_duration
                        details = f"Workout ID: {workout_id}, Has exercises: {has_exercises}"
                    else:
                        success = False
                        details = f"Detail request failed: HTTP {detail_response.status_code if detail_response else 'Connection Error'}"
                else:
                    success = False
                    details = "No workouts available for detail test"
            except Exception as e:
                success = False
                details = f"Workout detail test failed: {e}"
        else:
            success = False
            details = "Could not fetch workouts list first"
            
        self.log_test("Workout Detail", success, details)

    # Supplements Tests
    def test_supplements_list(self):
        """Test GET /api/supplements endpoint"""
        response, success = self.make_request('GET', 'supplements', expected_status=200)
        
        if success and response:
            try:
                data = response.json()
                is_list = isinstance(data, list)
                has_supplements = len(data) > 0
                
                success = is_list
                details = f"Found {len(data)} supplements"
                
                if has_supplements:
                    sample_supplement = data[0]
                    required_fields = ['supplement_id', 'title', 'program_type']
                    missing_fields = [field for field in required_fields if field not in sample_supplement]
                    
                    if missing_fields:
                        success = False
                        details += f", Missing fields: {missing_fields}"
                        
            except (json.JSONDecodeError, KeyError) as e:
                success = False
                details = f"Invalid response: {e}"
        else:
            details = f"HTTP {response.status_code if response else 'Connection Error'}"
            
        self.log_test("Supplements List", success, details)

    # User Subscription Tests
    def test_user_subscription(self):
        """Test GET /api/user/subscription endpoint"""
        response, success = self.make_request('GET', 'user/subscription', expected_status=200)
        
        if success and response:
            try:
                data = response.json()
                has_tier = 'tier' in data or 'subscription_tier' in data  # Backend might return either
                has_status = 'status' in data or 'subscription_status' in data
                
                success = has_tier or has_status  # At least one should be present
                details = f"Subscription data: {data}"
                
            except (json.JSONDecodeError, KeyError) as e:
                success = False
                details = f"Invalid response: {e}"
        else:
            details = f"HTTP {response.status_code if response else 'Connection Error'}"
            
        self.log_test("User Subscription", success, details)

    # Payment Tests
    def test_checkout_creation(self):
        """Test POST /api/payments/checkout endpoint"""
        checkout_data = {
            "tier": "standard",
            "billing_cycle": "monthly",
            "origin_url": "https://fitmax-gains.preview.emergentagent.com"
        }
        
        response, success = self.make_request('POST', 'payments/checkout', checkout_data, expected_status=200)
        
        if success and response:
            try:
                data = response.json()
                has_url = 'url' in data
                has_session_id = 'session_id' in data
                
                success = has_url and has_session_id
                details = f"Checkout URL created, Session ID: {data.get('session_id', 'Not found')[:20]}..."
                
            except (json.JSONDecodeError, KeyError) as e:
                success = False
                details = f"Invalid response: {e}"
        else:
            details = f"HTTP {response.status_code if response else 'Connection Error'}"
            
        self.log_test("Checkout Creation", success, details)

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting FitMaxPro API Tests")
        print(f"Base URL: {self.base_url}")
        print(f"Session Token: {self.session_token[:20]}...")
        print("=" * 50)
        
        # Auth Tests
        self.test_auth_me()
        self.test_auth_unauthenticated()
        
        # Workout Tests  
        self.test_workouts_list()
        self.test_workouts_filters()
        self.test_workout_detail()
        
        # Supplements Tests
        self.test_supplements_list()
        
        # User Tests
        self.test_user_subscription()
        
        # Payment Tests
        self.test_checkout_creation()
        
        # Summary
        print("=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for failed_test in self.failed_tests:
                print(f"   - {failed_test}")
                
        return self.tests_passed, self.tests_run, self.failed_tests

def main():
    """Main test execution"""
    tester = FitMaxProAPITester()
    passed, total, failed = tester.run_all_tests()
    
    success_rate = (passed / total) * 100 if total > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    if success_rate < 70:
        print("⚠️  Multiple API failures detected - may need main agent intervention")
        return 1
    elif success_rate < 100:
        print("⚠️  Some API issues found - see details above")
        return 1
    else:
        print("✅ All API tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())