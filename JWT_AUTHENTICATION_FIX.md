# JWT Authentication Fix Guide

## Problem
**"Invalid or expired JWT token" error from backend API**

The frontend was **not passing the JWT token** in the Authorization header when making requests to the API. The token is required for all authenticated endpoints.

---

## Root Cause

### Before (❌ Broken)
```typescript
// ChatInterface.tsx - NO token in header
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Missing Authorization header!
  },
  body: JSON.stringify({ message, model }),
});
```

### After (✅ Fixed)
```typescript
// ChatInterface.tsx - Include token
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({ message, model }),
});
```

---

## How It Works

### 1. Getting the Token from Supabase

The `AuthContext` stores the Supabase session which includes the access token:

```typescript
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const { session, user, loading } = useAuth();
  
  // session.access_token is the JWT token
  // It's automatically refreshed by Supabase when expired
}
```

### 2. Passing Token in Request

Always include the token in the `Authorization` header with the `Bearer` schema:

```typescript
const token = session.access_token;

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,  // ← This is required
  },
  body: JSON.stringify({ message, model }),
});
```

### 3. Backend Verification

The backend automatically extracts and verifies the token:

1. Extract token from `Authorization: Bearer {token}` header
2. Decode JWT payload (contains `sub` = user ID, `email`, `exp` = expiration)
3. Check if token is expired
4. Extract user ID and attach to request
5. Proceed with rate limiting and processing

---

## Fixed Files

### 1. **src/components/ChatInterface.tsx**
- ✅ Now imports `useAuth` from AuthContext
- ✅ Gets `session` from auth context
- ✅ Includes token in Authorization header
- ✅ Handles 401 Unauthorized responses
- ✅ Shows auth error messages to user
- ✅ Checks authentication before sending message

### 2. **src/lib/utils/apiClient.ts** (NEW)
Utility functions for making authenticated requests:

```typescript
// Make authenticated fetch request
import { fetchWithAuth } from '@/lib/utils/apiClient';

const response = await fetchWithAuth('/api/chat', token, {
  method: 'POST',
  body: JSON.stringify({ message, model }),
});

// Or use the typed JSON version
import { fetchWithAuthJSON } from '@/lib/utils/apiClient';

const data = await fetchWithAuthJSON('/api/chat', token, {
  method: 'POST',
  body: JSON.stringify({ message, model }),
});
```

### 3. **src/lib/middleware/auth.ts**
Already correctly:
- Extracts JWT from Authorization header
- Verifies token structure and expiration
- Returns 401 error if invalid/expired
- Logs authentication events

---

## Usage Patterns

### Pattern 1: Direct fetch request
```typescript
import { useAuth } from '@/context/AuthContext';

export default function ChatComponent() {
  const { session } = useAuth();

  const handleSend = async (message: string) => {
    if (!session?.access_token) {
      console.error('Not authenticated');
      return;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ message, model: 'mixtral-8x7b-32768' }),
    });

    if (response.status === 401) {
      console.error('Token expired or invalid');
      // User needs to sign in again
      return;
    }

    const data = await response.json();
    console.log(data);
  };
}
```

### Pattern 2: Using utility functions (Recommended)
```typescript
import { useAuth } from '@/context/AuthContext';
import { fetchWithAuthJSON } from '@/lib/utils/apiClient';

export default function ChatComponent() {
  const { session } = useAuth();

  const handleSend = async (message: string) => {
    if (!session?.access_token) {
      console.error('Not authenticated');
      return;
    }

    try {
      const data = await fetchWithAuthJSON('/api/chat', session.access_token, {
        method: 'POST',
        body: JSON.stringify({ message, model: 'mixtral-8x7b-32768' }),
      });
      console.log(data);
    } catch (error) {
      console.error('API Error:', error.message);
    }
  };
}
```

---

## Common Errors & Solutions

### 1. **401 Unauthorized**
```
Error: Invalid or expired JWT token
```
**Solutions:**
- ✅ Check token is being passed in Authorization header
- ✅ Verify token format: `Bearer {token}` (with space)
- ✅ Check browser cookies have Supabase session
- ✅ Sign in again to refresh token

### 2. **Token is undefined**
```typescript
const token = session.access_token; // undefined
```
**Solutions:**
- ✅ Wait for `loading` to be false before using session
- ✅ Check user is actually signed in
- ✅ Verify AuthProvider wraps your app

### 3. **Token expires during request**
Supabase automatically handles token refresh, but if it fails:
- ✅ Implement retry logic with fresh token
- ✅ Force user to sign in again on persistent 401
- ✅ Use session refresh interval

---

## Debug Checklist

### Frontend
- [ ] `useAuth` hook imported in component
- [ ] `session` is available (not null)
- [ ] `session.access_token` exists
- [ ] Token is included in `Authorization` header
- [ ] Header format is: `Authorization: Bearer {token}`
- [ ] No typos in header name
- [ ] User is actually signed in via Supabase
- [ ] Browser DevTools > Network shows Authorization header in request

### Backend
- [ ] Auth middleware receives the Authorization header
- [ ] Token is extracted correctly (remove "Bearer " prefix)
- [ ] JWT decoding doesn't throw error
- [ ] Token has `exp` field
- [ ] `exp * 1000 > Date.now()` (not expired)
- [ ] Logs show "JWT verification successful"

### Testing with cURL
```bash
# 1. Get a real token from Supabase first
TOKEN="your_actual_token_here"

# 2. Test the endpoint WITH token (should work)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "Hello", "model": "mixtral-8x7b-32768"}'

# 3. Test WITHOUT token (should fail with 401)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "model": "mixtral-8x7b-32768"}'

# 4. Test with invalid token (should fail with 401)
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{"message": "Hello", "model": "mixtral-8x7b-32768"}'
```

---

## Browser DevTools Debugging

### Check if Token is Being Sent
1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Make a chat request
4. Click on the `/api/chat` request
5. Go to **Request Headers**
6. Look for: `authorization: Bearer <token>`

If missing, check that:
- ✅ Component has access to session
- ✅ You're inside AuthProvider
- ✅ Token exists before request

### Check Token Contents
1. Open **Console** (F12)
2. Run:
```javascript
// Get token from your app's context
const token = document.querySelector('[data-token]')?.value;
console.log(token);

// Decode token payload (base64)
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log(payload);

// Check expiration
const expiryDate = new Date(payload.exp * 1000);
console.log('Token expires:', expiryDate);
console.log('Is expired?', expiryDate < new Date());
```

---

## Automatic Token Refresh

Supabase automatically handles token refresh:

```typescript
// AuthContext already does this:
supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session); // Automatically refreshed token
  setUser(session?.user ?? null);
});
```

You don't need to manually refresh the token. If it's about to expire, Supabase refreshes it automatically.

---

## Security Notes

✅ **What's secure:**
- Token stored in Supabase's secure session storage
- Token automatically refreshed before expiry
- Token sent over HTTPS (requires in production)
- Backend verifies token expiration
- Per-user rate limiting with user ID from token

⚠️ **What to improve for production:**
- Verify JWT signature using Supabase public key (not just structure)
- Implement proper Session management
- Use HTTPS only in production
- Add CORS properly configured
- Monitor token usage and suspicious patterns

---

## Next Steps

1. **Test the fix:**
   - Sign in on the web app
   - Try sending a message
   - Check that it works without 401 error

2. **Monitor in DevTools:**
   - Verify Authorization header is present
   - Check response status is 200, not 401

3. **Watch for edge cases:**
   - Signature out and try to send message (should show error)
   - Long sessions to test auto-refresh
   - Multiple tabs to check session sync

---

## References

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **JWT Tokens:** https://jwt.io
- **Bearer Token Scheme:** https://oauth.net/2/bearer-tokens/
- **Next.js Fetch API:** https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
