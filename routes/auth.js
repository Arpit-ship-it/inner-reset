const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const UserMood = require('../models/UserMood'); // AI Smart Sentiment Tracker Model Import
const UserJourney = require('../models/UserJourney');
// ✅ Named export: whatsappClient + sendWAMessage wrapper import
const { whatsappClient, sendWAMessage } = require('../config/whatsapp');

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
        
        // WHATSAPP OFFICIAL ID PRE-RESOLVER
        let finalWhatsappNumber = cleanNumber;
        let formattedNumber = `${cleanNumber}@c.us`;

        try {
            console.log(`🔍 Resolving real WhatsApp identifier for phone: ${cleanNumber}`);
            const numberId = await whatsappClient.getNumberId(cleanNumber);
            if (numberId) {
                finalWhatsappNumber = numberId.user; 
                formattedNumber = numberId._serialized; 
                console.log(`🎯 [LID Pre-Resolver] Phone mapped successfully to ID: ${finalWhatsappNumber}`);
            }
        } catch (idErr) {
            console.error('⚠️ Number ID resolution failed, falling back to standard string format:', idErr.message);
        }

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

        if (!name || !email || !phone) {
            return res.status(400).json({ success: false, message: 'Bhai, Name, Email aur Phone number zaroori hai!' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Ye email toh pehle se registered hai!' });
        }

        // Dummy hashed placeholder for trial accounts to accommodate password table schema rules safely
        const dummySalt = await bcrypt.genSalt(10);
        const dummyPassword = await bcrypt.hash("TrialAccountBypass2026", dummySalt);

        // Sanitize incoming phone sequence
        let cleanNumber = phone.replace(/[^\d]/g, ''); 
        if (cleanNumber.length === 10) {
            cleanNumber = `91${cleanNumber}`;
        }
        
        let finalWhatsappNumber = cleanNumber;
        let formattedNumber = `${cleanNumber}@c.us`;

        try {
            console.log(`🔍 Resolving real WhatsApp identifier for Free Trial phone: ${cleanNumber}`);
            const numberId = await whatsappClient.getNumberId(cleanNumber);
            if (numberId) {
                finalWhatsappNumber = numberId.user; 
                formattedNumber = numberId._serialized; 
                console.log(`🎯 [LID Pre-Resolver] Trial mapped successfully to ID: ${finalWhatsappNumber}`);
            }
        } catch (idErr) {
            console.error('⚠️ Free Trial Identifier mapping lookup failed:', idErr.message);
        }

        // Insert record directly to User model parameters — status: inactive (payment pending)
        const newTrialUser = await User.create({
            name,
            email,
            password: dummyPassword,
            whatsapp_number: finalWhatsappNumber,
            status: 'inactive',   // ✅ Payment confirm hone tak inactive rahega
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

        // ✅ Welcome message confirm-payment route se jayega — abhi nahi (status inactive hai)
        console.log(`✅ [Register Pending] "${name}" saved with status:inactive — awaiting payment QR. ID: ${newTrialUser.id}`);

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
        return res.status(500).json({ success: false, message: 'Server error. Logs check karo.' });
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

// ✉️ 4. MANUAL WHATSAPP MESSAGE BHEJNE KE LIYE
router.post('/send-manual-message', async (req, res) => {
    try {
        const { whatsapp_number, name } = req.body;
        if (!whatsapp_number) return res.status(400).json({ message: 'Number missing hai!' });

        const quotes = [
            "Your only limit is your mind. Keep pushing forward! 💪",
            "Hard work catches up with talent when talent doesn't work hard. 🚀",
            "Today is a new opportunity to build the life you want. ✨",
            "Small steps every day lead to big results over time. 🏆",
            "Don't wait for opportunity. Create it! 😎"
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        let cleanNumber = whatsapp_number.replace(/[^\d]/g, '');
        let targetDestination;

        if (cleanNumber.length > 13) {
            targetDestination = `${cleanNumber}@lid`;
            console.log(`🎯 [LID Route Detected] Formatting token explicitly as: ${targetDestination}`);
        } else {
            if (cleanNumber.length === 10) {
                cleanNumber = `91${cleanNumber}`;
            }
            targetDestination = `${cleanNumber}@c.us`;
            
            try {
                console.log(`🔍 Manual Route: Resolving network identifier for phone: ${cleanNumber}`);
                const numberId = await whatsappClient.getNumberId(cleanNumber);
                if (numberId) {
                    targetDestination = numberId._serialized; 
                }
            } catch (idErr) {
                console.error('⚠️ LID network lookup failed, using standard string fallback:', idErr.message);
            }
        }

        console.log(`🚀 [WA Manual Dispatch] Sending quote to: ${targetDestination}`);
        
        const sent = await sendWAMessage(targetDestination, `Hey ${name || 'User'}! ✨\n\n*An official message from The Affirmation Initiative:*\n\n"${randomQuote}"\n\nKeep grinding! 🔥`);
        if (!sent) {
            return res.status(503).json({ message: 'WhatsApp client ready nahi hai. Baad mein try karo.' });
        }

        console.log(`✅ [WA Manual Sent] Message delivered successfully to ${name}`);
        res.status(200).json({ message: `Message successfully sent to ${name}! ✅` });
    } catch (error) {
        console.error('Manual Message Endpoint Major Failure:', error.message);
        res.status(500).json({ message: 'WhatsApp message fail ho gaya! Internal identifier mapping crash.' });
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