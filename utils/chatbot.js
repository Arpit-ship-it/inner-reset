const { Op } = require('sequelize'); 
const User = require('../models/User');
const MessageLog = require('../models/MessageLog');
const UserMood = require('../models/UserMood');
const { processUserMessage, generateOptionContent } = require('../services/aiEngine');
const UserJourney = require('../models/UserJourney');
const morningJourney = require('../data/morningJourney');

const initializeChatbot = (whatsappClient) => {
    
    whatsappClient.on('message', async (msg) => {
        try {
            // Group messages ko ignore karo
            if (msg.from.includes('@g.us') || msg.isStatus) return;

            // WhatsApp se aane wali direct ID ya Number nikalo
            const cleanNumber = msg.from.split('@')[0]; 

            console.log(`📩 [Bot Triggered] Incoming Message from: ${cleanNumber} | Text: "${msg.body}"`);

            // Build possible stored variants to match against DB
            const searchVariants = [cleanNumber]; // e.g. "919876543210" or LID

            try {
                const contact = await msg.getContact();
                if (contact) {
                    if (contact.number) {
                        const contactNum = String(contact.number).replace(/[^\d]/g, '');
                        if (contactNum && !searchVariants.includes(contactNum)) {
                            searchVariants.push(contactNum);
                        }
                    }
                    if (contact.id && contact.id.user) {
                        const contactIdUser = String(contact.id.user).replace(/[^\d]/g, '');
                        if (contactIdUser && !searchVariants.includes(contactIdUser)) {
                            searchVariants.push(contactIdUser);
                        }
                    }
                }
            } catch (contactErr) {
                console.warn(`⚠️ [Chatbot Contact Resolve Warning]: Failed to fetch contact info: ${contactErr.message}`);
            }

            // Expanded lookup variant rules for each variant
            const extraVariants = [];
            for (const variant of searchVariants) {
                if (variant.length === 12 && variant.startsWith('91')) {
                    const slice2 = variant.slice(2);
                    if (!searchVariants.includes(slice2) && !extraVariants.includes(slice2)) {
                        extraVariants.push(slice2);
                    }
                }
                if (variant.length === 10) {
                    const prefixed = `91${variant}`;
                    if (!searchVariants.includes(prefixed) && !extraVariants.includes(prefixed)) {
                        extraVariants.push(prefixed);
                    }
                }
            }
            searchVariants.push(...extraVariants);

            console.log(`🔍 [Bot User Search] Searching database with identifier variants: ${searchVariants.join(', ')}`);

            const user = await User.findOne({ 
                where: { 
                    whatsapp_number: { [Op.in]: searchVariants }
                } 
            });
            
            if (!user) {
                console.log(`⚠️ [Bot Ignored] No registered user found for: ${cleanNumber} (tried variants: ${searchVariants.join(', ')})`);
                return;
            }

            const userMessage = msg.body.trim().toLowerCase();
            console.log("🚀 [Mental Health Engine] Processing request through AI & Menu Matrix...");

            // 1. Current user message ko database me save karo
            await MessageLog.create({
                whatsapp_number: cleanNumber,
                sender: 'user',
                message_text: msg.body
            });

            // =========================================================================
            // 🌅 USER JOURNEY INTERACTION HANDLER (Morning Check-ins)
            // =========================================================================
            let journey = await UserJourney.findOne({ where: { whatsapp_number: user.whatsapp_number } });
            if (!journey) {
                journey = await UserJourney.create({
                    whatsapp_number: user.whatsapp_number,
                    user_address_name: user.name,
                    companion_name: 'Care Buddy'
                });
            }

            const name = journey.user_address_name || user.name;

            // Morning Choice Response Capture
            if (journey.morning_choice_today === 'PENDING') {
                const dayData = morningJourney[journey.current_day - 1];
                if (dayData) {
                    let optionIndex = -1;
                    if (['1', '2', '3', '4'].includes(userMessage)) {
                        optionIndex = parseInt(userMessage) - 1;
                    } else {
                        optionIndex = dayData.choices.findIndex(c => 
                            userMessage.includes(c.text.toLowerCase()) || 
                            c.text.toLowerCase().includes(userMessage)
                        );
                    }

                    if (optionIndex >= 0 && optionIndex < 4) {
                        const chosen = dayData.choices[optionIndex];
                        const reply = 
                            `🌸 *A beautiful choice, ${name}!* ✨\n\n` +
                            `"${chosen.response}"\n\n` +
                            `${dayData.closingNote || 'Whatever you choose, may today bring you a little more of it.'} ❤️\n\n` +
                            `— Inner Reset\n` +
                            `Daily reminders for a better you.`;

                        journey.morning_choice_today = chosen.text;
                        journey.last_morning_interaction = new Date();
                        journey.total_interactions += 1;
                        journey.morning_response_count += 1;

                        let moods = journey.mood_patterns;
                        if (typeof moods === 'string') {
                            try { moods = JSON.parse(moods); } catch (e) { moods = {}; }
                        }
                        if (!moods || typeof moods !== 'object') moods = {};
                        moods[chosen.text] = (moods[chosen.text] || 0) + 1;
                        journey.mood_patterns = moods;

                        await journey.save();

                        await MessageLog.create({ whatsapp_number: cleanNumber, sender: 'ai', message_text: reply });
                        await whatsappClient.sendMessage(msg.from, reply);
                        console.log(`✅ [Chatbot Morning Choice Response] Sent response for ${chosen.text} to ${cleanNumber}.`);
                        return;
                    }
                }
            }

            // 2. FETCH MESSAGE COUNTER FOR THE LAST 1 HOUR ONLY
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); 
            const totalUserMessages = await MessageLog.count({
                where: {
                    whatsapp_number: cleanNumber,
                    sender: 'user',
                    createdAt: { [Op.gte]: oneHourAgo }
                }
            });

            console.log(`📊 [Session Log] Messages by ${user.name} in last 1 hour: ${totalUserMessages}`);

            // 📝 KEYWORD GROUPS FOR CRITICAL ESCALATION
            const severeKeywords = ['hallucination', 'hallucinations', 'seeing things', 'hearing voices', 'voices in my head', 'suicide', 'kill myself', 'hurt myself', 'end my life', 'end it all', 'die', 'self harm'];
            const matchesAny = (arr) => arr.some(keyword => userMessage.includes(keyword));

            // Strict Option Matching list (only matches when user enters choice command)
            const isOptionSelection = ['1', '2', '3', '4', '5', 'stress', 'sad', 'motivation', 'bored', 'happy'].includes(userMessage);

            let aiReply = "";
            let isConditionSevere = false;
            let isGreeting = false; 

            // 🧠 RESPONSES PROCESSING MATRIX
            if (matchesAny(severeKeywords)) {
                isConditionSevere = true;
                aiReply = `Dear ${user.name}, please read this carefully. You are experiencing very intense and overwhelming feelings right now. Your life is extremely valuable, and I want to make sure you have professional human help right away.\n\n` +
                          `📞 *National Mental Health Helpline (Kiran):* 1800-599-0019 (24/7, Free & Confidential)\n` +
                          `🚨 *Tele-MANAS Government Helpline:* 14416 or 1800-891-4416\n\n` +
                          `I strongly urge you to consult an expert directly who can guide you with proper care:\n` +
                          `👉 *Book a Session with Shaifaly Sangal:* https://shaifalysangal.com/#contact`;
            } 
            else if (['hi', 'hello', 'hey', 'menu', 'help', 'start'].includes(userMessage)) {
                isGreeting = true; 
                aiReply = `Hello ${name}! Welcome back to your mental safe space. ✨\n\n` +
                          `*How are you feeling right now?* 🤔\n` +
                          `Reply with a *NUMBER* or *WORD* to get instant custom tips and a powerful quote:\n\n` +
                          `1️⃣ *Stressed / Anxious* (or reply "stress")\n` +
                          `2️⃣ *Low / Sad* (or reply "sad")\n` +
                          `3️⃣ *Demotivated / Tired* (or reply "motivation")\n` +
                          `4️⃣ *Bored / Distracted* (or reply "bored")\n` +
                          `5️⃣ *Happy / Peaceful* (or reply "happy")\n\n` +
                          `Drop your choice below, or tell me anything on your mind (like relationship advice, coping tips, or how you feel)! 👇`;
            }
            else if (isOptionSelection) {
                // Fetch AI-backed quote and tips for the selected option
                const optionContent = await generateOptionContent(userMessage, name);
                if (optionContent) {
                    aiReply = optionContent;
                } else {
                    const aiResult = await processUserMessage(msg.body, name);
                    aiReply = aiResult.replyMessage;
                }
            }
            else {
                // ALL OTHER MESSAGES (e.g. "I had a breakup and now i want some relationship advice", etc.) GO DIRECTLY TO AI!
                console.log(`🧠 [AI Core] Routing open-ended message from ${name} directly to Gemini AI Engine...`);
                try {
                    const aiResult = await processUserMessage(msg.body, name);
                    aiReply = aiResult.replyMessage;

                    try {
                        const [moodRecord, created] = await UserMood.findOrCreate({
                            where: { whatsappId: msg.from },
                            defaults: { lastMood: aiResult.detectedMood || 'Neutral', interactionCount: 1 }
                        });
                        if (!created) {
                            moodRecord.lastMood = aiResult.detectedMood || 'Neutral';
                            moodRecord.interactionCount += 1;
                            await moodRecord.save();
                        }
                        console.log(`💾 [AI State Logged] Cloud synced for ${cleanNumber} -> Mood: [${aiResult.detectedMood}]`);
                    } catch (dbErr) {
                        console.error("⚠️ AI state mapping database sync failure:", dbErr.message);
                    }
                } catch (aiErr) {
                    console.error("❌ AI Engine Pipeline Failure:", aiErr);
                    aiReply = `I am listening, ${name}. Tell me more about what's on your mind?`;
                }
            }

            if (!isConditionSevere && !isGreeting && totalUserMessages >= 7) {
                aiReply += `\n\n---\n🤝 *Need human support?* https://shaifalysangal.com/#contact`;
            }

            await MessageLog.create({ whatsapp_number: cleanNumber, sender: 'ai', message_text: aiReply });
            await whatsappClient.sendMessage(msg.from, aiReply);
            
            console.log(`✅ [Chatbot Message Sent] Delivery to ${cleanNumber}.`);

        } catch (error) {
            console.error("❌ [Chatbot Fatal Error]:", error);
        }
    });
};

module.exports = initializeChatbot;