#!/usr/bin/env python3
"""
Simple API test script for BioSearch backend
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5001/api"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
            return True
    except Exception as e:
        print(f"Health check failed: {e}")
    return False

def test_salons():
    """Test salons endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/salons", params={'per_page': 5})
        print(f"Salons endpoint: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {data.get('total', 0)} salons")
            if data.get('salons'):
                salon = data['salons'][0]
                print(f"First salon: {salon.get('nome', 'Unknown')}")
            return True
    except Exception as e:
        print(f"Salons test failed: {e}")
    return False

def test_services():
    """Test services endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/services")
        print(f"Services endpoint: {response.status_code}")
        if response.status_code == 200:
            services = response.json()
            print(f"Found {len(services)} services")
            bio_services = [s for s in services if s.get('is_bio_diamond')]
            print(f"BIO Diamond services: {len(bio_services)}")
            return True
    except Exception as e:
        print(f"Services test failed: {e}")
    return False

def main():
    print("Testing BioSearch API...")
    print("=" * 40)
    
    tests = [
        ("Health Check", test_health),
        ("Salons Endpoint", test_salons),
        ("Services Endpoint", test_services)
    ]
    
    passed = 0
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            print("✅ PASSED")
            passed += 1
        else:
            print("❌ FAILED")
    
    print(f"\n{'='*40}")
    print(f"Tests passed: {passed}/{len(tests)}")
    
    if passed == len(tests):
        print("🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the Flask server.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
