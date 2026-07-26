// services/aiEngine.js
const axios = require('axios');
const path = require('path');

// PATH SAFEGUARD: Forces the application to fetch the .env directly from the root folder
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const localAffirmationBank = {
    Anxiety: [
        "Inhale courage, exhale fear. You are completely safe right now. 🕊️",
        "This feeling is temporary. You have survived 100% of your hardest days. 💪",
        "Take it one breath at a time. You are doing much better than you think. 🌸"
    ],
    ExamStress: [
        "One exam does not define your entire future. Focus on your effort, not the outcome. 🎯",
        "Take a deep breath. Your hard work will translate into progress. 📚",
        "Trust your preparation. You are capable of handling these challenges. 💪"
    ],
    Fatigue: [
        "Rest is not laziness; it is a prerequisite for success. Take a break. 🛌",
        "Your energy will return. Be gentle with your mind right now. 🔋",
        "Disconnect for a moment. Powering down is how we recharge. 🔌"
    ],
    Neutral: [
        "Keep moving forward. Every small step counts toward a better tomorrow. 🚀",
        "You are capable of handling whatever comes your way today. 🌟",
        "Every new day is a fresh opportunity to build the life you want. ✨"
    ]
};

async function processUserMessage(userMessage, userName = "Friend") {
    try {
        const apiKey = process.env.AI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing AI_API_KEY in environment variables.");
        }

        // 🔥 Updated to active model: gemini-2.0-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const prompt = `
            Analyze the following user message for a mental fitness and mindfulness application called "Inner Reset".
            
            User's Name: "${userName}"
            User Message: "${userMessage}"
            
            First, determine if the message contains a direct question (e.g. asking for advice, definitions, techniques, explanations, or starting a discussion).
            
            1. If it IS a direct question or advice request:
               - Set "isQuestion" to true.
               - In "aiReply", write a detailed, warm, highly personalized, and motivating response answering their question directly.
               - Use nice emojis and format it with short, readable paragraphs or bullet points.
               - Conclude the message with:
                 "— Inner Reset\nDaily reminders for a better you."
               - Do not include an affirmation inside "aiReply".
               
            2. If it is NOT a direct question (e.g. they are just greeting like "hi", sharing a feeling, venting, or making a statement like "I feel tired"):
               - Set "isQuestion" to false.
               - Categorize their emotional state into exactly ONE of these words: [Anxiety, ExamStress, Fatigue, Neutral].
               - In "aiReply", generate a warm, 1-line empathetic comfort response customized specifically to their comment.
               
            You MUST respond strictly in this exact JSON format. Do not wrap it in markdown code blocks or raw conversational prose:
            {
                "isQuestion": true | false,
                "sentiment": "Anxiety" | "ExamStress" | "Fatigue" | "Neutral",
                "aiReply": "your response here"
            }
        `;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }]
        };

        const response = await axios.post(url, payload);
        const rawText = response.data.candidates[0].content.parts[0].text.trim();
        
        // Regex extractor to grab clean JSON boundaries
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Could not extract a valid JSON structural object from AI response text payload.");
        }

        const aiOutput = JSON.parse(jsonMatch[0]);

        const allowedSentiments = ['Anxiety', 'ExamStress', 'Fatigue', 'Neutral'];
        const finalSentiment = allowedSentiments.includes(aiOutput.sentiment) ? aiOutput.sentiment : 'Neutral';

        if (aiOutput.isQuestion) {
            return {
                isQuestion: true,
                detectedMood: finalSentiment,
                replyMessage: aiOutput.aiReply
            };
        } else {
            const targetedVault = localAffirmationBank[finalSentiment];
            const randomAffirmation = targetedVault[Math.floor(Math.random() * targetedVault.length)];

            return {
                isQuestion: false,
                detectedMood: finalSentiment,
                replyMessage: `✨ ${aiOutput.aiReply || 'Keep moving forward.'}\n\n💡 *Daily Affirmation for you:* ${randomAffirmation}\n\n— Inner Reset\nDaily reminders for a better you.`
            };
        }

    } catch (error) {
        console.error("🚨 AI Engine Error Context:", error.response ? error.response.data : error.message);
        
        return {
            isQuestion: false,
            detectedMood: "Neutral",
            replyMessage: "✨ Keep moving forward. Every small step counts toward a better tomorrow.\n\n💡 *Daily Affirmation for you:* You are capable of handling whatever comes your way today.\n\n— Inner Reset\nDaily reminders for a better you."
        };
    }
}

module.exports = { processUserMessage };