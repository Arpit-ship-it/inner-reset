# 🚀 Ngrok Setup Guide - Fix Frontend Visibility Issue

## Problem
Registered users are not visible on the frontend when accessed via ngrok because the frontend was making API calls to `localhost:5000` instead of the ngrok URL.

## ✅ Fixed Issues

### 1. **Removed Hardcoded localhost URLs**
- Replaced all `http://localhost:5000` references in `frontend/src/App.jsx` with `API_BASE_URL`
- Now all API calls dynamically use the configured base URL

### 2. **Updated CORS Configuration**
- Backend (`server.js`) now accepts requests from ngrok domains
- Supports: `ngrok.io`, `ngrok-free.app`, and `loca.lt`

### 3. **Created Frontend .env File**
- Added `frontend/.env` for development configuration
- You need to update this with your actual ngrok URL

---

## 📋 Step-by-Step Setup Instructions

### Step 1: Get Your Ngrok URL

Start ngrok for your backend server:

```bash
ngrok http 5000
```

You'll see output like:
```
Forwarding  https://abc123xyz.ngrok-free.app -> http://localhost:5000
```

Copy the HTTPS URL (e.g., `https://abc123xyz.ngrok-free.app`)

### Step 2: Update Frontend .env File

Open `frontend/.env` and replace the URL:

```env
VITE_API_URL=https://your-actual-ngrok-url.ngrok-free.app
```

**Example:**
```env
VITE_API_URL=https://abc123xyz.ngrok-free.app
```

### Step 3: Restart Frontend Dev Server

Stop your frontend server (Ctrl+C) and restart:

```bash
cd frontend
npm run dev
```

### Step 4: Access Frontend via Ngrok (Optional)

If you also want to access the frontend via ngrok:

**Terminal 1 (Backend):**
```bash
ngrok http 5000
```

**Terminal 2 (Frontend - in another terminal):**
```bash
ngrok http 5173
```

Then update `frontend/.env` with the backend ngrok URL and access the frontend through its ngrok URL.

---

## 🔍 Troubleshooting

### Issue: Still showing empty table

**Solution:**
1. Check browser console (F12) for errors
2. Verify the API URL in console log: "🔗 API Base URL: ..."
3. Make sure backend server is running
4. Verify ngrok URL is still active (ngrok URLs expire)

### Issue: CORS errors

**Solution:**
- Backend CORS is now configured to accept ngrok domains
- If still getting errors, check that your ngrok URL matches the one in `.env`

### Issue: "Failed to load users"

**Solution:**
1. Verify backend is running: `http://YOUR_NGROK_URL/api/auth/users`
2. Check if database has users
3. Check backend console for errors

### Issue: Users exist but not showing

**Solution:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check the API URL being called
4. Verify it's using ngrok URL, not localhost
5. Check Network tab to see if API call is succeeding

---

## ✅ Quick Verification Checklist

- [ ] Backend server is running (`node server.js`)
- [ ] Ngrok is running for backend (`ngrok http 5000`)
- [ ] Copied ngrok HTTPS URL
- [ ] Updated `frontend/.env` with ngrok URL
- [ ] Restarted frontend dev server
- [ ] Browser console shows correct API Base URL
- [ ] Network tab shows API calls going to ngrok URL

---

## 📱 Testing the Fix

1. Open frontend in browser
2. Press F12 to open DevTools
3. Look for console message: `🔗 API Base URL: https://your-ngrok-url...`
4. Click "▼ View Registered Users"
5. Check Network tab - should see request to `https://your-ngrok-url.../api/auth/users`
6. Users should now appear in the table!

---

## 🔄 Alternative: Using localtunnel

If you prefer localtunnel instead of ngrok:

```bash
# Install globally
npm install -g localtunnel

# Start tunnel
lt --port 5000
```

Update `frontend/.env`:
```env
VITE_API_URL=https://your-subdomain.loca.lt
```

---

## 📝 Important Notes

1. **Ngrok URLs change** every time you restart ngrok (unless using paid version)
2. **Always update .env** when you get a new ngrok URL
3. **Restart frontend** after changing .env file
4. **Free ngrok** may show warning page - click "Visit Site" to proceed
5. **Database changes** - If you added new users while localhost wasn't working, the users ARE in the database, they just weren't showing because frontend couldn't fetch them

---

## 🎯 Expected Result

After following these steps:
- ✅ Frontend opens via ngrok
- ✅ "View Registered Users" button shows count
- ✅ Table displays all registered users
- ✅ All 3 action buttons work (Send Quote, Pause, Remove)
- ✅ Status and Days Left columns show correctly

---

## 💡 Pro Tips

1. **For testing**, you can directly hit your API in browser:
   ```
   https://your-ngrok-url.ngrok-free.app/api/auth/users
   ```
   This should return JSON with all users.

2. **Keep ngrok running** in a separate terminal window

3. **Use ngrok dashboard** to see incoming requests:
   ```
   http://localhost:4040
   ```

4. **Environment-specific configs:**
   - Development: Use `frontend/.env`
   - Production: Use `frontend/.env.production`

---

If you're still facing issues, share:
1. Browser console errors
2. Network tab screenshot
3. Your ngrok URL
4. Backend console output

Good luck! 🚀
