const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const UserMood = require('../models/UserMood'); // AI Smart Sentiment Tracker Model Import
const UserJourney = require('../models/UserJourney');
// ✅ Dynamic WhatsApp config import (Production vs Dev)
const waModule = process.env.NODE_ENV === 'production'
    ? require('../config/whatsapp.production')
    : require('../config/whatsapp');
const { sendWAMessage, whatsappClient } = waModule;
global.tempOtpStore = global.tempOtpStore || {}; let tempOtpStore = global.tempOtpStore;

const sanitizeNumber = (num) => {
    let clean = String(num || '').replace(/[^\d]/g, '');
    if (clean.length === 10) clean = `91${clean}`;
    return clean;
};

// 🔐 SEND OTP ENDPOINT
router.post('/send-otp', async (req, res) => {
    const { whatsapp_number } = req.body;
    if (!whatsapp_number) return res.status(400).json({ error: 'WhatsApp number is required' });

    const cleanPhone = sanitizeNumber(whatsapp_number);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    tempOtpStore[cleanPhone] = otp;
    tempOtpStore[whatsapp_number] = otp;
    console.log(`✅ [OTP Active] OTP [${otp}] generated and stored for ${cleanPhone} (raw: ${whatsapp_number})`);

    // Dispatch WhatsApp message in background without blocking HTTP response
    sendWAMessage(
        cleanPhone,
        `🔐 *Affirmation App Verification*\n\nYour security OTP code is: *${otp}*.\n\nPlease enter this code on the registration page to proceed with the payment.`
    ).then(res => {
        console.log(`✅ [Async WA Transmission Result] Delivery to ${cleanPhone}: ${res}`);
    }).catch(waErr => {
        console.error('⚠️ [WA Transmission Warning]:', waErr.message || waErr);
    });
    
    return res.json({ success: true, message: 'OTP sent successfully on WhatsApp!', otp: otp });
});

// 🔐 VERIFY OTP ENDPOINT
router.post('/verify-otp', (req, res) => {
    const { whatsapp_number, otp } = req.body;
    if (!whatsapp_number || !otp) return res.status(400).json({ error: 'WhatsApp number and OTP are required' });

    const cleanPhone = sanitizeNumber(whatsapp_number);
    const providedOtp = String(otp).trim();

    // Accept matching stored OTP, or '123456' test fallback
    if (providedOtp === '123456' || (global.tempOtpStore && global.tempOtpStore[cleanPhone] === providedOtp)) {
        if (global.tempOtpStore) {
            delete global.tempOtpStore[cleanPhone];
            delete global.tempOtpStore[whatsapp_number];
        }
        console.log(`✅ [OTP Verified] OTP [${providedOtp}] matched for ${cleanPhone}`);
        return res.json({ success: true, message: 'OTP verified successfully!' });
    }

    console.warn(`❌ [OTP Failed] Invalid OTP [${providedOtp}] attempt for ${cleanPhone} (raw: ${whatsapp_number})`);
    return res.status(400).json({ error: 'Invalid or expired OTP code. Please check your WhatsApp and try again.' });
});

// 📝 1. ORIGINAL PREMIUM USER REGISTRATION ENDPOINT
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, whatsapp_number, utr_number } = req.body;

        if (!name || !email || !password || !whatsapp_number) {
            return res.status(400).json({ message: 'Bhai, saari details bharna zaroori hai!' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Ye email toh pehle se registered hai!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Raw string cleaner
        let cleanNumber = whatsapp_number.replace(/[^\d]/g, ''); 
        
        // Smart 10-digit Indian number fallback
        if (cleanNumber.length === 10) {
            cleanNumber = `91${cleanNumber}`;
        }
        
        // WHATSAPP OFFICIAL ID RESOLVER
        let finalWhatsappNumber = cleanNumber;
        let formattedNumber = `${cleanNumber}@c.us`;

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            whatsapp_number: finalWhatsappNumber, 
            utr_number 
        });

        await Subscription.create({
            user_id: newUser.id,
            status: 'active' 
        });

        // Initialize UserJourney
        try {
            await UserJourney.create({
                whatsapp_number: finalWhatsappNumber,
                user_address_name: name,
                companion_name: 'Care Buddy'
            });
            console.log(`✨ [UserJourney Init] Initialized UserJourney for: ${finalWhatsappNumber}`);
        } catch (jErr) {
            console.error('⚠️ Failed to initialize UserJourney record:', jErr.message);
        }

        // AI ENGINE DATABASE INITIALIZATION
        try {
            await UserMood.findOrCreate({
                where: { whatsappId: formattedNumber },
                defaults: { lastMood: 'Neutral', interactionCount: 0 }
            });
            console.log(`✨ [AI Seed Sync] Mood ledger checked/initialized for user: ${formattedNumber}`);
        } catch (dbMoodErr) {
            console.error('⚠️ Failed to initialize AI mood tracking table entry:', dbMoodErr.message);
        }

        const welcomeMessage = `🌿 Welcome to Inner Reset\n` +
        `Daily reminders for a better you.\n\n` +
        `Dear ${name},\n\n` +
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

        try {
            console.log(`🚀 [WA Dispatch] Sending onboarding message to: ${formattedNumber}`);
            const sent = await sendWAMessage(formattedNumber, welcomeMessage);
            if (sent) {
                console.log(`✅ [WA Welcome Sent] Welcome message delivered successfully to ${name}`);
            } else {
                console.warn(`⚠️ [WA Welcome Skipped] Client not ready — message not sent to ${name}`);
            }
        } catch (wsError) {
            console.error('⚠️ [WA Welcome Error] WhatsApp notification transmission failed:', wsError.message);
        }

        res.status(201).json({
            success: true,
            message: 'User registered & premium subscription activated successfully! 🎉',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                whatsapp_number: newUser.whatsapp_number
            }
        });

    } catch (error) {
        console.error('Registration Major Error:', error);
        res.status(500).json({ message: 'Server me koi gadbad ho gayi!' });
    }
});

// 🎁 2. 🔥 NEW ENDPOINT: TEMPORARY FREE TRIAL BYPASS REGISTRATION ROUTE
router.post('/register-temporary', async (req, res) => {
    try {
        const { name, email, phone, companionName, userAddressName } = req.body;

        let cleanNumber = String(phone || '').replace(/[^\d]/g, ''); 
        if (cleanNumber.length === 10) {
            cleanNumber = `91${cleanNumber}`;
        }
        
        let finalWhatsappNumber = cleanNumber;
        let formattedNumber = `${cleanNumber}@c.us`;

        const Op = require('sequelize').Op;
        const existingUser = await User.findOne({ 
            where: { 
                [Op.or]: [
                    { email }, 
                    { whatsapp_number: finalWhatsappNumber }
                ] 
            } 
        });

        if (existingUser) {
            existingUser.name = name;
            existingUser.status = 'active';
            await existingUser.save();

            let journey = await UserJourney.findOne({ where: { whatsapp_number: finalWhatsappNumber } });
            if (journey) {
                journey.user_address_name = userAddressName || name;
                journey.companion_name = companionName || 'Care Buddy';
                await journey.save();
            } else {
                try {
                    await UserJourney.create({
                        whatsapp_number: finalWhatsappNumber,
                        user_address_name: userAddressName || name,
                        companion_name: companionName || 'Care Buddy'
                    });
                } catch (jErr) {}
            }

            const trialWelcomeMessage = `🌿 Welcome to Inner Reset\n` +
            `Daily reminders for a better you.\n\n` +
            `Dear ${userAddressName || name},\n\n` +
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

            try {
                await sendWAMessage(formattedNumber, trialWelcomeMessage);
            } catch (waErr) {}

            return res.status(200).json({
                success: true,
                message: 'Welcome back! Preferences updated and onboarding message sent.',
                user: existingUser
            });
        }

        // Create new user if not existing
        const dummySalt = await bcrypt.genSalt(10);
        const dummyPassword = await bcrypt.hash("TrialAccountBypass2026", dummySalt);

        const newTrialUser = await User.create({
            name,
            email,
            password: dummyPassword,
            whatsapp_number: finalWhatsappNumber,
            status: 'active',
            utr_number: null
        });

        // Initialize active subscription parameters tracking entry
        await Subscription.create({
            user_id: newTrialUser.id,
            status: 'active' 
        });

        // Initialize UserJourney
        try {
            await UserJourney.create({
                whatsapp_number: finalWhatsappNumber,
                user_address_name: userAddressName || name,
                companion_name: companionName || 'Care Buddy'
            });
            console.log(`✨ [UserJourney Init] Initialized UserJourney for Trial: ${finalWhatsappNumber}`);
        } catch (jErr) {
            console.error('⚠️ Failed to initialize UserJourney record for Trial:', jErr.message);
        }

        // Initialize user sentiment record block safely inside mood ledger table
        try {
            await UserMood.findOrCreate({
                where: { whatsappId: formattedNumber },
                defaults: { lastMood: 'Neutral', interactionCount: 0 }
            });
            console.log(`✨ [AI Seed Sync] Initialized Free Trial mood tracking: ${formattedNumber}`);
        } catch (dbMoodErr) {
            console.error('⚠️ Failed to initiate Free Trial mood tracing ledger logic:', dbMoodErr.message);
        }

        // Customized onboarding message tailored using custom onboarding form tokens
        const trialWelcomeMessage = `🌿 Welcome to Inner Reset\n` +
        `Daily reminders for a better you.\n\n` +
        `Dear ${userAddressName || name},\n\n` +
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

        // ✅ Dispatch welcome message on WhatsApp immediately
        try {
            console.log(`🚀 [WA Trial Dispatch] Sending welcome message to: ${formattedNumber}`);
            await sendWAMessage(formattedNumber, trialWelcomeMessage);
        } catch (waWelcomeErr) {
            console.error('⚠️ [WA Welcome Delivery Warning]:', waWelcomeErr.message);
        }

        console.log(`✅ [Register Complete] "${name}" saved and onboarding message dispatched. ID: ${newTrialUser.id}`);

        return res.status(201).json({
            success: true,
            message: 'Registration saved! Ab payment QR scan karo.',
            user: {
                id: newTrialUser.id,
                name: newTrialUser.name,
                email: newTrialUser.email,
                whatsapp_number: newTrialUser.whatsapp_number
            }
        });

    } catch (error) {
        console.error('❌ [Register-Temporary Error]:', error);
        return res.status(500).json({ success: false, message: 'Server error.', error: error.message, stack: error.stack });
    }
});

// 📋 3. GET SAARE USERS
router.get('/users', async (req, res) => {
    try {
        const users = await User.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Users laane me gadbad hui!' });
    }
});

// ✉️ 4. MANUAL WHATSAPP MESSAGE BHEJNE KE LIYE (Short Test Message)
router.post('/send-manual-message', async (req, res) => {
    try {
        const { whatsapp_number, message } = req.body;
        if (!whatsapp_number) return res.status(400).json({ success: false, message: 'Number missing hai!' });

        let cleanNumber = String(whatsapp_number).replace(/[^\d]/g, '');
        if (cleanNumber.length === 10) cleanNumber = `91${cleanNumber}`;
        const targetDestination = `${cleanNumber}@c.us`;

        const shortText = message || "🌿 Inner Reset Test: WhatsApp integration active! ✅";

        console.log(`🚀 [WA Manual Dispatch] Transmitting short message to: ${targetDestination}`);
        const sent = await sendWAMessage(targetDestination, shortText);

        if (sent) {
            console.log(`✅ [WA Manual Sent] Delivered to ${targetDestination}`);
            return res.status(200).json({ success: true, message: `Short message delivered to ${cleanNumber}! ✅` });
        } else {
            console.warn(`❌ [WA Manual Failed] Delivery failed to ${targetDestination}`);
            return res.status(500).json({ success: false, message: `Delivery failed to ${cleanNumber}. Check server logs.` });
        }
    } catch (error) {
        console.error('❌ [Manual Message Endpoint Error]:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

// 🛑 5. Pause / Resume Subscription
router.put('/users/:id/toggle-status', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.status = user.status === 'active' ? 'inactive' : 'active';
        await user.save();
        
        res.json({ success: true, message: `Subscription is now ${user.status}` });
    } catch (error) {
        console.error("Status Update Error:", error);
        res.status(500).json({ message: "Failed to update status" });
    }
});

// ❌ 6. Remove User Completely
router.delete('/users/:id', async (req, res) => {
    try {
        await User.destroy({ where: { id: req.params.id } });
        res.json({ success: true, message: 'User removed permanently!' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// 🔍 7. CHECK USER STATUS — Frontend QR polling ke liye
// Frontend setInterval se yeh endpoint hit karega
// Jaise hi status 'registered' ho, redirect trigger hoga
router.get('/check-status/:userId', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId, {
            attributes: ['id', 'name', 'email', 'whatsapp_number', 'status', 'isPremium', 'createdAt']
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        console.log(`🔍 [Status Check] UserID: ${user.id} | Status: ${user.status} | isPremium: ${user.isPremium}`);

        res.json({
            success: true,
            userId: user.id,
            name: user.name,
            status: user.status,          // 'active' | 'inactive'
            isPremium: user.isPremium,    // true | false
            whatsapp_number: user.whatsapp_number
        });

    } catch (error) {
        console.error('❌ [Check Status Error]:', error.message);
        res.status(500).json({ success: false, message: 'Status check failed' });
    }
});

module.exports = router;