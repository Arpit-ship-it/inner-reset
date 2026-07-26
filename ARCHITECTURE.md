# 🏗️ Application Architecture

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         Frontend (HTML + JavaScript)                   │ │
│  │         http://localhost:5000                          │ │
│  │                                                         │ │
│  │  • Landing Page (index.html)                          │ │
│  │  • Registration Form                                   │ │
│  │  • Interactive Simulator                              │ │
│  │  • Payment Success/Failure Pages                      │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↕
                  HTTP Requests (fetch API)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              BACKEND SERVER (Node.js + Express)             │
│                   Port: 5000                                │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  API Endpoints                                      │   │
│  │                                                     │   │
│  │  POST /api/auth/send-otp                          │   │
│  │  POST /api/auth/verify-otp                        │   │
│  │  POST /api/payment/initiate-payment               │   │
│  │  POST /api/payment/payment-callback/:txnId        │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Static File Serving                               │   │
│  │  app.use(express.static('frontend'))               │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ↕                    ↕                    ↕
   ┌──────────┐      ┌──────────────┐      ┌──────────┐
   │ WhatsApp │      │   PhonePe    │      │  MySQL   │
   │   Web    │      │   Gateway    │      │ Database │
   │  Client  │      │  (Sandbox)   │      │          │
   └──────────┘      └──────────────┘      └──────────┘
```

---

## 🔄 Data Flow - User Registration

### 1️⃣ OTP Request Flow
```
User enters phone number
         ↓
[Frontend] Click "Verify & Start"
         ↓
fetch POST /api/auth/send-otp
         ↓
[Backend] Generate 6-digit OTP
         ↓
[Backend] Store OTP in memory (tempOtpStore)
         ↓
[WhatsApp] Send OTP message to user
         ↓
[Frontend] Show registration modal
```

### 2️⃣ OTP Verification Flow
```
User receives OTP on WhatsApp
         ↓
User fills registration form + OTP
         ↓
[Frontend] Click "Verify OTP & Proceed"
         ↓
fetch POST /api/auth/verify-otp
         ↓
[Backend] Check OTP against tempOtpStore
         ↓
[Backend] Return success/failure
         ↓
If success → Proceed to payment
If failure → Show error message
```

### 3️⃣ Payment Flow
```
OTP verified successfully
         ↓
[Frontend] fetch POST /api/payment/initiate-payment
         ↓
[Backend] Create payment payload
         ↓
[Backend] Generate SHA256 checksum
         ↓
[PhonePe] Send payment request
         ↓
[PhonePe] Return payment gateway URL
         ↓
[Frontend] Redirect user to PhonePe
         ↓
User completes payment on PhonePe
         ↓
[PhonePe] POST callback to /api/payment/payment-callback/:txnId
         ↓
[Backend] Verify transaction status
         ↓
If success → Redirect to /payment-success.html
If failure → Redirect to /payment-failed.html
```

---

## 📂 File Structure

```
affirmation-app/
│
├── server.js                          # Main server file
├── package.json                       # Dependencies & scripts
├── .env                               # Environment variables
│
├── frontend/                          # Frontend files (served statically)
│   ├── index.html                     # Main landing page ✅
│   ├── payment-success.html           # Success page ✅
│   └── payment-failed.html            # Failure page ✅
│
├── routes/
│   ├── auth.js                        # OTP endpoints
│   └── payment.js                     # Payment endpoints
│
├── models/                            # Database models
│   └── ...
│
├── services/                          # Business logic
│   └── ...
│
├── utils/                             # Utility functions
│   ├── chatbot.js                     # AI chatbot logic
│   └── scheduler.js                   # Automated messages
│
├── config/
│   ├── db.js                          # Database connection
│   └── whatsapp.js                    # WhatsApp client
│
└── test-connection.js                 # Integration test script ✅
```

---

## 🔐 Security Flow

### OTP Security
```
1. Generate random 6-digit OTP
2. Store in memory (tempOtpStore) with phone number as key
3. Send via WhatsApp (secure channel)
4. User enters OTP in form
5. Backend validates OTP
6. Delete OTP from memory after verification
```

### Payment Security
```
1. Create payment payload
2. Convert to Base64
3. Generate SHA256 checksum with salt key
4. Add X-VERIFY header
5. PhonePe validates request
6. Callback verification with SHA256
7. Only proceed if verification passes
```

---

## 🌐 API Endpoints Details

### 1. Send OTP
```http
POST /api/auth/send-otp
Content-Type: application/json

Request:
{
  "whatsapp_number": "9999999999"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully on WhatsApp!"
}
```

### 2. Verify OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

Request:
{
  "whatsapp_number": "9999999999",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "OTP Verified successfully!"
}
```

### 3. Initiate Payment
```http
POST /api/payment/initiate-payment
Content-Type: application/json

Request:
{
  "amount": 299,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9999999999",
  "companionName": "Care Buddy",
  "userAddressName": "Sunshine"
}

Response:
{
  "success": true,
  "url": "https://phonepe-gateway-url",
  "transactionId": "TXN-1234567890-123"
}
```

### 4. Payment Callback
```http
POST /api/payment/payment-callback/:txnId
(Called by PhonePe, not frontend)

Backend verifies transaction and redirects:
- Success → /payment-success.html
- Failure → /payment-failed.html
```

---

## 🎯 Frontend-Backend Communication

### Technology Stack
- **Frontend**: HTML5, Vanilla JavaScript, TailwindCSS
- **Backend**: Node.js, Express.js
- **Communication**: Fetch API (REST)
- **Data Format**: JSON

### CORS Configuration
```javascript
// Backend allows:
- localhost:5000
- ngrok domains
- localtunnel
- All origins in development
```

### Static File Serving
```javascript
// server.js
app.use(express.static('frontend'));

// This serves:
- /index.html → frontend/index.html
- /payment-success.html → frontend/payment-success.html
- /payment-failed.html → frontend/payment-failed.html
```

---

## 🔄 State Management

### Frontend State
- Modal open/close state
- Phone number input values
- OTP input value
- Form field values
- Button loading states
- Timeline tab selection (morning/afternoon/evening)

### Backend State
- `tempOtpStore` - In-memory OTP storage
  ```javascript
  {
    "9999999999": "123456",
    "8888888888": "654321"
  }
  ```
- Database - User registrations (TODO)
- WhatsApp client session

---

## 🚀 Deployment Architecture

### Current (Development)
```
Single Server (localhost:5000)
├── Backend API
├── Frontend Static Files
├── WhatsApp Client
└── MySQL Database (local)
```

### Production (Recommended)
```
Backend Server (Railway/Render)
├── API Endpoints
├── Frontend Static Files (served together)
├── WhatsApp Client
└── MySQL Database (Remote)

OR

Backend Server (Railway/Render)     Frontend Server (Netlify/Vercel)
├── API Endpoints                   ├── Static HTML/JS
├── WhatsApp Client        ←────────┤   Fetch API calls
└── MySQL Database (Remote)         └── Environment config
```

---

## ✅ Integration Checklist

- [x] Backend server running on port 5000
- [x] Frontend HTML configured with correct backend URL
- [x] Static file serving enabled in server.js
- [x] CORS properly configured
- [x] All API endpoints working
- [x] WhatsApp OTP sending functional
- [x] OTP verification working
- [x] Payment gateway integration complete
- [x] Success/failure pages created
- [x] Redirect URLs updated
- [x] Testing script created
- [x] Documentation complete

---

**Status**: ✅ Fully Integrated & Operational
**Access**: http://localhost:5000
