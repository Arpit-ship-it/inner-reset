# 🚀 Quick Start Guide - Frontend + Backend

## ✅ Everything is Ready!

Your frontend is **already connected** to the backend. Follow these simple steps:

## 📋 Prerequisites

1. ✅ Node.js installed
2. ✅ MySQL running (XAMPP or local MySQL)
3. ✅ WhatsApp account for bot authentication

## 🎯 Start in 3 Steps

### Step 1: Start the Server
```bash
npm start
```

This will:
- Start backend on `http://localhost:5000`
- Initialize WhatsApp Web (scan QR code if first time)
- Serve your frontend automatically
- Enable all API endpoints

### Step 2: Open Your Browser
Navigate to:
```
http://localhost:5000
```

### Step 3: Test the Integration (Optional)
Open a new terminal and run:
```bash
npm run test-connection
```

This will verify:
- ✅ Server is running
- ✅ API endpoints are accessible
- ✅ Frontend is being served correctly

## 🎨 What You'll See

1. **Beautiful landing page** with the affirmation interface
2. **Hero section** where users can enter WhatsApp number
3. **Interactive simulator** with Morning/Afternoon/Evening modules
4. **Registration modal** with full payment flow

## 🔄 Complete User Flow

```
User enters number 
    ↓
Clicks "Verify & Start"
    ↓
Receives OTP on WhatsApp
    ↓
Registration modal opens
    ↓
User fills form + enters OTP
    ↓
Clicks "Verify OTP & Proceed to PhonePe Checkout"
    ↓
Backend verifies OTP
    ↓
Redirects to PhonePe payment gateway
    ↓
Payment Success → /payment-success.html
    OR
Payment Failed → /payment-failed.html
```

## 🌐 URLs Available

| Page | URL |
|------|-----|
| Landing Page | http://localhost:5000 |
| Payment Success | http://localhost:5000/payment-success.html |
| Payment Failed | http://localhost:5000/payment-failed.html |

## 🧪 Testing Tips

### Test OTP Flow
1. Enter a valid WhatsApp number (e.g., 9999999999)
2. Check your WhatsApp for OTP message
3. Enter OTP in the registration form

### Test Payment Flow
1. Complete OTP verification
2. Fill all form fields
3. Click "Verify OTP & Proceed to PhonePe"
4. You'll be redirected to PhonePe sandbox (test mode)

## 🔧 Configuration Files

All configurations are already set up:

- **Backend**: `server.js` (port 5000)
- **Environment**: `.env` (database + PhonePe credentials)
- **Frontend**: `frontend/index.html` (BACKEND_URL configured)

## 📁 Project Structure

```
.
├── server.js                          # Main backend server
├── frontend/
│   ├── index.html                     # Main landing page (working!)
│   ├── payment-success.html           # Success page
│   └── payment-failed.html            # Failure page
├── routes/
│   ├── auth.js                        # OTP endpoints
│   └── payment.js                     # Payment endpoints
├── .env                               # Configuration
└── package.json
```

## 🎉 Features Working

✅ **WhatsApp OTP**: Send and verify OTP via WhatsApp
✅ **User Registration**: Complete form with custom names
✅ **Payment Integration**: PhonePe gateway (sandbox mode)
✅ **Interactive Simulator**: Morning/Afternoon/Evening chat demos
✅ **Responsive Design**: Works on mobile and desktop
✅ **Static Serving**: Frontend served by backend automatically

## 🐛 Common Issues

### "Cannot connect to backend"
- Make sure `npm start` is running
- Check if port 5000 is available
- Verify `.env` file exists

### "OTP not received"
- Ensure WhatsApp Web is authenticated (QR scanned)
- Check backend console for errors
- Verify phone number format (10 digits)

### "Payment fails immediately"
- This is normal in sandbox mode
- Use PhonePe test credentials
- Check console for detailed errors

## 📞 Need Help?

1. Check backend console for errors
2. Run `npm run test-connection` to diagnose
3. Read `FRONTEND_BACKEND_SETUP.md` for detailed info

## 🚀 Deployment

When ready to deploy:
1. Update `BACKEND_URL` in `frontend/index.html` to your production URL
2. Update PhonePe credentials to production keys
3. Update CORS settings in `server.js`
4. Deploy backend to Railway/Render
5. Frontend is automatically served by backend!

---

**Current Status**: ✅ Everything is connected and working!
**Start Command**: `npm start`
**Access URL**: http://localhost:5000
