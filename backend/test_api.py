import requests
import json
from typing import Optional
import time

BASE_URL = "https://db.varunadhityagb.live/api/v1"

class APITester:
    def __init__(self):
        self.token = None
        self.user_id = None
        self.post_id = None
        self.comment_id = None
        self.second_user_token = None
        self.second_user_id = None
        
    def print_response(self, title: str, response):
        """Pretty print response"""
        print(f"\n{'='*60}")
        print(f"{title}")
        print(f"{'='*60}")
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response: {response.text}")
        
        # Check for authentication errors
        if response.status_code == 401:
            print("⚠️  AUTHENTICATION ERROR - Token may be invalid or expired")
        elif response.status_code == 403:
            print("⚠️  AUTHORIZATION ERROR - User not allowed to perform this action")
        
    def get_headers(self, token: Optional[str] = None):
        """Get authorization headers"""
        if token is None:
            token = self.token
        if token:
            return {"Authorization": f"Bearer {token}"}
        return {}
    
    # ==================== AUTHENTICATION ====================
    
    def test_register(self, username: str, email: str, password: str):
        """Test user registration"""
        data = {
            "user_name": username,
            "user_email": email,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=data)
        self.print_response(f"Register User: {username}", response)
        if response.status_code == 200:
            return response.json()
        return None
    
    def test_login(self, username: str, password: str):
        """Test user login"""
        data = {
            "username": username,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=data)
        self.print_response(f"Login User: {username}", response)
        if response.status_code == 200:
            token = response.json()["access_token"]
            print(f"✅ Token acquired: {token[:20]}...")
            return token
        return None
    
    # ==================== USER ENDPOINTS ====================
    
    def test_get_current_user(self):
        """Test get current user info"""
        print(f"🔑 Using token: {self.token[:20] if self.token else 'None'}...")
        response = requests.get(
            f"{BASE_URL}/users/me",
            headers=self.get_headers()
        )
        self.print_response("Get Current User", response)
        if response.status_code == 200:
            self.user_id = response.json()["user_id"]
            print(f"✅ User ID set to: {self.user_id}")
        return response
    
    def test_update_current_user(self):
        """Test update current user profile"""
        data = {
            "user_email": "updated_email@example.com",
            "profile_pic_url": "https://example.com/updated_pic.jpg"
        }
        response = requests.put(
            f"{BASE_URL}/users/me",
            json=data,
            headers=self.get_headers()
        )
        self.print_response("Update Current User", response)
        return response
    
    def test_get_user_by_id(self, user_id: int):
        """Test get user profile by ID"""
        response = requests.get(f"{BASE_URL}/users/{user_id}")
        self.print_response(f"Get User {user_id}", response)
        return response
    
    def test_follow_user(self, user_id: int):
        """Test follow a user"""
        response = requests.post(
            f"{BASE_URL}/users/{user_id}/follow",
            headers=self.get_headers()
        )
        self.print_response(f"Follow User {user_id}", response)
        return response
    
    def test_unfollow_user(self, user_id: int):
        """Test unfollow a user"""
        response = requests.delete(
            f"{BASE_URL}/users/{user_id}/follow",
            headers=self.get_headers()
        )
        self.print_response(f"Unfollow User {user_id}", response)
        return response
    
    # ==================== POST ENDPOINTS ====================
    
    def test_create_post(self, title: str, content: str):
        """Test create a post"""
        data = {
            "title": title,
            "content": content
        }
        response = requests.post(
            f"{BASE_URL}/posts/",
            json=data,
            headers=self.get_headers()
        )
        self.print_response(f"Create Post: {title}", response)
        if response.status_code == 200:
            self.post_id = response.json()["post_id"]
            print(f"✅ Post ID set to: {self.post_id}")
        return response
    
    def test_get_posts(self, skip: int = 0, limit: int = 10):
        """Test get all posts"""
        response = requests.get(
            f"{BASE_URL}/posts/",
            params={"skip": skip, "limit": limit}
        )
        self.print_response("Get All Posts", response)
        return response
    
    def test_get_posts_filtered(self, sentiment: str):
        """Test get posts with sentiment filter"""
        response = requests.get(
            f"{BASE_URL}/posts/",
            params={"sentiment_filter": sentiment, "include_sarcastic": True}
        )
        self.print_response(f"Get Posts (Sentiment: {sentiment})", response)
        return response
    
    def test_get_single_post(self, post_id: int):
        """Test get a single post"""
        response = requests.get(f"{BASE_URL}/posts/{post_id}")
        self.print_response(f"Get Post {post_id}", response)
        return response
    
    def test_update_post(self, post_id: int):
        """Test update a post"""
        data = {
            "title": "Updated Post Title",
            "content": "This is the updated content. I'm feeling great about this change!"
        }
        response = requests.put(
            f"{BASE_URL}/posts/{post_id}",
            json=data,
            headers=self.get_headers()
        )
        self.print_response(f"Update Post {post_id}", response)
        return response
    
    def test_delete_post(self, post_id: int):
        """Test delete a post"""
        response = requests.delete(
            f"{BASE_URL}/posts/{post_id}",
            headers=self.get_headers()
        )
        self.print_response(f"Delete Post {post_id}", response)
        return response
    
    def test_get_user_posts(self, user_id: int):
        """Test get user's posts"""
        response = requests.get(f"{BASE_URL}/posts/user/{user_id}")
        self.print_response(f"Get Posts by User {user_id}", response)
        return response
    
    def test_like_post(self, post_id: int):
        """Test like a post"""
        response = requests.post(
            f"{BASE_URL}/posts/{post_id}/like",
            headers=self.get_headers()
        )
        self.print_response(f"Like Post {post_id}", response)
        return response
    
    def test_unlike_post(self, post_id: int):
        """Test unlike a post"""
        response = requests.delete(
            f"{BASE_URL}/posts/{post_id}/like",
            headers=self.get_headers()
        )
        self.print_response(f"Unlike Post {post_id}", response)
        return response
    
    def test_get_post_likes(self, post_id: int):
        """Test get post like statistics"""
        response = requests.get(
            f"{BASE_URL}/posts/{post_id}/likes",
            headers=self.get_headers()
        )
        self.print_response(f"Get Likes for Post {post_id}", response)
        return response
    
    def test_get_post_analysis(self, post_id: int):
        """Test get post AI analysis"""
        response = requests.get(f"{BASE_URL}/posts/{post_id}/analysis")
        self.print_response(f"Get Analysis for Post {post_id}", response)
        return response
    
    def test_analyze_text(self, text: str):
        """Test analyze arbitrary text"""
        response = requests.post(
            f"{BASE_URL}/posts/analyze",
            params={"text": text}
        )
        self.print_response(f"Analyze Text: '{text[:50]}...'", response)
        return response
    
    def test_get_sentiment_analytics(self):
        """Test get sentiment analytics"""
        response = requests.get(f"{BASE_URL}/posts/analytics/sentiment")
        self.print_response("Get Sentiment Analytics", response)
        return response
    
    # ==================== COMMENT ENDPOINTS ====================
    
    def test_create_comment(self, post_id: int, content: str, parent_id: Optional[int] = None):
        """Test create a comment"""
        data = {
            "content": content,
            "parent_comment_id": parent_id
        }
        response = requests.post(
            f"{BASE_URL}/posts/{post_id}/comments",
            json=data,
            headers=self.get_headers()
        )
        self.print_response(f"Create Comment on Post {post_id}", response)
        if response.status_code == 200:
            self.comment_id = response.json()["comment_id"]
            print(f"✅ Comment ID set to: {self.comment_id}")
        return response
    
    def test_get_comments(self, post_id: int):
        """Test get all comments for a post"""
        response = requests.get(f"{BASE_URL}/posts/{post_id}/comments")
        self.print_response(f"Get Comments for Post {post_id}", response)
        return response
    
    def test_update_comment(self, post_id: int, comment_id: int):
        """Test update a comment"""
        data = {
            "content": "This is my updated comment with new thoughts!"
        }
        response = requests.put(
            f"{BASE_URL}/posts/{post_id}/comments/{comment_id}",
            json=data,
            headers=self.get_headers()
        )
        self.print_response(f"Update Comment {comment_id}", response)
        return response
    
    def test_delete_comment(self, post_id: int, comment_id: int):
        """Test delete a comment"""
        response = requests.delete(
            f"{BASE_URL}/posts/{post_id}/comments/{comment_id}",
            headers=self.get_headers()
        )
        self.print_response(f"Delete Comment {comment_id}", response)
        return response
    
    def test_like_comment(self, post_id: int, comment_id: int):
        """Test like a comment"""
        response = requests.post(
            f"{BASE_URL}/posts/{post_id}/comments/{comment_id}/like",
            headers=self.get_headers()
        )
        self.print_response(f"Like Comment {comment_id}", response)
        return response
    
    def test_unlike_comment(self, post_id: int, comment_id: int):
        """Test unlike a comment"""
        response = requests.delete(
            f"{BASE_URL}/posts/{post_id}/comments/{comment_id}/like",
            headers=self.get_headers()
        )
        self.print_response(f"Unlike Comment {comment_id}", response)
        return response
    
    def test_get_comment_likes(self, post_id: int, comment_id: int):
        """Test get comment like statistics"""
        response = requests.get(
            f"{BASE_URL}/posts/{post_id}/comments/{comment_id}/likes",
            headers=self.get_headers()
        )
        self.print_response(f"Get Likes for Comment {comment_id}", response)
        return response
    
    # ==================== HEALTH ENDPOINTS ====================
    
    def test_root(self):
        """Test root endpoint"""
        response = requests.get("http://localhost:8000/")
        self.print_response("Root Endpoint", response)
        return response
    
    def test_health(self):
        """Test health check endpoint"""
        response = requests.get("http://localhost:8000/health")
        self.print_response("Health Check", response)
        return response
    
    # ==================== COMPREHENSIVE TEST SUITE ====================
    
    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("\n" + "="*60)
        print("STARTING COMPREHENSIVE API TEST SUITE")
        print("="*60)
        
        # Health checks
        print("\n\n### TESTING HEALTH ENDPOINTS ###")
        self.test_root()
        self.test_health()
        
        # Authentication - User 1
        print("\n\n### TESTING AUTHENTICATION - USER 1 ###")
        self.test_register("testuser1", "test1@example.com", "password123")
        self.token = self.test_login("testuser1", "password123")
        
        if not self.token:
            print("❌ Failed to get token for user 1. Stopping tests.")
            return
        
        # Give server time to process
        time.sleep(1)
        
        # User endpoints - User 1
        print("\n\n### TESTING USER ENDPOINTS - USER 1 ###")
        self.test_get_current_user()
        
        if not self.user_id:
            print("❌ Failed to get user_id for user 1. Stopping tests.")
            return
        
        self.test_update_current_user()
        self.test_get_user_by_id(self.user_id)
        
        # Authentication - User 2
        print("\n\n### TESTING AUTHENTICATION - USER 2 ###")
        self.test_register("testuser2", "test2@example.com", "password456")
        self.second_user_token = self.test_login("testuser2", "password456")
        
        if not self.second_user_token:
            print("❌ Failed to get token for user 2. Continuing with limited tests.")
        else:
            # Get second user ID
            original_token = self.token
            self.token = self.second_user_token
            time.sleep(1)
            self.test_get_current_user()
            self.second_user_id = self.user_id
            # Switch back to user 1
            self.token = original_token
            self.user_id = None
            self.test_get_current_user()  # Get user 1 ID again
            
            # Follow/unfollow
            print("\n\n### TESTING FOLLOW/UNFOLLOW ###")
            self.test_follow_user(self.second_user_id)
            self.test_unfollow_user(self.second_user_id)
            self.test_follow_user(self.second_user_id)
        
        # Post endpoints
        print("\n\n### TESTING POST ENDPOINTS ###")
        self.test_create_post(
            "My Amazing Day!",
            "Today was absolutely wonderful! I'm so happy and excited about everything."
        )
        first_post_id = self.post_id
        
        if not first_post_id:
            print("❌ Failed to create first post. Stopping post tests.")
            return
        
        # Wait for AI analysis
        time.sleep(2)
        
        self.test_create_post(
            "Terrible Experience",
            "This is the worst day ever. Everything went wrong. I hate this!"
        )
        
        self.test_create_post(
            "Sarcastic Post",
            "Oh yeah, sure... like that's going to work. Right."
        )
        
        # Wait for AI analysis
        time.sleep(2)
        
        self.test_get_posts()
        self.test_get_posts_filtered("positive")
        self.test_get_single_post(first_post_id)
        self.test_update_post(first_post_id)
        self.test_get_user_posts(self.user_id)
        
        # AI Analysis
        print("\n\n### TESTING AI ANALYSIS ###")
        self.test_get_post_analysis(first_post_id)
        self.test_analyze_text("I'm feeling neutral about this situation.")
        self.test_analyze_text("This is amazing! Best thing ever!")
        self.test_analyze_text("Yeah right, like I believe that...")
        
        # Post likes
        print("\n\n### TESTING POST LIKES ###")
        self.test_like_post(first_post_id)
        self.test_get_post_likes(first_post_id)
        
        if self.second_user_token:
            # Like from second user
            original_token = self.token
            self.token = self.second_user_token
            self.test_like_post(first_post_id)
            self.token = original_token
        
        self.test_get_post_likes(first_post_id)
        self.test_unlike_post(first_post_id)
        self.test_get_post_likes(first_post_id)
        
        # Comment endpoints
        print("\n\n### TESTING COMMENT ENDPOINTS ###")
        self.test_create_comment(first_post_id, "Great post! I totally agree with you.")
        first_comment_id = self.comment_id
        
        if not first_comment_id:
            print("❌ Failed to create comment. Skipping comment tests.")
        else:
            # Wait for AI analysis
            time.sleep(1)
            
            self.test_create_comment(
                first_post_id,
                "This is a reply to the first comment",
                parent_id=first_comment_id
            )
            
            self.test_get_comments(first_post_id)
            self.test_update_comment(first_post_id, first_comment_id)
            
            # Comment likes
            print("\n\n### TESTING COMMENT LIKES ###")
            self.test_like_comment(first_post_id, first_comment_id)
            self.test_get_comment_likes(first_post_id, first_comment_id)
            
            if self.second_user_token:
                # Like from second user
                original_token = self.token
                self.token = self.second_user_token
                self.test_like_comment(first_post_id, first_comment_id)
                self.token = original_token
            
            self.test_get_comment_likes(first_post_id, first_comment_id)
            self.test_unlike_comment(first_post_id, first_comment_id)
            
            # Delete comment
            print("\n\n### TESTING DELETE OPERATIONS ###")
            self.test_delete_comment(first_post_id, first_comment_id)
        
        # Analytics
        print("\n\n### TESTING ANALYTICS ###")
        self.test_get_sentiment_analytics()
        
        # Create and delete a post
        self.test_create_post("Post to Delete", "This post will be deleted")
        delete_post_id = self.post_id
        if delete_post_id:
            self.test_delete_post(delete_post_id)
        
        print("\n\n" + "="*60)
        print("ALL TESTS COMPLETED!")
        print("="*60)


if __name__ == "__main__":
    tester = APITester()
    
    print("="*60)
    print("API COMPREHENSIVE TEST SUITE")
    print("="*60)
    print("\nMake sure your API server is running on http://localhost:8000")
    print("\nThis will test:")
    print("  ✓ Authentication (register, login)")
    print("  ✓ User management (get, update, follow)")
    print("  ✓ Posts (CRUD operations)")
    print("  ✓ Comments (CRUD operations)")
    print("  ✓ Likes (posts and comments)")
    print("  ✓ AI Analysis (sentiment, sarcasm)")
    print("  ✓ Analytics")
    print("\nPress Enter to start testing...")
    input()
    
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
