# VidSense AI - Testing Guide

## ✅ Project Status: Working

The backend is fully operational. Here's how to test each component:

---

## 1. Backend API Testing

### Health Check
```bash
# Status: ✅ Working
curl http://localhost:8000/health
# Response: {"status": "ok"}
```

### YouTube Ingestion
```bash
# Ingest a video (fetches transcript + creates embeddings)
POST http://localhost:8000/ingest/youtube/jNQXAC9IVRw

# Response:
# {
#   "video_id": "jNQXAC9IVRw",
#   "chunks": 1
# }
```

### Ask Questions
```bash
# Ask about the ingested video
POST http://localhost:8000/ask
Content-Type: application/json

{
  "question": "What is this video about?",
  "session_id": "user123"
}

# Response (Status: ✅ 200 OK):
# {
#   "question": "What is this video about?",
#   "answer": "The topic of this video is elephants and their long trunks.",
#   "source": "transcript"
# }
```

---

## 2. Chrome Extension Setup

### Step 1: Load the Extension
1. Open **Chrome** browser
2. Go to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle at top-right)
4. Click **"Load unpacked"**
5. Select folder: `d:\Projects\VidSense-AI\extension`
6. The extension should appear in your extensions list

### Step 2: Verify Extension Loaded
- You should see "VidSense AI" extension with icon
- Check Extension Details tab for manifest info

---

## 3. Full End-to-End Test Flow

### Test Scenario: YouTube Video Chat

**Step 1: Start Backend**
```powershell
cd d:\Projects\VidSense-AI\backend
Push-Location d:\Projects\VidSense-AI\backend
d:/Projects/VidSense-AI/.venv/Scripts/python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
✅ You should see: `Application startup complete.`

**Step 2: Ingest a YouTube Video**
```python
import requests

# Option A: Use a sample video
video_id = "jNQXAC9IVRw"

# Option B: Use any YouTube video ID
# video_id = "VIDEO_ID_HERE"

response = requests.post(
    f'http://localhost:8000/ingest/youtube/{video_id}'
)
print(response.json())
# Should show: {"video_id": "jNQXAC9IVRw", "chunks": 1}
```

**Step 3: Test Ask Endpoint**
```python
import requests

response = requests.post(
    'http://localhost:8000/ask',
    json={
        'question': 'What is this video about?',
        'session_id': 'test_user_123'
    }
)
print(response.json())
# Example response:
# {
#   "question": "What is this video about?",
#   "answer": "The video is about elephants and their long trunks.",
#   "source": "transcript"
# }
```

**Step 4: Test Chrome Extension**
1. Visit any YouTube video
   - Example: `https://www.youtube.com/watch?v=jNQXAC9IVRw`
2. Click the **VidSense AI** extension icon in the toolbar
3. A popup should appear with a chat interface
4. Type a question: `"What is this video about?"`
5. **Expected Result**: The extension should:
   - Make a request to `http://localhost:8000/ingest/youtube/{video_id}`
   - Then ask the question and display the answer
   - Show the response with source attribution

---

## 4. Testing Checklist

| Component | Test | Expected Result | Status |
|-----------|------|-----------------|--------|
| Backend Health | GET /health | 200 OK, {"status": "ok"} | ✅ |
| Ingestion | POST /ingest/youtube/{id} | 200 OK, chunks returned | ✅ |
| Ask Endpoint | POST /ask | 200 OK, answer returned | ✅ |
| HF Token | Direct API call | Works with Mistral | ✅ |
| Query Rewriting | Rewrite query | Keyword optimization | ✅ |
| Vector Store | FAISS build | Embeddings created | ✅ |
| Extension Load | Load unpacked | Extension appears | ➡️ |
| Extension Chat | Click extension + ask | Answer displayed | ➡️ |

---

## 5. Quick Python Test Script

Save this as `test_vidsense.py` and run it:

```python
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 50)
print("VidSense AI - Full Test Suite")
print("=" * 50)

# Test 1: Health Check
print("\n[1] Testing Health Endpoint...")
try:
    resp = requests.get(f"{BASE_URL}/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
    print("✅ Health check PASSED")
except Exception as e:
    print(f"❌ Health check FAILED: {e}")

# Test 2: Ingest Video
print("\n[2] Testing YouTube Ingestion...")
try:
    video_id = "jNQXAC9IVRw"
    resp = requests.post(f"{BASE_URL}/ingest/youtube/{video_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert "video_id" in data
    assert "chunks" in data
    print(f"✅ Ingestion PASSED - {data['chunks']} chunks created")
except Exception as e:
    print(f"❌ Ingestion FAILED: {e}")

# Test 3: Ask Question
print("\n[3] Testing Ask Endpoint...")
try:
    resp = requests.post(
        f"{BASE_URL}/ask",
        json={
            "question": "What is the main topic?",
            "session_id": "test_session_123"
        }
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
    assert "source" in data
    print(f"✅ Ask PASSED")
    print(f"   Question: {data['question']}")
    print(f"   Answer: {data['answer']}")
    print(f"   Source: {data['source']}")
except Exception as e:
    print(f"❌ Ask FAILED: {e}")

print("\n" + "=" * 50)
print("Test suite completed!")
print("=" * 50)
```

Run it:
```bash
cd d:\Projects\VidSense-AI\backend
d:/Projects/VidSense-AI/.venv/Scripts/python.exe test_vidsense.py
```

---

## 6. Chrome Extension Testing

### What Happens When You Click the Extension:
1. **content.js** extracts the YouTube video ID from the URL
2. **popup.js** sends a request to:
   - `POST /ingest/youtube/{video_id}` (first time)
   - `POST /ask` with the user's question
3. The backend responds with the answer
4. **popup.html** displays the answer in a scrollable chat interface

### Expected Extension Behavior:
- Icon appears on YouTube video pages
- Clicking icon opens a chat popup
- Popup has a text input field for questions
- Submit button sends question to backend
- Answer appears in chat bubbles
- Multiple questions maintain session context

---

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Ensure you're in `backend/` folder before running uvicorn |
| 401 Token error | Verify `backend/.env` has correct `HUGGINGFACEHUB_API_TOKEN` |
| Extension not loading | Go to `chrome://extensions/`, enable Developer Mode, click "Load unpacked" |
| 500 error on /ask | Check backend logs - might be awaiting LLM response (can take 10-30 seconds) |
| No video transcript found | Verify the YouTube video ID is correct and video has captions enabled |

---

## 8. Success Indicators

✅ **All Systems Go** if:
- Backend health check returns 200 OK
- Ingestion completes without errors
- Ask endpoint returns meaningful answers
- Extension loads and appears on YouTube pages
- Extension popup can connect to backend

---

