# 🏠 Affirmation App - Localhost Setup

## ✨ Everything Works on Localhost!

This application is **fully configured** to work on your local machine. No cloud, no ngrok, no external services needed!

---

## 🚀 QUICK START (2 Commands)

### Terminal 1 - Start Backend:
```bash
node server.js
```

### Terminal 2 - Start Frontend:
```bash
cd frontend
npm run dev
```

### Open Browser:
```
http://localhost:5173
```

**That's it! 🎉**

---

## 📋 Features Available

✅ **User Management**
- Register new users
- View all registered users
- Pause/Resume subscriptions
- Remove users
- Track subscription days

✅ **WhatsApp Integration**
- Send manual quotes
- Automated daily messages
- Real WhatsApp connection

✅ **Admin Dashboard**
- Beautiful gradient UI
- Responsive design
- Real-time updates
- Status badges

---

## 🧪 Quick Health Check

Run this to verify everything is configured:
```bash
node check-localhost.js
```

This will check:
- ✅ Frontend configuration
- ✅ Backend configuration
- ✅ API connectivity
- ✅ Database connection
- ✅ Server status

---

## 📊 User Table Features

| Feature | Button | Description |
|---------|--------|-------------|
| **Send Quote** | ✉️ (Blue) | Send motivational message via WhatsApp |
| **Pause** | ⏸ (Orange) | Pause user's subscription |
| **Resume** | ▶ (Green) | Resume paused subscription |
| **Remove** | 🗑️ (Red) | Permanently delete user |
| **Status Badge** | ✓/⏸ | Shows Active (green) or Paused (yellow) |
| **Days Left** | 📅 (Purple) | Remaining subscription days (30-day period) |

---

## 🔧 Configuration Files

All set for localhost:

| File | Setting |
|------|---------|
| `frontend/.env` | `VITE_API_URL=http://localhost:5000` |
| `.env` | `PORT=5000` |
| `server.js` | CORS allows localhost |
| `frontend/src/config/api.js` | Defaults to localhost |

**No changes needed! ✅**

---

## 🐛 Troubleshooting

### Users Not Showing?

**Step 1:** Check if backend is running
```bash
# Should show "Server is running on port 5000"
```

**Step 2:** Check if frontend is running
```bash
# Should show "Local: http://localhost:5173/"
```

**Step 3:** Check browser console (F12)
```
Should show: 🔗 API Base URL: http://localhost:5000
```

**Step 4:** Test API directly
Open in browser: http://localhost:5000/api/auth/users

### Error: "Unknown column 'status'"

The User model was updated. Restart backend to sync database:
```bash
# Press Ctrl+C to stop backend
node server.js
```

### Port Already in Use

**Backend (5000):**
```bash
# Find what's using it
lsof -i :5000

# Kill it
kill -9 <PID>
```

**Frontend (5173):**
Vite automatically tries next available port (5174, 5175, etc.)

---

## 📱 Access from Mobile (Same WiFi)

### Step 1: Find Your Computer's IP
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Example: `192.168.1.100`

### Step 2: Update Frontend Config
Edit `frontend/.env`:
```env
VITE_API_URL=http://192.168.1.100:5000
```

### Step 3: Restart Frontend
```bash
cd frontend
npm run dev
```

### Step 4: Open on Phone
```
http://192.168.1.100:5173
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **`LOCALHOST_SETUP.md`** | Complete localhost guide |
| `check-localhost.js` | Health check script |
| `FRONTEND_UPDATES_SUMMARY.md` | All frontend features |

**For Detailed Help:** Read `LOCALHOST_SETUP.md`

---

## ✅ Verification Checklist

- [ ] Backend running: `node server.js`
- [ ] Frontend running: `cd frontend && npm run dev`
- [ ] Browser opened: http://localhost:5173
- [ ] Console shows: `API Base URL: http://localhost:5000`
- [ ] Users table loads when clicked
- [ ] All buttons work (Send, Pause, Remove)

---

## 🎯 Expected Behavior

### Backend Console:
```
🚀 Server is running on port 5000
✨ All MySQL tables synced
🔄 Connecting to WhatsApp...
✅ WhatsApp client is ready!
```

### Frontend Console (F12):
```
🔗 API Base URL: http://localhost:5000
📡 Fetching users from: http://localhost:5000/api/auth/users
✅ Users fetched successfully: 3 users
```

### Browser:
- Registration form visible
- Payment modal works
- Users table shows all data
- All buttons functional
- No errors in console

---

## 💡 Pro Tips

### Keep Terminals Open
Don't close Terminal 1 (backend) or Terminal 2 (frontend) while using the app!

### Hot Reload
- Frontend: Auto-reloads when you edit code
- Backend: Restart manually after changes

### Database GUI
Use MySQL Workbench or similar to view/edit data directly

### Browser DevTools
Press F12 to see:
- Console logs
- Network requests
- Any errors

---

## 🆘 Need Help?

### Quick Diagnostic:
```bash
node check-localhost.js
```

### Full Guide:
Read `LOCALHOST_SETUP.md`

### Still Issues?
Check:
1. Backend terminal - any errors?
2. Frontend terminal - any errors?
3. Browser console (F12) - any red errors?
4. MySQL running?
5. Correct database credentials in `.env`?

---

## 🎉 Success!

When everything works, you'll see:
- ✅ Users in table
- ✅ Status badges (green/yellow)
- ✅ Days remaining counter
- ✅ 3 action buttons per user
- ✅ All features functional

**Enjoy your localhost admin dashboard! 🏠**

---

## 📞 Quick Commands

```bash
# Start backend
node server.js

# Start frontend
cd frontend && npm run dev

# Health check
node check-localhost.js

# Test API
curl http://localhost:5000/api/auth/users

# Check running services
lsof -i :5000    # Backend
lsof -i :5173    # Frontend
```

---

**🚀 Everything is ready! Just start the servers and go!**
