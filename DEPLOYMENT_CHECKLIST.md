# ✅ Deployment Checklist - Frontend + Backend via Ngrok

## Pre-Deployment Checks

### Backend
- [ ] Backend server starts without errors (`node server.js`)
- [ ] Database connection successful
- [ ] WhatsApp client initializes
- [ ] Port 5000 is available and listening
- [ ] CORS configuration updated (✅ already done)

### Frontend  
- [ ] Frontend builds without errors (`cd frontend && npm run build`)
- [ ] All hardcoded localhost URLs removed (✅ already done)
- [ ] API configuration uses environment variables (✅ already done)
- [ ] `frontend/.env` file exists (✅ created)

---

## Deployment Steps

### Step 1: Start Backend Server
```bash
node server.js
```

**Verify:**
- ✅ Console shows: "Server is running on port 5000"
- ✅ Console shows: "All MySQL tables synced"
- ✅ Console shows: WhatsApp connection status

### Step 2: Start Ngrok Tunnel
```bash
ngrok http 5000
```

**Verify:**
- ✅ Ngrok shows "Forwarding" URL
- ✅ Status is "online"
- ✅ Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### Step 3: Update Frontend Configuration

**Option A - Quick Script:**
```bash
node update-ngrok-url.js https://YOUR-NGROK-URL.ngrok-free.app
```

**Option B - Manual:**
Edit `frontend/.env`:
```env
VITE_API_URL=https://YOUR-NGROK-URL.ngrok-free.app
```

**Verify:**
- ✅ File saved
- ✅ URL is HTTPS
- ✅ URL matches ngrok output

### Step 4: Start Frontend Server
```bash
cd frontend
npm run dev
```

**Verify:**
- ✅ Dev server starts
- ✅ No compilation errors
- ✅ Console shows correct port (usually 5173)

### Step 5: Test Frontend

**Open in browser and check:**
- [ ] Page loads without errors
- [ ] Press F12, check console
- [ ] Console shows: `🔗 API Base URL: https://your-ngrok-url...`
- [ ] Click "View Registered Users"
- [ ] Console shows: `📡 Fetching users from: https://...`
- [ ] Console shows: `✅ Users fetched successfully: X users`
- [ ] Users appear in table

---

## Functionality Tests

### Test 1: User Registration
- [ ] Fill registration form
- [ ] Payment modal appears
- [ ] Submit payment
- [ ] Success message shows
- [ ] User appears in table (refresh if needed)

### Test 2: View Users
- [ ] Click "View Registered Users" button
- [ ] Table appears with all users
- [ ] All columns visible: Name, WhatsApp, Email, Status, Days Left, Actions

### Test 3: Send Quote
- [ ] Click "Send Quote" button for a user
- [ ] Success message shows
- [ ] Check WhatsApp for message

### Test 4: Pause/Resume Subscription
- [ ] Click "Pause" button (orange)
- [ ] Confirm action
- [ ] Status changes to "⏸ Paused" (yellow badge)
- [ ] Button changes to "▶ Resume" (green)
- [ ] Click "Resume"
- [ ] Status changes back to "✓ Active" (green badge)

### Test 5: Remove User
- [ ] Click "🗑️ Remove" button (red)
- [ ] Confirmation dialog appears with user name
- [ ] Confirm deletion
- [ ] User disappears from table
- [ ] Success message shows

### Test 6: Days Remaining
- [ ] Check "Days Left" column
- [ ] Shows number between 0-30
- [ ] Purple badge visible

---

## Troubleshooting Checklist

### Issue: Users Not Showing

**Check:**
- [ ] Backend running?
- [ ] Ngrok active?
- [ ] Frontend `.env` updated?
- [ ] Frontend restarted after `.env` change?
- [ ] Browser console for errors?
- [ ] Network tab showing API calls?

**Test:**
```bash
# Direct API test
curl https://YOUR-NGROK-URL.ngrok-free.app/api/auth/users
```

### Issue: CORS Error

**Check:**
- [ ] Backend `server.js` has updated CORS config (✅ already done)
- [ ] Ngrok URL matches frontend config
- [ ] Browser cache cleared (Ctrl+Shift+R)

### Issue: 404 Not Found

**Check:**
- [ ] Ngrok URL correct in `.env`
- [ ] No typos in URL
- [ ] Ngrok tunnel still active
- [ ] Backend running on port 5000

### Issue: Buttons Not Working

**Check:**
- [ ] Browser console for JavaScript errors
- [ ] Network tab showing API calls
- [ ] Backend console for request logs
- [ ] Database connection active

---

## Verification Commands

```bash
# 1. Check if backend is running
curl http://localhost:5000

# 2. Check if ngrok is working
curl https://YOUR-NGROK-URL.ngrok-free.app

# 3. Check users API
curl https://YOUR-NGROK-URL.ngrok-free.app/api/auth/users

# 4. Check frontend config
cat frontend/.env

# 5. Check ngrok dashboard
open http://localhost:4040
```

---

## Production Deployment Notes

### For Actual Production (Not Ngrok):

1. **Update Frontend Config:**
   ```env
   # frontend/.env.production
   VITE_API_URL=https://api.yourdomain.com
   ```

2. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy Backend:**
   - Use proper hosting (not ngrok)
   - Set environment variables
   - Configure SSL certificate
   - Use process manager (PM2)

4. **Deploy Frontend:**
   - Upload `dist` folder to hosting
   - Configure web server (Nginx/Apache)
   - Set up domain and SSL

---

## Maintenance Checklist

### Daily:
- [ ] Check backend logs for errors
- [ ] Monitor WhatsApp client status
- [ ] Verify ngrok tunnel active (if using ngrok)

### When Ngrok Restarts:
- [ ] Get new ngrok URL
- [ ] Update `frontend/.env`
- [ ] Restart frontend dev server
- [ ] Test user table loads

### When Backend Restarts:
- [ ] Verify database connection
- [ ] Check WhatsApp client reconnects
- [ ] Test API endpoints
- [ ] Verify frontend can fetch users

---

## Emergency Recovery

### If Everything Breaks:

1. **Stop All Services:**
   ```bash
   # Kill backend
   pkill -f "node server.js"
   
   # Kill frontend
   pkill -f "vite"
   
   # Kill ngrok
   pkill ngrok
   ```

2. **Fresh Start:**
   ```bash
   # Start backend
   node server.js
   
   # In new terminal: Start ngrok
   ngrok http 5000
   
   # Update frontend config
   node update-ngrok-url.js https://NEW-URL
   
   # Start frontend
   cd frontend && npm run dev
   ```

3. **Test:**
   - Open `test-api.html`
   - Test API connection
   - Test fetch users

---

## Success Criteria ✅

Your deployment is successful when:
- ✅ Backend running and accessible via ngrok
- ✅ Frontend loading without errors
- ✅ Users visible in table
- ✅ All CRUD operations working:
  - Create (register)
  - Read (view users)
  - Update (pause/resume)
  - Delete (remove)
- ✅ WhatsApp integration functional
- ✅ No console errors
- ✅ All buttons responsive
- ✅ Mobile layout working

---

## Documentation Reference

- **Quick Fix:** `QUICK_FIX_GUIDE.md`
- **Detailed Setup:** `NGROK_SETUP_GUIDE.md`
- **Technical Details:** `FRONTEND_NGROK_FIX_SUMMARY.md`
- **Feature Updates:** `FRONTEND_UPDATES_SUMMARY.md`

---

## Support Files Available

- ✅ `update-ngrok-url.js` - Quick URL updater
- ✅ `test-api.html` - API connection tester
- ✅ `start-with-ngrok.sh` - Helper script
- ✅ All documentation files

---

**🎉 You're all set! Follow this checklist and everything will work smoothly.**
