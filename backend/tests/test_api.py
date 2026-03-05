"""
FitMaxPro - Backend Tests (Simple version for CI/CD)
Tests de base qui ne nécessitent pas de connexion MongoDB
"""
import pytest
from fastapi.testclient import TestClient
import sys
sys.path.insert(0, '/app/backend')

from server import app

client = TestClient(app)


class TestHealthAndStatus:
    """Test health check and status endpoints"""
    
    def test_health_check(self):
        """Test that health endpoint returns OK"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "FitMaxPro API"
        assert data["version"] == "2.0.0"
    
    def test_iap_products(self):
        """Test IAP products endpoint"""
        response = client.get("/api/iap/products")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert len(data["products"]) == 4
        
        # Verify product structure
        for product in data["products"]:
            assert "product_id" in product
            assert "name" in product
            assert "price" in product
            assert "tier" in product
    
    def test_vapid_key(self):
        """Test VAPID public key endpoint"""
        response = client.get("/api/notifications/vapid-key")
        assert response.status_code == 200
        data = response.json()
        assert "publicKey" in data
        assert "configured" in data
    
    def test_livekit_status(self):
        """Test LiveKit status endpoint"""
        response = client.get("/api/livekit/status")
        assert response.status_code == 200
        data = response.json()
        assert "configured" in data


class TestInputValidation:
    """Test input validation"""
    
    def test_login_missing_fields(self):
        """Test login with missing fields"""
        response = client.post("/api/auth/login", json={})
        assert response.status_code == 422  # Validation error
    
    def test_login_empty_email(self):
        """Test login with empty email"""
        response = client.post("/api/auth/login", json={
            "email": "",
            "password": "test123"
        })
        # Should fail validation or return 401
        assert response.status_code in [401, 422]
    
    def test_register_missing_fields(self):
        """Test register with missing fields"""
        response = client.post("/api/auth/register", json={})
        assert response.status_code == 422


class TestAPIStructure:
    """Test API route structure"""
    
    def test_auth_routes_exist(self):
        """Test that auth routes respond"""
        response = client.post("/api/auth/login", json={"email": "x", "password": "y"})
        assert response.status_code != 404
    
    def test_workouts_route_exists(self):
        """Test that workouts route exists"""
        response = client.get("/api/workouts")
        assert response.status_code != 404
    
    def test_supplements_route_exists(self):
        """Test that supplements route exists"""
        response = client.get("/api/supplements")
        assert response.status_code != 404
    
    def test_social_links_route_exists(self):
        """Test that social links route exists"""
        response = client.get("/api/social-links")
        assert response.status_code != 404
    
    def test_reviews_route_exists(self):
        """Test that reviews route exists"""
        response = client.get("/api/reviews")
        assert response.status_code != 404
    
    def test_iap_route_exists(self):
        """Test that IAP routes exist"""
        response = client.get("/api/iap/products")
        assert response.status_code == 200
    
    def test_notifications_route_exists(self):
        """Test that notifications routes exist"""
        response = client.get("/api/notifications/vapid-key")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
