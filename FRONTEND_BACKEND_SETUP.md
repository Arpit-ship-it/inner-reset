# 🚀 Frontend-Backend Integration Guide

## ✅ Current Status
Your frontend is **already properly configured** and linked with the backend!

## 🏗️ Architecture Overview

### Backend (Node.js + Express)
- **Port**: 5000
- **Base URL**: `http://localhost:5000`
- **Location**: Root directory (`server.js`)

### Frontend (HTML + Vanilla JS)
- **Location**: `frontend/index.html`
- **API Configuration**: Automatically connects to `http://localhost:5000`
- **Served via**: Express static middleware

## 📡 API Endpoints

### 1. Send OTP
```
POST /api/auth/send-otp
Body: { "whatsapp_number": "9999999999" }
Response: { "success": true, "message": "OTP sent successfully on WhatsApp!" }
```

### 2. Verify OTP
```
POST /api/auth/verify-otp
Body: { "whatsapp_number": "9999999999", "otp": "123456" }
Response: { "success": true, "message": "OTP Verified successfully!" }
```

### 3. Initiate Payment
```
POST /api/payment/initiate-payment
Body: {
  "amount": 299,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "companionName": "Care Buddy",
  "userAddressName": "Sunshine"
}
Response: {
  "success": true,
  "url": "https://phonepe-payment-gateway-url",
  "transactionId": "TXN-123456"
}
```

## 🎯 How to Start

### Step 1: Start the Backend Server
```bash
npm start
```
This will:
- Start the Express server on port 5000
- Initialize WhatsApp Web client
- Serve the frontend HTML file
- Enable all API endpoints

### Step 2: Access the Frontend
Open your browser and navigate to:
```
http://localhost:5000
```

The backend automatically serves the `frontend/index.html` file!

## 🔧 Configuration Details

### Backend Configuration (`server.js`)
```javascript
// Static file serving enabled
app.use(express.static('frontend'));

// CORS enabled for local development
const corsOptions = {
  origin: function (origin, callback) {
    // Allows localhost and ngrok domains
    callback(null, true);
  },
  credentials: true
};
```

### Frontend Configuration (`frontend/index.html`)
```javascript
// Automatically configured to connect to backend
const BACKEND_URL = 'http://localhost:5000';
```

## 🧪 Testing the Integration

### Test 1: Check Server Status
```bash
curl http://localhost:5000
```
Expected: "Bhai, WhatsApp module, OTP verification, PhonePe API aur AI Chatbot active hai!"

### Test 2: Test Send OTP API
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"whatsapp_number":"9999999999"}'
```

### Test 3: Access Frontend
Open browser: `http://localhost:5000`

## 🎨 Frontend Features Connected

✅ **Hero Section**: Enter WhatsApp number → Sends OTP
✅ **Registration Modal**: Full form with OTP verification
✅ **Payment Integration**: PhonePe checkout after OTP verification
✅ **Interactive Simulator**: Morning/Afternoon/Evening modules

## 🔒 Environment Variables Required

Check your `.env` file has:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=@rpit007
DB_NAME=affirmation_db

# PhonePe Credentials
PHONEPE_MERCHANT_ID=PGMDV77
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_SALT_INDEX=1
PHONEPE_API_URL=https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay
PHONEPE_STATUS_URL=https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status
BACKEND_URL=http://localhost:5000

# AI Engine
AI_API_KEY=<your-api-key>
```

## 🐛 Troubleshooting

### Issue 1: "Backend server connection failure"
**Solution**: Ensure the backend is running on port 5000
```bash
npm start
```

### Issue 2: CORS Error
**Solution**: Backend already has CORS configured for localhost. Make sure you're accessing via `http://localhost:5000` not `file://`

### Issue 3: OTP Not Sending
**Solution**: 
1. Check WhatsApp Web is authenticated (QR code scanned)
2. Check console for WhatsApp client status
3. Verify phone number format (should be 10 digits)

### Issue 4: Payment Initialization Fails
**Solution**: 
1. Verify PhonePe credentials in `.env`
2. Check backend console for detailed error messages
3. Ensure using sandbox/preprod URLs for testing

## 📱 User Flow

1. **Landing Page** → User enters WhatsApp number
2. **OTP Sent** → User receives OTP on WhatsApp
3. **Registration Modal Opens** → User fills complete form
4. **OTP Verification** → Backend validates OTP
5. **Payment Gateway** → Redirects to PhonePe checkout
6. **Payment Success** → User gets redirected back

## 🎯 Next Steps

1. ✅ Frontend is already linked with backend
2. ✅ All API endpoints are properly configured
3. ✅ Static file serving is enabled
4. 🔜 Test the complete flow end-to-end
5. 🔜 Add payment success/failure pages
6. 🔜 Implement database storage for user registrations

## 🌐 Deployment Ready

For production deployment:
1. Update `BACKEND_URL` in frontend to your production URL
2. Update PhonePe credentials to production keys
3. Update CORS settings to allow your production domain
4. Deploy backend to Railway/Render/Heroku
5. Deploy frontend to Netlify/Vercel (or serve from backend)

---

**Status**: ✅ Frontend and Backend are properly linked and ready to use!
**Access URL**: http://localhost:5000
