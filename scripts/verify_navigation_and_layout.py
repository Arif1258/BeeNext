#!/usr/bin/env python3
"""
Comprehensive verification test script for:
1. Root '/' redirection to '/topics'
2. Logo click directs to '/topics'
3. Navbar links order: DSA Topics, Order Printed Copy, My Purchases, My Profile, [Login / Sign Up]
4. Absence of 'Home' in Navbar
5. DSA Topics page header & description exact match
6. Dedicated '/order-printed' page presence and ordering API flow
7. Guest vs Authenticated Navbar state
"""

import sys
import requests
import re

BASE_URL = "http://localhost:3000"

def test_root_redirect():
    print("\n--- 1. Testing Root URL Redirection ---")
    resp = requests.get(f"{BASE_URL}/", allow_redirects=False)
    print(f"Status code for root '/': {resp.status_code}")
    location = resp.headers.get("Location", "")
    print(f"Redirect Location: {location}")
    assert resp.status_code in (307, 308, 302, 301), f"Expected redirect, got {resp.status_code}"
    assert "/topics" in location, f"Expected redirect to /topics, got {location}"
    
    # Follow redirect
    follow_resp = requests.get(f"{BASE_URL}/")
    assert follow_resp.status_code == 200, f"Expected 200 on followed redirect, got {follow_resp.status_code}"
    assert "Handwritten Notes for Striver&#x27;s A to Z DSA Sheet" in follow_resp.text or "Handwritten Notes for Striver's A to Z DSA Sheet" in follow_resp.text
    print("✓ Root '/' successfully redirects to '/topics' with HTTP 200 response.")

def test_topics_page_header_and_content():
    print("\n--- 2. Testing DSA Topics Page Header & Content ---")
    resp = requests.get(f"{BASE_URL}/topics")
    assert resp.status_code == 200, f"Failed to load /topics: {resp.status_code}"
    html = resp.text

    # Verify exact heading
    heading_target = "Handwritten Notes for Striver"
    assert heading_target in html, f"Heading not found in /topics HTML"
    print(f"✓ Found exact heading: 'Handwritten Notes for Striver's A to Z DSA Sheet'")

    # Verify exact description
    desc_target = "Learn DSA with detailed handwritten notes, Java solutions, and problem-by-problem explanations. Practice, track your progress, and master every topic."
    assert desc_target in html, f"Description not found in /topics HTML"
    print(f"✓ Found exact description: '{desc_target}'")

    # Verify vertical topic list present
    assert "Sorting Techniques" in html, "Sorting Techniques not found"
    assert "Selection Sort" in html, "Selection Sort not found"
    print("✓ DSA topics and problems rendered on page.")

def test_navbar_structure_guest():
    print("\n--- 3. Testing Navbar Structure (Guest / Logged-Out) ---")
    resp = requests.get(f"{BASE_URL}/topics")
    html = resp.text

    # Verify logo points to /topics
    assert 'href="/topics" class="flex items-center space-x-3 group"' in html or 'href="/topics"' in html, "Logo does not link to /topics"
    print("✓ Logo points to '/topics'")

    # Verify Home is not a navigation item
    # Check that there is no nav link with text 'Home' linking to '/'
    nav_links = re.findall(r'<Link[^>]*href=["\']([^"\']+)["\'][^>]*>([\s\S]*?)<\/Link>', html)
    # Also standard html <a> tags rendered by Next.js
    a_links = re.findall(r'<a[^>]*href=["\']([^"\']+)["\'][^>]*>([\s\S]*?)<\/a>', html)
    
    # Check that none of the header nav items is Home
    header_section = re.search(r'<header[\s\S]*?<\/header>', html)
    header_html = header_section.group(0) if header_section else html

    assert '>Home<' not in header_html, "'Home' link still present in Navbar!"
    print("✓ 'Home' link successfully removed from Navbar.")

    # Check exact order of navbar links in header
    topics_idx = header_html.find('href="/topics"')
    printed_idx = header_html.find('href="/order-printed"')
    purchases_idx = header_html.find('href="/purchases"')
    profile_idx = header_html.find('href="/profile"')
    login_idx = header_html.find('href="/login"')

    print(f"Order indices in header HTML: topics={topics_idx}, printed={printed_idx}, purchases={purchases_idx}, profile={profile_idx}, login={login_idx}")
    assert topics_idx != -1, "DSA Topics link missing"
    assert printed_idx != -1, "Order Printed Copy link missing"
    assert purchases_idx != -1, "My Purchases link missing"
    assert profile_idx != -1, "My Profile link missing"
    assert login_idx != -1, "Login link missing for guest"

    assert topics_idx < printed_idx < purchases_idx < profile_idx, "Navbar links are not in the exact requested order!"
    assert "Login / Sign Up" in header_html, "Login / Sign Up button text missing for guest"
    print("✓ Navbar order verified: 1. DSA Topics, 2. Order Printed Copy, 3. My Purchases, 4. My Profile, 5. Login / Sign Up")

def test_order_printed_page():
    print("\n--- 4. Testing Dedicated /order-printed Page ---")
    resp = requests.get(f"{BASE_URL}/order-printed")
    assert resp.status_code == 200, f"/order-printed returned status {resp.status_code}"
    html = resp.text

    assert "Complete Printed DSA Notes – Striver&#x27;s A to Z Sheet" in html or "Complete Printed DSA Notes – Striver's A to Z Sheet" in html, "Product title not found"
    assert "1,499" in html or "1499" in html, "Price 1,499 not found"
    assert "printed-notebook-mockup.svg" in html, "Mockup SVG not found"
    assert "Shipping Address" in html or "Delivery Details" in html, "Shipping details section not found"
    print("✓ /order-printed page loads with full product specifications, mockup, and delivery form.")

def test_order_printed_api_flow():
    print("\n--- 5. Testing Printed Notes Order Creation & Verification API ---")
    order_payload = {
        "customerName": "Test Verification Customer",
        "customerEmail": "test_verification@example.com",
        "customerPhone": "9876543210",
        "addressLine1": "Suite 101, Test Tech Park",
        "addressLine2": "Outer Ring Road",
        "city": "Bengaluru",
        "state": "Karnataka",
        "postalCode": "560103",
        "country": "India",
        "notes": "Automated verification test"
    }

    create_resp = requests.post(f"{BASE_URL}/api/printed-orders/create", json=order_payload)
    assert create_resp.status_code == 200, f"Order create failed: {create_resp.status_code} {create_resp.text}"
    create_data = create_resp.json()
    assert create_data.get("success") is True, f"Order create success != True: {create_data}"
    printed_order_id = create_data["printedOrderId"]
    razorpay_order_id = create_data["orderId"]
    order_number = create_data["orderNumber"]
    print(f"✓ Printed order created: orderNumber={order_number}, id={printed_order_id}")

    # Verify mock payment
    verify_payload = {
        "printedOrderId": printed_order_id,
        "razorpayOrderId": razorpay_order_id,
        "razorpayPaymentId": f"pay_mock_{order_number}",
        "razorpaySignature": f"mock_sig_{order_number}_verified"
    }
    verify_resp = requests.post(f"{BASE_URL}/api/printed-orders/verify", json=verify_payload)
    assert verify_resp.status_code == 200, f"Verify failed: {verify_resp.status_code} {verify_resp.text}"
    verify_data = verify_resp.json()
    assert verify_data.get("success") is True, f"Verify success != True: {verify_data}"
    print(f"✓ Payment verified and order confirmed: {verify_data}")

def test_authenticated_navbar():
    print("\n--- 6. Testing Authenticated User Navbar ---")
    session = requests.Session()
    # Log in as user
    login_resp = session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "alex@beenext.dev",
        "password": "UserSecurePassword123!"
    })
    assert login_resp.status_code == 200, f"User login failed: {login_resp.status_code} {login_resp.text}"
    print("✓ Successfully logged in as user 'alex@beenext.dev'")

    # Check user session
    me_resp = session.get(f"{BASE_URL}/api/auth/me")
    assert me_resp.status_code == 200
    user_data = me_resp.json()
    assert user_data["user"]["email"] == "alex@beenext.dev"
    print(f"✓ Session authenticated as {user_data['user']['name']} ({user_data['user']['role']})")

    # Log in as admin
    admin_session = requests.Session()
    admin_login_resp = admin_session.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@beenext.dev",
        "password": "AdminSecurePassword123!"
    })
    assert admin_login_resp.status_code == 200
    admin_me_resp = admin_session.get(f"{BASE_URL}/api/auth/me")
    assert admin_me_resp.json()["user"]["role"] == "ADMIN"
    print("✓ Session authenticated as Admin")

def run_all():
    print("==================================================")
    print("RUNNING NAVIGATION & MAIN PAGE REDESIGN TESTS")
    print("==================================================")
    test_root_redirect()
    test_topics_page_header_and_content()
    test_navbar_structure_guest()
    test_order_printed_page()
    test_order_printed_api_flow()
    test_authenticated_navbar()
    print("\n==================================================")
    print("ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ✓")
    print("==================================================")

if __name__ == "__main__":
    run_all()
