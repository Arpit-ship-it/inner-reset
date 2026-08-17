// services/aiEngine.js
const axios = require('axios');
const path = require('path');

// PATH SAFEGUARD: Forces the application to fetch the .env directly from the root folder
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Try importing @google/generative-ai SDK if available
let GoogleGenerativeAI;
try {
    const SDK = require('@google/generative-ai');
    GoogleGenerativeAI = SDK.GoogleGenerativeAI;
} catch (e) {
    GoogleGenerativeAI = null;
}

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
    Relationship: [
        "Your heart is resilient, even when it feels fragile. Healing takes time. ❤️",
        "You are worthy of genuine love, respect, and deep peace. 🌟",
        "This chapter is an ending, but your story is far from over. 📖"
    ],
    Neutral: [
        "Keep moving forward. Every small step counts toward a better tomorrow. 🚀",
        "You are capable of handling whatever comes your way today. 🌟",
        "Every new day is a fresh opportunity to build the life you want. ✨"
    ]
};

/**
 * Smart Fallback AI response system when API is offline or key is invalid
 */
function getSmartFallbackResponse(userMessage, userName = "Friend") {
    const lowerMsg = userMessage.toLowerCase();

    // 1. Breakup & Relationship Advice Intent
    if (
        lowerMsg.includes('breakup') || lowerMsg.includes('relationship') || lowerMsg.includes('ex') ||
        lowerMsg.includes('heartbreak') || lowerMsg.includes('divorce') || lowerMsg.includes('partner') ||
        lowerMsg.includes('cheated') || lowerMsg.includes('bf') || lowerMsg.includes('gf') ||
        lowerMsg.includes('boyfriend') || lowerMsg.includes('girlfriend') || lowerMsg.includes('love')
    ) {
        return {
            isQuestion: true,
            detectedMood: "Relationship",
            replyMessage: 
                `💔 *Dear ${userName}, I hear you, and I am so sorry you are carrying this pain.* ❤️\n\n` +
                `Going through a breakup or relationship issue is one of the heaviest emotional experiences we can endure. It is completely natural to feel hurt, confused, or lost right now.\n\n` +
                `🌱 *Here are some compassionate steps to help you cope today:*\n\n` +
                `1️⃣ *Allow Yourself to Grieve:* Don't suppress your tears or emotions. Pain demands to be felt before it can heal.\n` +
                `2️⃣ *Strict No-Contact Rule:* Give yourself and your heart distance to breathe. Re-opening contact right now will only bleed open fresh wounds.\n` +
                `3️⃣ *Reclaim Your Identity:* Remind yourself of who you were before this relationship. Focus on your passions, hobbies, and personal goals.\n` +
                `4️⃣ *Lean on a Support System:* Talk to trusted friends, family, or a professional guide. You don't have to walk this path alone.\n\n` +
                `💬 *Quote for Healing:* "Pain is inevitable, but suffering is optional. Growth comes when you let go of what was to make room for what will be."\n\n` +
                `— Inner Reset\nDaily reminders for a better you.`
        };
    }

    // 2. Anxiety / Panic / Stress
    if (lowerMsg.includes('anxious') || lowerMsg.includes('anxiety') || lowerMsg.includes('panic') || lowerMsg.includes('overwhelmed') || lowerMsg.includes('stress')) {
        return {
            isQuestion: true,
            detectedMood: "Anxiety",
            replyMessage: 
                `🌸 *Dear ${userName}, take a deep breath right now with me.* 🕊️\n\n` +
                `When anxiety strikes, your brain is trying to protect you, but you are completely safe in this moment.\n\n` +
                `🛠️ *Quick Grounding exercise (5-4-3-2-1 Technique):*\n` +
                `• Look around: Name 5 things you can see.\n` +
                `• Touch 4 things near you.\n` +
                `• Listen for 3 distinct sounds.\n` +
                `• Smell 2 scents around you.\n` +
                `• Take 1 slow, deep breath in... and out.\n\n` +
                `💬 *Quote for Calm:* "You don't have to control your thoughts. You just have to stop letting them control you."\n\n` +
                `— Inner Reset\nDaily reminders for a better you.`
        };
    }

    // 3. Sadness / Depression / Low
    if (lowerMsg.includes('sad') || lowerMsg.includes('depressed') || lowerMsg.includes('lonely') || lowerMsg.includes('crying') || lowerMsg.includes('hurt')) {
        return {
            isQuestion: true,
            detectedMood: "Neutral",
            replyMessage: 
                `🤍 *Dear ${userName}, I am sending you warmth and gentleness right now.* ✨\n\n` +
                `It's okay to not be okay. Sadness is not a sign of weakness; it's a sign that you care deeply and have a soft heart.\n\n` +
                `🌿 *Gentle reminders for today:*\n` +
                `• Be extra kind to yourself today — treat yourself like a close friend.\n` +
                `• Drink a glass of water and rest your eyes.\n` +
                `• Remember that feelings are like waves: they rise, they peak, and they always pass.\n\n` +
                `💬 *Quote:* "The sun will rise again tomorrow, and so will you."\n\n` +
                `— Inner Reset\nDaily reminders for a better you.`
        };
    }

    // 4. Default General Conversational Response
    return {
        isQuestion: true,
        detectedMood: "Neutral",
        replyMessage: 
            `✨ *Thank you for sharing with me, ${userName}!* 🌟\n\n` +
            `I am here to support your mental wellness, offer advice, and help you navigate life's challenges. Whether you want relationship guidance, stress management techniques, or just a safe space to vent, I'm listening.\n\n` +
            `💡 *Daily Reminder:* Every small step you take today shapes a brighter tomorrow.\n\n` +
            `— Inner Reset\nDaily reminders for a better you.`
    };
}

/**
 * Main AI Engine Processor for User Messages
 */
async function processUserMessage(userMessage, userName = "Friend") {
    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

    if (!apiKey || apiKey.length < 15 || apiKey.startsWith('AQ.')) {
        console.warn("⚠️ [AI Engine] Valid Gemini API Key not detected in environment. Utilizing Smart Offline AI Companion System.");
        return getSmartFallbackResponse(userMessage, userName);
    }

    const systemPrompt = `
You are the official AI Companion for "Inner Reset", a world-class mental fitness, mindfulness, and personal counseling application.
User's Name: "${userName}"
User's Input: "${userMessage}"

Your Mission:
1. Provide a warm, highly empathetic, supportive, and actionable response customized directly to the user's situation.
2. If the user is asking for advice, sharing a personal problem (such as relationship issues, breakup, heartbreak, career stress, anxiety, family trouble, self-esteem, or loneliness), act as a compassionate counselor. Provide clear, supportive steps, empathy, and practical guidance.
3. Structure your response cleanly using bold formatting, bullet points, nice emojis, and short readable paragraphs.
4. Always conclude your response with:
"— Inner Reset
Daily reminders for a better you."

Respond strictly in valid JSON format (do NOT add markdown code block wrappers like \`\`\`json):
{
  "isQuestion": true,
  "detectedMood": "Relationship" | "Anxiety" | "ExamStress" | "Fatigue" | "Neutral",
  "replyMessage": "your full response formatted nicely here"
}
`;

    // Attempt 1: Using @google/generative-ai SDK if installed
    if (GoogleGenerativeAI) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(systemPrompt);
            const rawText = result.response.text().trim();
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const aiOutput = JSON.parse(jsonMatch[0]);
                return {
                    isQuestion: aiOutput.isQuestion !== false,
                    detectedMood: aiOutput.detectedMood || 'Neutral',
                    replyMessage: aiOutput.replyMessage
                };
            }
        } catch (sdkErr) {
            console.warn(`⚠️ [AI Engine SDK Attempt Failed]: ${sdkErr.message}`);
        }
    }

    // Attempt 2: Direct REST Call via Axios (trying active gemini models)
    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro'];
    for (const modelName of modelsToTry) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            const payload = { contents: [{ parts: [{ text: systemPrompt }] }] };
            const response = await axios.post(url, payload, { timeout: 10000 });
            const rawText = response.data.candidates[0].content.parts[0].text.trim();
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const aiOutput = JSON.parse(jsonMatch[0]);
                return {
                    isQuestion: aiOutput.isQuestion !== false,
                    detectedMood: aiOutput.detectedMood || 'Neutral',
                    replyMessage: aiOutput.replyMessage
                };
            }
        } catch (restErr) {
            console.warn(`⚠️ [AI Engine REST Call Failed for ${modelName}]: ${restErr.message}`);
        }
    }

    // Fallback to Smart Offline AI Companion System
    console.log("ℹ️ [AI Engine] REST & SDK calls exhausted. Falling back to Smart Offline AI Companion Engine.");
    return getSmartFallbackResponse(userMessage, userName);
}

/**
 * Generate AI-backed Content for Options 1-5
 */
async function generateOptionContent(optionChoice, userName = "Friend") {
    const key = String(optionChoice).toLowerCase();

    // Option 1: Stressed / Anxious
    if (key === '1' || key === 'stress' || key === 'stressed' || key === 'anxious') {
        return `💡 *Option 1 Selected: Managing Stress & Anxiety* 😰\n\n` +
               `💬 *Quote:* "You don't have to control your thoughts. You just have to stop letting them control you."\n\n` +
               `🛠️ *AI-Backed Tips for ${userName}:*\n` +
               `• *Box Breathing:* Inhale for 4s, hold 4s, exhale 4s, hold 4s.\n` +
               `• *Brain Dump:* Write down everything stressing you on paper to clear mental RAM.\n` +
               `• *Micro-Steps:* Focus ONLY on the single next minute, not the whole day.\n\n` +
               `— Inner Reset\nDaily reminders for a better you.`;
    }

    // Option 2: Low / Sad
    if (key === '2' || key === 'sad' || key === 'low' || key === 'depressed') {
        return `💡 *Option 2 Selected: Navigating Sadness* 😔\n\n` +
               `💬 *Quote:* "The emotion that can break your heart is sometimes the very one that heals it."\n\n` +
               `🛠️ *AI-Backed Tips for ${userName}:*\n` +
               `• *Change Environment:* Move to a sunlit space or take a 5-minute walk outside.\n` +
               `• *Hydrate & Rest:* Drink a warm beverage and give yourself permission to feel.\n` +
               `• *Self-Compassion:* Speak to yourself like you would speak to a loved friend.\n\n` +
               `— Inner Reset\nDaily reminders for a better you.`;
    }

    // Option 3: Demotivated / Tired
    if (key === '3' || key === 'motivation' || key === 'tired' || key === 'demotivated') {
        return `💡 *Option 3 Selected: Recharging Motivation* 🔋\n\n` +
               `💬 *Quote:* "Amateurs sit and wait for inspiration; the rest of us just get up and go to work."\n\n` +
               `🛠️ *AI-Backed Tips for ${userName}:*\n` +
               `• *The 5-Minute Rule:* Commit to doing just 5 minutes of work; momentum will follow.\n` +
               `• *Unplug Briefly:* Give your brain a 10-minute break from screen overstimulation.\n` +
               `• *Remember the Root:* Reconnect with WHY you started in the first place.\n\n` +
               `— Inner Reset\nDaily reminders for a better you.`;
    }

    // Option 4: Bored / Distracted
    if (key === '4' || key === 'bored' || key === 'distracted' || key === 'focus') {
        return `💡 *Option 4 Selected: Breaking Boredom & Refocusing* 🥱\n\n` +
               `💬 *Quote:* "Boredom is the feeling that everything is a waste of time; serenity, that nothing is."\n\n` +
               `🛠️ *AI-Backed Tips for ${userName}:*\n` +
               `• *Dopamine Detox:* Put your phone in another room for 30 minutes.\n` +
               `• *Gamify Tasks:* Set a 15-minute timer and race against yourself.\n` +
               `• *Physical Shock:* Splash cold water on your face to reset your alertness.\n\n` +
               `— Inner Reset\nDaily reminders for a better you.`;
    }

    // Option 5: Happy / Peaceful
    if (key === '5' || key === 'happy' || key === 'peaceful' || key === 'great') {
        return `💡 *Option 5 Selected: Embracing Happiness & Joy* 🌱\n\n` +
               `💬 *Quote:* "Happiness is not something ready-made. It comes from your own actions."\n\n` +
               `🛠️ *AI-Backed Tips for ${userName}:*\n` +
               `• *Anchor the Moment:* Take a deep breath and consciously savor this good feeling.\n` +
               `• *Express Gratitude:* Text someone you appreciate or write down 3 good things.\n` +
               `• *Pay It Forward:* Share your positive energy with a warm compliment to someone.\n\n` +
               `— Inner Reset\nDaily reminders for a better you.`;
    }

    return null;
}

module.exports = {
    processUserMessage,
    generateOptionContent
};