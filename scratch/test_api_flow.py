import urllib.request
import json

base_url = "http://127.0.0.1:8000"

def test_api():
    print("=== STARTING API FLOW INTEGRATION TEST ===")
    
    # 1. Register a new user
    register_data = {
        "username": "ramesh_farmer",
        "password": "securepassword123",
        "name": "Ramesh Kumar",
        "age": 38,
        "income": 75000.0,
        "land_size": 1.8, # Under 2 hectares (approx 4.9 acres)
        "state": "Punjab",
        "district": "Amritsar"
    }
    
    req_reg = urllib.request.Request(
        f"{base_url}/register",
        data=json.dumps(register_data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        with urllib.request.urlopen(req_reg) as res:
            response = json.loads(res.read().decode("utf-8"))
            print("1. Registration Response:", response)
            assert response.get("status") in ["success", "error"], "Registration response format error"
    except Exception as e:
        print("Registration failed:", e)
        return

    # 2. Login
    login_data = {
        "username": "ramesh_farmer",
        "password": "securepassword123"
    }
    
    req_log = urllib.request.Request(
        f"{base_url}/login",
        data=json.dumps(login_data).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    user_id = None
    try:
        with urllib.request.urlopen(req_log) as res:
            response = json.loads(res.read().decode("utf-8"))
            print("2. Login Response:", response)
            assert response.get("status") == "success", "Login failed"
            user_id = response.get("user_id")
            print(f"   Logged in! User ID: {user_id}")
    except Exception as e:
        print("Login failed:", e)
        return

    # 3. Get Profile and Recommendations via Dashboard
    try:
        with urllib.request.urlopen(f"{base_url}/dashboard/{user_id}") as res:
            response = json.loads(res.read().decode("utf-8"))
            print("\n3. Dashboard Response Summary:")
            print(f"   Farmer Name: {response['profile']['name']}")
            print(f"   Land Size: {response['profile']['land_size']} Acres")
            print(f"   Eligible Schemes Count: {response['recommendations']['total_eligible']}")
            print("   Eligible Schemes:")
            for scheme in response['recommendations']['eligible_schemes']:
                print(f"     - {scheme['scheme_name']}: {scheme['title']}")
    except Exception as e:
        print("Dashboard query failed:", e)
        return

    # 4. Ask a question to the Chatbot
    chat_query = {
        "question": "What is KCC and who can apply?"
    }
    
    req_chat = urllib.request.Request(
        f"{base_url}/ask/{user_id}",
        data=json.dumps(chat_query).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    
    try:
        print("\n4. Asking Chatbot: 'What is KCC and who can apply?' (waiting for response...)")
        with urllib.request.urlopen(req_chat) as res:
            response = json.loads(res.read().decode("utf-8"))
            print("   AI Response:", response.get("answer"))
    except Exception as e:
        print("Chatbot query failed:", e)
        return

    # 5. Fetch Chat History
    try:
        with urllib.request.urlopen(f"{base_url}/chat-history/{user_id}") as res:
            response = json.loads(res.read().decode("utf-8"))
            print(f"\n5. Chat History count: {len(response)} entries")
            print("   Last question in history:", response[0] if response else "Empty")
    except Exception as e:
        print("Chat history query failed:", e)
        return

    print("\n=== ALL API FLOW INTEGRATION TESTS COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    test_api()
