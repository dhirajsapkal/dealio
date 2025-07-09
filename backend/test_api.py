#!/usr/bin/env python3
"""
Test script for the Dealio Guitar Deal Tracker API
Demonstrates all working endpoints with sample requests.
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, description):
    """Test an API endpoint and display the result."""
    print(f"\n🔍 Testing: {description}")
    print(f"📡 GET {endpoint}")
    
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
        print(f"✅ Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📋 Response: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection Error: {e}")
    
    print("-" * 80)

def main():
    """Run all API tests."""
    print("🎸 Dealio Guitar Deal Tracker API Test Suite")
    print("=" * 80)
    
    # Test all endpoints
    endpoints = [
        ("/", "Root endpoint - API information"),
        ("/health", "Health check - API status"),
        ("/status", "System status - Detailed system information"),
        ("/guitars", "All guitar listings"),
        ("/guitars/sources", "Available marketplace sources"),
        ("/guitars/best-deals", "Best deals (score >= 70)"),
        ("/guitars/best-deals?min_score=80", "Best deals (score >= 80)"),
        ("/guitars/Fender/Stratocaster", "Fender Stratocaster listings"),
        ("/guitars/Fender/Stratocaster/dealscore", "Fender Stratocaster deal scores"),
        ("/guitars/Gibson/Les%20Paul", "Gibson Les Paul listings"),
        ("/guitars/Gibson/Les%20Paul/dealscore", "Gibson Les Paul deal scores"),
    ]
    
    for endpoint, description in endpoints:
        test_endpoint(endpoint, description)
    
    print("\n🎉 API Test Suite Complete!")
    print("\nTo view the interactive API documentation, visit:")
    print("🌐 http://localhost:8000/docs")

if __name__ == "__main__":
    main() 