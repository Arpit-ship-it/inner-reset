const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
// ✅ Updated import: whatsapp.js ab named exports use karta hai
const { whatsappClient, sendWAMessage } = require('./config/whatsapp');
const initializeChatbot = require('./utils/chatbot');
// Background scheduler automation ko shuru karne ke liye
require('./utils/scheduler');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment'); // 💳 PhonePe Payment Route Import

const app = express();

// ✅ CORS: origin '*' — frontend/backend seamless communicate karenge
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// 🌐 Serve Static Frontend Files
app.use(express.static('frontend'));

// ========================================================
// 🔐 WHATSAPP OTP ROUTES (PAYMENT SE PEHLE VERIFICATION)
// ========================================================
let tempOtpStore = {}; // OTPs ko temporary memory me rakhne ke liye

// 1️⃣ Route: User ke number par WhatsApp se OTP bhejna
app.post('/api/auth/send-otp', async (req, res) => {
    const { whatsapp_number } = req.body;
    if (!whatsapp_number) return res.status(400).json({ error: 'WhatsApp number is required' });

    // 6-digit ka secure random OTP generate karo
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // ✅ sendWAMessage internally number format handle karta hai — manual formatting ki zaroorat nahi

    try {
        // ✅ Safe wrapper use kar raha hai — client ready hone par hi bhejega
        const sent = await sendWAMessage(
            whatsapp_number,
            `🔐 *Affirmation App Verification*\n\nYour security OTP code is: *${otp}*.\n\nPlease enter this code on the registration page to proceed with the payment.`
        );

        if (!sent) {
            return res.status(503).json({ error: 'WhatsApp client abhi ready nahi hai. Thodi der baad try karo.' });
        }
        
        // OTP ko memory me phone number ke sath save karlo
        tempOtpStore[whatsapp_number] = otp;
        
        console.log(`✅ [OTP Sent] OTP [${otp}] successfully dispatched to ${whatsapp_number}`);
        res.json({ success: true, message: 'OTP sent successfully on WhatsApp!' });
    } catch (error) {
        console.error('❌ [OTP Error] WhatsApp OTP send failed:', error.message);
        res.status(500).json({ error: 'Failed to send OTP. Ensure your WhatsApp bot is linked and active.' });
    }
});

// 2️⃣ Route: User ke dale hue OTP ko cross-check karna
app.post('/api/auth/verify-otp', (req, res) => {
    const { whatsapp_number, otp } = req.body;

    if (tempOtpStore[whatsapp_number] && tempOtpStore[whatsapp_number] === otp) {
        delete tempOtpStore[whatsapp_number];
        console.log(`✅ [OTP Verified] Number: ${whatsapp_number} — OTP check passed successfully.`);
        res.json({ success: true, message: 'OTP Verified successfully!' });
    } else {
        console.warn(`⚠️ [OTP Failed] Invalid OTP attempt for: ${whatsapp_number}`);
        res.status(400).json({ error: 'Oops! Invalid OTP code. Please check your WhatsApp and try again.' });
    }
});
// ========================================================

// 🔥 CRITICAL BUG FIX: Defensive validation to prevent "argument handler must be a function" crash
if (authRoutes && (typeof authRoutes === 'function' || typeof authRoutes.use === 'function')) {
    app.use('/api/auth', authRoutes);
} else {
    console.error('\n⚠️  [Express Routing Error]: authRoutes is resolving to UNDEFINED or an Empty Object!');
    console.error('👉 Fix: Please open your "routes/auth.js" file and ensure that the very LAST line contains: module.exports = router;\n');
}

// 💳 PHONEPE PAYMENT ROUTE MIDDLEWARE MOUNTING
app.use('/api/payment', paymentRoutes);

const startServer = async () => {
    await connectDB();
    try {
        await sequelize.sync();
        console.log('✨ [DB Synced] All MySQL tables synced cleanly with cloud schema!');
        
        // 🚀 WhatsApp Client initialize karo
        console.log('🔄 [WhatsApp] Connecting to WhatsApp — please wait for QR or "Ready" message...');
        whatsappClient.initialize();
        
        // 🤖 AI Chatbot Engine chatbot ke baad trigger karo
        initializeChatbot(whatsappClient);
        console.log('🤖 [Chatbot Active] AI Self-Help Chatbot Module activated and listening for messages...');
        
    } catch (error) {
        console.error('❌ [Server Start Error]:', error);
    }
};

startServer();

app.get('/', (req, res) => {
    res.send('Bhai, WhatsApp module, OTP verification, PhonePe API aur AI Chatbot active hai!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});