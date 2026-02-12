import requests

def test_health():
    try:
        response = requests.get("http://localhost:7860/")
        print(f"Health check: {response.json()}")
    except Exception as e:
        print(f"Server not running or error: {e}")

if __name__ == "__main__":
    test_health()
