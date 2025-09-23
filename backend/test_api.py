import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_registration_and_login():
    """Test user registration and login"""
    print("Testing user registration and login...")

    # Register user
    register_data = {
        "user_name": "testuser",
        "user_email": "test@example.com",
        "password": "testpassword123"
    }

    response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
    print(f"Registration: {response.status_code}")

    # Login
    login_data = {
        "username": "testuser",
        "password": "testpassword123"
    }

    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        print("Login successful!")
        return token
    else:
        print("Login failed!")
        return None

def test_create_post(token):
    """Test post creation and analysis"""
    print("Testing post creation...")

    headers = {"Authorization": f"Bearer {token}"}
    post_data = {
        "title": "My Amazing Day!",
        "content": "Today was absolutely wonderful! I'm so happy and excited about everything. Life is great!"
    }

    response = requests.post(f"{BASE_URL}/posts/", json=post_data, headers=headers)
    print(f"Post creation: {response.status_code}")

    if response.status_code == 200:
        post_id = response.json()["post_id"]
        print(f"Created post with ID: {post_id}")
        return post_id
    return None

def test_sentiment_analysis(text="This is terrible! I hate everything about this."):
    """Test sentiment analysis endpoint"""
    print("Testing sentiment analysis...")

    response = requests.post(f"{BASE_URL}/posts/analyze", params={"text": text})
    print(f"Analysis: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"Sentiment: {result['sentiment']['sentiment_label']} ({result['sentiment']['confidence']:.2f})")
        print(f"Sarcastic: {result['sarcasm']['is_sarcastic']} ({result['sarcasm']['confidence']:.2f})")

def test_analytics():
    """Test analytics endpoint"""
    print("Testing analytics...")

    response = requests.get(f"{BASE_URL}/posts/analytics/sentiment")
    print(f"Analytics: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print("Sentiment Distribution:", result["sentiment_distribution"])
        print("Sarcasm Stats:", result["sarcasm_stats"])

if __name__ == "__main__":
    print("Starting API tests...\n")

    # Test basic functionality
    token = test_registration_and_login()
    if token:
        post_id = test_create_post(token)

    # Test AI analysis
    test_sentiment_analysis("I'm so happy today!")
    test_sentiment_analysis("Yeah, right... like that's going to work.")
    test_sentiment_analysis("This is okay, nothing special.")

    # Test analytics
    test_analytics()

    print("\nAPI tests completed!")
