# 🐛 Fix: Conversations Not Appearing in Sanity Studio

## 🚨 The Problem

User provides email (`akaaaaa@gmail.com`), AI acknowledges it ("Thanks! Got it. 😊"), but:
- ❌ Conversation does NOT appear in Sanity Studio under "AI Conversations"
- ❌ No error in console
- ✅ AI agent seems to "take" the email

**Root Cause:** The `/api/chat/log` route was **missing the `_key` field** when creating message objects. Sanity requires a unique `_key` for each item in an array.

---

## ✅ The Fix

Updated `/home/lobster/projects/portfolio/app/api/chat/log/route.ts`:

### 1. **Added `_key` to Messages**

**Before:**
```typescript
messages: messages.map((m) => ({ 
  role: m.role, 
  content: m.content, 
  timestamp: m.timestamp 
})),
```

**After:**
```typescript
messages: messages.map((m) => ({
  _key: m.messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  role: m.role,
  content: m.content,
  timestamp: m.timestamp,
})),
```

✅ Each message now gets a unique `_key` (from `messageId` or auto-generated)

### 2. **Added Detailed Logging**

```typescript
console.log("[/api/chat/log] Received:", { email, sessionId, messageCount });
console.log("[/api/chat/log] Creating new conversation");
console.log("[/api/chat/log] ✅ Created successfully:", result._id);
```

Now we can see:
- When API is called
- What data it receives
- Whether create/patch succeeded
- The document ID created

---

## 🧪 How to Test

### Step 1: Make Sure Dev Server is Running

```bash
cd /home/lobster/projects/portfolio
npm run dev
```

Wait for: `✓ Ready in X.Xs`

### Step 2: Test the API Route Directly

```bash
curl -X POST http://localhost:3000/api/chat/log \
  -H 'Content-Type: application/json' \
  -d @/tmp/test-chat-log.json
```

**Expected output:**
```json
{"success":true}
```

**Expected logs in terminal:**
```
[/api/chat/log] Received: { email: 'test-api-route@example.com', sessionId: 'test-session-api-123', messageCount: 2 }
[/api/chat/log] Creating new conversation
[/api/chat/log] ✅ Created successfully: <some-id>
```

### Step 3: Verify in Sanity Studio

1. Open http://localhost:3333 (or your Sanity Studio URL)
2. Click **"AI Conversations"** in the sidebar
3. Look for conversation with email: `test-api-route@example.com`
4. Should show:
   - ✅ Email: test-api-route@example.com
   - ✅ Session ID: test-session-api-123
   - ✅ 2 messages (user + assistant)
   - ✅ Status: Active

### Step 4: Test with Real Chat UI

1. Open http://localhost:3000/chat (or wherever your chat is)
2. **Refresh the page** (to clear any old state)
3. Say: "Hi"
4. Agent asks for email
5. Provide: "akaaaaa@gmail.com"
6. Agent responds: "Thanks! Got it. 😊 ..."
7. **Check browser console** for logs like:
   ```
   [Chat:onMessage] POST /api/chat/log payload: { email: "akaaaaa@gmail.com", ... }
   [Chat:onMessage] /api/chat/log status: 200
   ```
8. **Check terminal** for server logs:
   ```
   [/api/chat/log] Received: { email: 'akaaaaa@gmail.com', ... }
   [/api/chat/log] ✅ Created successfully: ...
   ```
9. **Check Sanity Studio** → AI Conversations → Should see conversation with `akaaaaa@gmail.com`

---

## 🔍 Troubleshooting

### If API Returns 400 (Bad Request)

**Problem:** Missing email, sessionId, or messages

**Check:**
```bash
# In browser console, check the payload being sent:
[Chat:onMessage] POST /api/chat/log payload: { ... }
```

Ensure:
- ✅ `email` is a valid string (not "pending@temp.local")
- ✅ `sessionId` exists
- ✅ `messages` is an array with at least 1 item

### If API Returns 500 (Server Error)

**Problem:** Sanity write failed

**Check terminal logs for:**
```
/api/chat/log error Error: ...
```

Common issues:
- ❌ `SANITY_SERVER_API_TOKEN` not set or invalid
- ❌ Token doesn't have write permissions
- ❌ Network issue connecting to Sanity

**Fix:**
```bash
# Verify token is set
echo $SANITY_SERVER_API_TOKEN | wc -c  # Should be >50

# Or check .env.local
cat .env.local | grep SANITY_SERVER_API_TOKEN
```

### If No Logs Appear in Terminal

**Problem:** API route not being called

**Check browser console for:**
```
[Chat:onMessage] POST /api/chat/log payload: ...
```

If you see this but no server logs:
- ❌ Dev server might not be running
- ❌ Request going to wrong URL
- ❌ CORS issue (unlikely with Next.js)

**Fix:**
```bash
# Make sure dev server is running on port 3000
npm run dev
```

### If Conversation Appears But Email is Wrong

**Problem:** `userEmailRef` not updating correctly

**Check browser console:**
```
[Chat:email-captured] creating conversation with bootstrap message
```

If you DON'T see this when providing email:
- ❌ Email regex didn't match
- ❌ `needsEmailRef` was already false

**Fix:** Clear localStorage and refresh:
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

---

## 📋 Summary of All Files Changed

| File | Change | Why |
|------|--------|-----|
| `app/api/chat/log/route.ts` | Added `_key` to messages | Sanity requires unique keys for array items |
| `app/api/chat/log/route.ts` | Added console logging | Debug what's happening |

---

## ✅ Expected Result After Fix

1. User chats with AI
2. AI asks for email
3. User provides email (e.g., "akaaaaa@gmail.com")
4. **Browser console shows:** `/api/chat/log status: 200` ✅
5. **Server terminal shows:** `✅ Created successfully: <id>` ✅
6. **Sanity Studio shows:** New conversation with correct email ✅
7. User continues chatting
8. **All messages appear** in Sanity Studio ✅

---

## 🚀 Next Steps

1. ✅ **Code changes made** (API route fixed)
2. ⚠️ **Restart dev server** (if running)
3. ⚠️ **Test with curl** (Step 2 above)
4. ⚠️ **Test with real chat UI** (Step 4 above)
5. ⚠️ **Verify in Sanity Studio**

---

**If conversations still don't appear after this fix, check:**
- Is the dev server running?
- Are there any console errors?
- Are there any terminal errors?
- Is `SANITY_SERVER_API_TOKEN` set correctly?

Let me know the results! 🎉

