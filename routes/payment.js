const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const User = require('../models/User'); 
const UserJourney = require('../models/UserJourney');
const { whatsappClient, sendWAMessage } = require('../config/whatsapp');
require('dotenv').config();

// ─────────────────────────────────────────────────────────
// 🚀 1. INITIATE PAYMENT REQUEST
// ─────────────────────────────────────────────────────────
router.post('/initiate-payment', async (req, res) => {
    try {
        const { amount, userId, name } = req.body;
        const merchantTransactionId = `TEST-${Date.now()}`; 
        
        console.log(`💳 [Presentation Mode] Initiated TxnID: ${merchantTransactionId}`);
        res.status(200).json({
            success: true,
            url: `/api/payment/payment-callback/${merchantTransactionId}`, 
            transactionId: merchantTransactionId
        });
    } catch (error) {
        res.status(500).json({ message: 'Payment init failed!' });
    }
});

// ─────────────────────────────────────────────────────────
// 🔄 2. PAYMENT CALLBACK (Bypass Added for Demo)
// ─────────────────────────────────────────────────────────
router.post('/payment-callback/:txnId', async (req, res) => {
    try {
        const { txnId } = req.params;
        const isTest = txnId.startsWith('TEST-');
        
        let paymentVerified = false;

        if (isTest) {
            console.log(`✅ [Demo Mode] Bypassing PhonePe verification for: ${txnId}`);
            paymentVerified = true;
        } else {
            const merchantId = process.env.PHONEPE_MERCHANT_ID;
            const saltKey = process.env.PHONEPE_SALT_KEY;
            const saltIndex = process.env.PHONEPE_SALT_INDEX;
            const stringToHash = `/pg/v1/status/${merchantId}/${txnId}${saltKey}`;
            const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
            const xVerifyHeader = `${sha256Hash}###${saltIndex}`;

            const verifyResponse = await axios.get(`${process.env.PHONEPE_STATUS_URL}/${merchantId}/${txnId}`, { headers: { 'X-VERIFY': xVerifyHeader } });
            if (verifyResponse.data.success && verifyResponse.data.code === 'PAYMENT_SUCCESS') {
                paymentVerified = true;
            }
        }

        if (paymentVerified) {
            const userId = req.body.userId || '1';
            const targetUser = await User.findByPk(userId);

            if (targetUser) {
                await targetUser.update({ isPremium: true, status: 'active' });
                console.log(`👑 [Premium Activated] User: ${targetUser.name}`);

                // Initialize UserJourney
                try {
                    await UserJourney.findOrCreate({
                        where: { whatsapp_number: targetUser.whatsapp_number },
                        defaults: {
                            user_address_name: targetUser.name,
                            companion_name: 'Care Buddy'
                        }
                    });
                    console.log(`✨ [UserJourney Sync] UserJourney set for premium user: ${targetUser.whatsapp_number}`);
                } catch (jErr) {
                    console.error('⚠️ Failed to sync UserJourney during callback:', jErr.message);
                }

                const premiumMessage = `🌿 Welcome to Inner Reset\n` +
                    `Daily reminders for a better you.\n\n` +
                    `Dear ${targetUser.name},\n\n` +
                    `Welcome to Inner Reset. 💚\n\n` +
                    `Thank you for being here.\n\n` +
                    `From today, you'll receive gentle reminders throughout the day to help you pause, reflect, and reconnect with yourself.\n\n` +
                    `Here's what you can look forward to:\n\n` +
                    `🌅 Morning Check-in – Choose how you'd like your day to feel.\n\n` +
                    `✨ Morning Affirmation – A positive affirmation inspired by your choice.\n\n` +
                    `🌞 Afternoon Reminder – A little encouragement to keep you going.\n\n` +
                    `💛 Mindful Pause – A simple thought to help you slow down and reset.\n\n` +
                    `🌙 Evening Reflection – A calming message to end your day with peace and gratitude.\n\n` +
                    `There's nothing you need to do perfectly.\n\n` +
                    `Simply read the messages, pause for a moment, and allow them to become part of your day.\n\n` +
                    `Small reminders, repeated consistently, have the power to create lasting change.\n\n` +
                    `We're happy to be part of your journey.\n\n` +
                    `With warmth,\n\n` +
                    `Team Inner Reset\n` +
                    `Daily reminders for a better you.`;
                await sendWAMessage(targetUser.whatsapp_number, premiumMessage);
            }
            return res.redirect('/payment-success.html');
        }
        return res.redirect('/payment-failed.html');
    } catch (error) {
        console.error('🚨 Callback Error:', error.message);
        res.redirect('/payment-failed.html');
    }
});

// ─────────────────────────────────────────────────────────
// 🛠 3. ADMIN DASHBOARD: CONFIRM PAYMENT
// ─────────────────────────────────────────────────────────
router.post('/confirm-payment/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { utr_number, companionName, userAddressName } = req.body;

        console.log(`🔍 [DEBUG] Admin confirming payment for UserID: ${userId}`);
        const user = await User.findByPk(userId);
        
        if (!user) return res.status(404).json({ success: false, message: "User nahi mila!" });

        // Update Status
        user.status = 'active';
        user.utr_number = utr_number;
        await user.save();
        console.log(`✅ [DB] Status Active update ho gaya for: ${user.name}`);

        // Initialize / Update UserJourney
        try {
            const [journey, created] = await UserJourney.findOrCreate({
                where: { whatsapp_number: user.whatsapp_number },
                defaults: {
                    user_address_name: userAddressName || user.name,
                    companion_name: companionName || 'Care Buddy'
                }
            });
            if (!created) {
                if (userAddressName) journey.user_address_name = userAddressName;
                if (companionName) journey.companion_name = companionName;
                await journey.save();
            }
            console.log(`✨ [UserJourney Confirmed] Sync complete for: ${user.whatsapp_number}`);
        } catch (jErr) {
            console.error('⚠️ Failed to sync UserJourney during admin confirmation:', jErr.message);
        }

        // Automated WhatsApp Message
        try {
            let targetNumber = user.whatsapp_number;
            console.log(`🚀 [WA] Sending welcome message to: ${targetNumber}`);

            const welcomeMsg = `🌿 Welcome to Inner Reset\n` +
                `Daily reminders for a better you.\n\n` +
                `Dear ${userAddressName || user.name},\n\n` +
                `Welcome to Inner Reset. 💚\n\n` +
                `Thank you for being here.\n\n` +
                `From today, you'll receive gentle reminders throughout the day to help you pause, reflect, and reconnect with yourself.\n\n` +
                `Here's what you can look forward to:\n\n` +
                `🌅 Morning Check-in – Choose how you'd like your day to feel.\n\n` +
                `✨ Morning Affirmation – A positive affirmation inspired by your choice.\n\n` +
                `🌞 Afternoon Reminder – A little encouragement to keep you going.\n\n` +
                `💛 Mindful Pause – A simple thought to help you slow down and reset.\n\n` +
                `🌙 Evening Reflection – A calming message to end your day with peace and gratitude.\n\n` +
                `There's nothing you need to do perfectly.\n\n` +
                `Simply read the messages, pause for a moment, and allow them to become part of your day.\n\n` +
                `Small reminders, repeated consistently, have the power to create lasting change.\n\n` +
                `We're happy to be part of your journey.\n\n` +
                `With warmth,\n\n` +
                `Team Inner Reset\n` +
                `Daily reminders for a better you.`;

            const sent = await sendWAMessage(targetNumber, welcomeMsg);
            if (sent) {
                console.log("✅ [WA] Welcome message sent successfully!");
            } else {
                console.warn("⚠️ [WA] Client not ready — message queued for later.");
            }
        } catch (msgErr) {
            console.error("❌ [WA] Critical error:", msgErr);
        }

        res.status(200).json({ success: true, message: "Activated & Triggered!" });
    } catch (error) {
        console.error("🚨 [Payment Route Error]:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ─────────────────────────────────────────────────────────
// 🔔 4. STATUS CHECK (Polling)
// ─────────────────────────────────────────────────────────
router.get('/status/:txnId', async (req, res) => {
    try {
        const { txnId } = req.params;
        const merchantId = process.env.PHONEPE_MERCHANT_ID;
        const saltKey = process.env.PHONEPE_SALT_KEY;
        const saltIndex = process.env.PHONEPE_SALT_INDEX;
        const stringToHash = `/pg/v1/status/${merchantId}/${txnId}${saltKey}`;
        const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const xVerifyHeader = `${sha256Hash}###${saltIndex}`;

        const verifyResponse = await axios.get(`${process.env.PHONEPE_STATUS_URL}/${merchantId}/${txnId}`, { headers: { 'X-VERIFY': xVerifyHeader } });
        res.json({ success: verifyResponse.data.success, code: verifyResponse.data.code });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Status check failed.' });
    }
});

module.exports = router;