const express = require('express');
const router = express.Router();
const { processUserMessage, generateOptionContent } = require('../services/aiEngine');

/**
 * 🤖 POST /api/chat
 * Send a message to the AI Chatbot Engine
 * Body: { message: string, name?: string }
 */
router.post('/', async (req, res) => {
    try {
        const { message, name = 'Friend' } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message text is required.' });
        }

        const cleanMsg = message.trim().toLowerCase();

        // 1. Greeting
        if (['hi', 'hello', 'hey', 'menu', 'help', 'start'].includes(cleanMsg)) {
            const menuReply = 
                `Hello ${name}! Welcome back to your mental safe space. ✨\n\n` +
                `*How are you feeling right now?* 🤔\n` +
                `Reply with a *NUMBER* or *WORD* to get instant custom tips and a powerful quote:\n\n` +
                `1️⃣ *Stressed / Anxious* (or reply "stress")\n` +
                `2️⃣ *Low / Sad* (or reply "sad")\n` +
                `3️⃣ *Demotivated / Tired* (or reply "motivation")\n` +
                `4️⃣ *Bored / Distracted* (or reply "bored")\n` +
                `5️⃣ *Happy / Peaceful* (or reply "happy")\n\n` +
                `Drop your choice below, or tell me anything on your mind (like relationship advice, coping tips, or how you feel)! 👇`;
            return res.json({ success: true, reply: menuReply, type: 'greeting' });
        }

        // 2. Option Selection (1-5 or stress, sad, motivation, bored, happy)
        const isOption = ['1', '2', '3', '4', '5', 'stress', 'sad', 'motivation', 'bored', 'happy'].includes(cleanMsg);
        if (isOption) {
            const optionContent = await generateOptionContent(cleanMsg, name);
            if (optionContent) {
                return res.json({ success: true, reply: optionContent, type: 'option' });
            }
        }

        // 3. Open-Ended AI Message (Relationship advice, breakup queries, emotional support, general chat)
        const aiResult = await processUserMessage(message, name);
        return res.json({
            success: true,
            reply: aiResult.replyMessage,
            mood: aiResult.detectedMood,
            isQuestion: aiResult.isQuestion,
            type: 'ai'
        });

    } catch (error) {
        console.error('❌ [Chat API Error]:', error);
        return res.status(500).json({ error: 'Failed to process chat message.' });
    }
});

module.exports = router;
