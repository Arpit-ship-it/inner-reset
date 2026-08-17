# Inner Reset — Mental Fitness & AI Wellness Platform ✨

**Inner Reset** is a mental fitness, mindfulness, and automated daily affirmation platform powered by an **AI Chatbot Engine (Gemini)**, **WhatsApp Integration (`whatsapp-web.js`)**, **PhonePe Payment Gateway**, and a **Vite React Admin Dashboard**.

---

## 🚀 Features

- 🤖 **AI-Powered Mental Health & Relationship Coach**:
  - Provides deep, empathetic, and structured guidance for relationship advice, breakup healing, stress, anxiety, and mindfulness.
  - Automatically handles greetings, mood options (1. Stressed, 2. Sad, 3. Demotivated, 4. Bored, 5. Happy) backed by AI quotes, and open-ended user queries.
  - Supports Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash`) with a built-in Smart Offline AI Companion fallback.
- 💬 **WhatsApp Automation**:
  - Automatically registers users, sends WhatsApp OTP verification codes, sends daily morning/afternoon affirmation check-ins, and manages interactive WhatsApp sessions.
- 💳 **Payment Gateway Integration**:
  - PhonePe sandbox/production payment integration with automated UTR confirmation and user activation.
- 🖥️ **Admin & Tester Dashboards**:
  - React Admin Dashboard (`/frontend`) for user activation and system status.
  - Interactive API Tester (`test-api.html`) to verify connection and view all users in the database.

---

## 📁 Project Architecture

```
inner-reset-main/
├── config/
│   ├── db.js                     # Sequelize MySQL database configuration & cloud connection
│   ├── whatsapp.js               # WhatsApp web client initialization & QR handler
│   └── whatsapp.production.js    # Production WhatsApp configuration
├── data/
│   ├── affirmationBank.js        # Categorized affirmation bank (Health, Mind, etc.)
│   └── morningJourney.js         # 30-Day guided morning mindfulness journey steps
├── models/
│   ├── User.js                   # User account schema (name, whatsapp_number, status, payment)
│   ├── MessageLog.js             # User & bot message history logging
│   ├── Subscription.js           # Membership plans and status
│   ├── UserJourney.js            # User progress tracking in 30-day journey
│   └── UserMood.js               # Sentiment & mood tracking analytics
├── routes/
│   ├── auth.js                   # User registration, activation, and OTP routes
│   ├── payment.js                # PhonePe payment initiation & confirmation callback
│   └── chat.js                   # AI Chatbot HTTP API (POST /api/chat)
├── services/
│   └── aiEngine.js               # Gemini AI Engine processor & offline AI companion
├── utils/
│   ├── chatbot.js                # WhatsApp chatbot routing matrix & message listener
│   └── scheduler.js              # Node-Cron automated daily message dispatchers
├── frontend/                     # Vite + React Admin Dashboard
├── server.js                     # Main Express server entry point
├── server.production.js          # Production server setup
├── test-api.html                 # Interactive API tester & database user viewer
├── test-connection.js            # System diagnostics script
└── .env                          # System environment configuration
```

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18 or higher installed
- **MySQL Database**: Local or Cloud MySQL database active

### 2. Environment Configuration (`.env`)
Ensure your `.env` file contains your database credentials and API key:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=affirmation_db
AI_API_KEY=YOUR_GEMINI_API_KEY
PHONEPE_MERCHANT_ID=PGMDV77
PHONEPE_SALT_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_SALT_INDEX=1
BACKEND_URL=http://localhost:5000
```

### 3. Installation
Install backend dependencies:
```bash
npm install
```

Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

### 4. Running the Application

- **Backend Server & WhatsApp Bot**:
  ```bash
  npm start
  ```
  *(Server runs on `http://localhost:5000`)*

- **Frontend Admin Dashboard**:
  ```bash
  cd frontend
  npm run dev
  ```

- **API Tester & Database User Viewer**:
  Open `test-api.html` directly in your browser or serve via `http://localhost:5000/test-api.html`.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/send-otp` | Dispatches 6-digit verification OTP to user via WhatsApp |
| `POST` | `/api/auth/verify-otp` | Verifies WhatsApp OTP code |
| `POST` | `/api/auth/register-temporary` | Registers a new user account |
| `GET` | `/api/auth/users` | Fetches list of all users from database |
| `POST` | `/api/payment/confirm-payment/:id` | Confirms payment UTR and activates user account |
| `POST` | `/api/chat` | Direct HTTP interface to AI Chatbot (`{ message, name }`) |

---

## 🧪 Testing

To test backend services and connection:
```bash
node test-connection.js
```
To test frontend compilation:
```bash
cd frontend && npm run build
```

---
*Built with ❤️ for Inner Reset.*
