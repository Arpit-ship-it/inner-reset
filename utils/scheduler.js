const cron = require('node-cron');
const User = require('../models/User');
const UserJourney = require('../models/UserJourney');
const waModule = process.env.NODE_ENV === 'production'
    ? require('../config/whatsapp.production')
    : require('../config/whatsapp');
const { sendWAMessage } = waModule;
const morningJourney = require('../data/morningJourney');

// 📊 COMPREHENSIVE PERSONALIZED MOTIVATING QUOTE matrix
const quotesBank = {
    PEACE: [
        "🕊️ *'Peace is a daily practice, a quiet breath in a loud world.'* Today, let your peace be your power, {name}. Protect your mental space and breathe easy! 🧘✨",
        "🌸 *'Calmness is the cradle of power.'* As you step into your day, {name}, remember that you don't have to rush. Let everything unfold at its own private pace. 😌🍃",
        "🍃 *'Within you, there is a stillness and a sanctuary to which you can retreat at any time.'* Stay grounded in your calm today, {name}. You are safe. 🕯️✨",
        "🧘 *'Do not let the behavior of others destroy your inner peace.'* You are the gatekeeper of your mind today, {name}. Choose serenity. 🕊️💛",
        "😌 *'Quiet minds cannot be perplexed or frightened, but go on in fortune or misfortune.'* Walk through your day with steady, peaceful steps, {name}. 🌸✨"
    ],
    HAPPINESS: [
        "😊 *'Joy does not simply happen to us. We have to choose joy and keep choosing it.'* Let your smile be your guiding light today, {name}! 🌻✨",
        "🌻 *'A happy heart is a magnet for miracles.'* Focus on the simple blessings today, {name}. You deserve all the joy that comes your way! 💛🎉",
        "✨ *'Happiness is not something ready-made. It comes from your own actions.'* Shine bright and find joy in the smallest moments today, {name}! 🌈💖",
        "🌈 *'Joy is what happens when we allow ourselves to recognize how good things really are.'* Open your heart to the laughter and beauty of today, {name}! 😂🌸",
        "🎉 *'Every day may not be good, but there is something good in every day.'* Look for the happy sparkles today, {name}! You will find them. ✨😊"
    ],
    CONFIDENCE: [
        "💪 *'You are braver than you believe, stronger than you seem, and smarter than you think.'* Trust your capabilities completely today, {name}! 🚀🔥",
        "🦁 *'Action is the foundational key to all success.'* Believe in your vision, {name}, and take that next brave step forward. You've got this! 💥🏆",
        "🚀 *'The only way to do great work is to love what you do.'* Step into your power today, {name}. Your energy and persistence will conquer all! 🔥⚡",
        "🎯 *'You don't have to be great to start, but you have to start to be great.'* Keep your focus sharp and your determination high today, {name}! 🌟💪",
        "🏆 *'Success is the sum of small efforts repeated day in and day out.'* Walk with your head high, {name}. You are capable of handling anything! 🦁✨"
    ],
    HOPE: [
        "🌟 *'Hope is the thing with feathers that perches in the soul.'* Keep your heart open to beautiful possibilities and fresh hope today, {name}! 🌈🚪",
        "🚪 *'The future belongs to those who believe in the beauty of their dreams.'* Have absolute faith in your journey, {name}. Great things are coming! 💖🌠",
        "💖 *'When you remain open to receive, life orchestrates unexpected gifts.'* Expect beautiful silver linings and kind surprises today, {name}! 🌍✨",
        "🌍 *'Miracles happen every day. Change your perception and you will see them everywhere.'* Trust the timing of your life, {name}. ☄️🤝",
        "🤝 *'Hope is being able to see that there is light despite all of the darkness.'* Let your hope shine brightly today, {name}. You are never alone. ✨🌻"
    ],
    GENERAL: [
        "🌞 *'Every morning is a fresh page to write your beautiful story.'* Rise and shine, {name}! Make today count with small, positive steps. 🚀✨",
        "🌱 *'Start where you are. Use what you have. Do what you can.'* Believe in yourself today, {name}. You are doing much better than you think! 🌟💪",
        "✨ *'Write it on your heart that every day is the best day in the year.'* Welcome this day with open arms and a positive mind, {name}! 🌸💛",
        "🌻 *'Give every day the chance to become the most beautiful day of your life.'* Let your unique light shine brightly today, {name}! 🌈🚀",
        "🚀 *'Your energy introduces you before you even speak.'* Charge this beautiful morning with optimism and power, {name}! You've got this! 💥✨"
    ]
};

const afternoonQuotes = [
    "🔋 *'It always seems impossible until it's done.'* {name}, you are halfway through the day! Shake off the fatigue, stretch, and keep going strong! 🌊💪",
    "🔥 *'Success is the sum of small efforts, repeated day in and day out.'* Keep grinding, {name}! Your dedication is building your dreams. 🏆🌟",
    "⚡ *'Energy and persistence conquer all things.'* Take a deep breath, drink a glass of water, and recharge your focus for the afternoon, {name}! 🥤🎯",
    "🚀 *'Don't watch the clock; do what it does. Keep going.'* You are doing incredibly well, {name}. Trust your pace and finish the day strong! 🌟🦁",
    "🌟 *'Your current situation is not your final destination.'* Keep moving, keep believing, and keep shining, {name}. The breakthrough is close! 🌈💪",
    "🥤 *'A river cuts through rock, not because of its power, but because of its persistence.'* Take a moment to relax your shoulders, {name}, and push on! 🌊✨",
    "💪 *'Believe you can and you're halfway there.'* You have within you everything you need to conquer this day, {name}. Keep your head high! 🦁🔥"
];

const eveningQuotes = [
    "🌙 *'Let gratitude be the pillow you lay your head on tonight.'* {name}, the heavy lifting of the day is over. It is time to let your mind rest. 🧘✨",
    "🌌 *'Peace is its own reward. Let the evening settle your mind.'* Release today's worries, {name}. You did your absolute best, and that is enough. Sleep well! ❤️💤",
    "🛋️ *'Come evening, the hustle ends and the soul breathes.'* Unwind the tension of the day, {name}. Give yourself permission to completely disconnect. 🌙✨",
    "✨ *'Each evening brings us closer to a new beginning, but first, let the silence heal you.'* Relax your body and calm your spirit tonight, {name}. 🧘🍃",
    "🛌 *'True silence is the rest of the mind, and is to the spirit what sleep is to the body.'* Sleep deeply and safely tonight, {name}. Tomorrow is a fresh start! 🌙💤",
    "🧘 *'Nature does not hurry, yet everything is accomplished.'* Let go of what was, accept what is, and have faith in what will be, {name}. Goodnight! ❤️🌟",
    "🌙 *'The day is done, the night is here, let your worries disappear.'* Wrap yourself in comfort and drift off to a peaceful sleep, {name}. You earned it! 🛌✨"
];

// Helper to determine theme
function getThemeFromChoice(choice) {
    if (!choice) return 'GENERAL';
    const c = choice.toLowerCase();
    if (c.includes('peace') || c.includes('calm') || c.includes('relax') || c.includes('ease') || c.includes('stillness') || c.includes('free')) {
        return 'PEACE';
    }
    if (c.includes('happy') || c.includes('joy') || c.includes('smile') || c.includes('laugh') || c.includes('pleasure')) {
        return 'HAPPINESS';
    }
    if (c.includes('confidence') || c.includes('strength') || c.includes('try') || c.includes('action') || c.includes('growth') || c.includes('discipline') || c.includes('courage') || c.includes('dream') || c.includes('work') || c.includes('productive') || c.includes('win')) {
        return 'CONFIDENCE';
    }
    if (c.includes('hope') || c.includes('miracle') || c.includes('opportunity') || c.includes('love') || c.includes('relationship') || c.includes('surprise') || c.includes('understanding') || c.includes('kindness') || c.includes('appreciat')) {
        return 'HOPE';
    }
    return 'GENERAL';
}

// ⏰ 1. Morning Choice Question (8:30 AM)
const sendMorningChoicePrompt = async () => {
    try {
        console.log(`\n🔄 [Scheduler] Sending morning choice prompts (8:30 AM)...`);
        const users = await User.findAll({ where: { status: 'active' } });
        if (users.length === 0) {
            console.log('⚠️ [Scheduler] No active users found.');
            return;
        }

        for (let user of users) {
            if (!user.whatsapp_number) continue;

            let journey = await UserJourney.findOne({ where: { whatsapp_number: user.whatsapp_number } });
            if (!journey) {
                journey = await UserJourney.create({
                    whatsapp_number: user.whatsapp_number,
                    user_address_name: user.name,
                    companion_name: 'Care Buddy'
                });
            } else {
                // Increment day (up to 30, then wrap)
                let newDay = journey.current_day + 1;
                if (newDay > 30) newDay = 1;
                journey.current_day = newDay;
            }

            // Set choice status to PENDING
            journey.morning_choice_today = 'PENDING';
            journey.afternoon_choice_today = null;
            await journey.save();

            const dayData = morningJourney[journey.current_day - 1];
            if (!dayData) continue;

            const name = journey.user_address_name || user.name;

            const message = 
                `🌿 Good Morning, ${name}! ☀️\n` +
                `Day ${journey.current_day} of 30\n\n` +
                `Before the world asks anything from you today...\n\n` +
                `What would you like to invite into your day? 💛\n\n` +
                `${dayData.choices.map((c, i) => `${i + 1}️⃣ ${c.emoji} ${c.text}`).join('\n')}\n\n` +
                `Simply reply with 1, 2, 3, or 4, and we'll send you a personalized affirmation to guide your day.\n\n` +
                `— Inner Reset\n` +
                `Daily reminders for a better you.`;

            const sent = await sendWAMessage(user.whatsapp_number, message);
            if (sent) {
                console.log(`✅ [Morning Choice Prompt] Sent to: ${user.name} (${user.whatsapp_number})`);
            }
        }
    } catch (err) {
        console.error('🚨 Error in sendMorningChoicePrompt:', err);
    }
};

// ⏰ 2. Morning Quote (9:00 AM)
const sendMorningQuote = async () => {
    try {
        console.log(`\n🔄 [Scheduler] Sending morning quotes (9:00 AM)...`);
        const users = await User.findAll({ where: { status: 'active' } });
        if (users.length === 0) return;

        for (let user of users) {
            if (!user.whatsapp_number) continue;

            let journey = await UserJourney.findOne({ where: { whatsapp_number: user.whatsapp_number } });
            if (!journey) {
                journey = await UserJourney.create({
                    whatsapp_number: user.whatsapp_number,
                    user_address_name: user.name,
                    companion_name: 'Care Buddy'
                });
            }

            const name = journey.user_address_name || user.name;
            const choice = journey.morning_choice_today;
            const theme = getThemeFromChoice(choice);
            const themeQuotes = quotesBank[theme] || quotesBank.GENERAL;
            
            const quoteIndex = (journey.current_day - 1) % themeQuotes.length;
            const quoteTemplate = themeQuotes[quoteIndex];
            const quote = quoteTemplate.replace('{name}', name);

            let header = choice && choice !== 'PENDING' 
                ? `🌞 *Morning Quote* (Focus: *${choice}*)\n\n`
                : `🌞 *Morning Quote*\n\n`;

            const message = 
                `Hey ${name}! 👋\n\n` +
                header +
                `${quote}\n\n` +
                `— Inner Reset\n` +
                `Daily reminders for a better you.`;

            const sent = await sendWAMessage(user.whatsapp_number, message);
            if (sent) {
                console.log(`✅ [Morning Quote] Sent to: ${user.name} (${user.whatsapp_number})`);
            }
        }
    } catch (err) {
        console.error('🚨 Error in sendMorningQuote:', err);
    }
};

// ⏰ 3. Afternoon Quote (1:00 PM)
const sendAfternoonQuote = async () => {
    try {
        console.log(`\n🔄 [Scheduler] Sending afternoon quotes (1:00 PM)...`);
        const users = await User.findAll({ where: { status: 'active' } });
        if (users.length === 0) return;

        for (let user of users) {
            if (!user.whatsapp_number) continue;

            let journey = await UserJourney.findOne({ where: { whatsapp_number: user.whatsapp_number } });
            if (!journey) {
                journey = await UserJourney.create({
                    whatsapp_number: user.whatsapp_number,
                    user_address_name: user.name,
                    companion_name: 'Care Buddy'
                });
            }

            const name = journey.user_address_name || user.name;
            const quoteIndex = (journey.current_day - 1) % afternoonQuotes.length;
            const quoteTemplate = afternoonQuotes[quoteIndex];
            const quote = quoteTemplate.replace('{name}', name);

            const message = 
                `Hey ${name}! 👋\n\n` +
                `🔥 *Afternoon Focus* 🔥\n\n` +
                `${quote}\n\n` +
                `— Inner Reset\n` +
                `Daily reminders for a better you.`;

            const sent = await sendWAMessage(user.whatsapp_number, message);
            if (sent) {
                console.log(`✅ [Afternoon Quote] Sent to: ${user.name} (${user.whatsapp_number})`);
            }
        }
    } catch (err) {
        console.error('🚨 Error in sendAfternoonQuote:', err);
    }
};

// ⏰ 4. Evening Quote (8:00 PM)
const sendEveningQuote = async () => {
    try {
        console.log(`\n🔄 [Scheduler] Sending evening quotes (8:00 PM)...`);
        const users = await User.findAll({ where: { status: 'active' } });
        if (users.length === 0) return;

        for (let user of users) {
            if (!user.whatsapp_number) continue;

            let journey = await UserJourney.findOne({ where: { whatsapp_number: user.whatsapp_number } });
            if (!journey) {
                journey = await UserJourney.create({
                    whatsapp_number: user.whatsapp_number,
                    user_address_name: user.name,
                    companion_name: 'Care Buddy'
                });
            }

            const name = journey.user_address_name || user.name;
            const quoteIndex = (journey.current_day - 1) % eveningQuotes.length;
            const quoteTemplate = eveningQuotes[quoteIndex];
            const quote = quoteTemplate.replace('{name}', name);

            const message = 
                `Hey ${name}! 👋\n\n` +
                `🧘 *Evening Reflection* 🧘\n\n` +
                `${quote}\n\n` +
                `— Inner Reset\n` +
                `Daily reminders for a better you.`;

            const sent = await sendWAMessage(user.whatsapp_number, message);
            if (sent) {
                console.log(`✅ [Evening Quote] Sent to: ${user.name} (${user.whatsapp_number})`);
            }
        }
    } catch (err) {
        console.error('🚨 Error in sendEveningQuote:', err);
    }
};

// CRON JOB SETUP (Indian Standard Time / Server local time)

// 8:30 AM Daily - Morning Choice Question
cron.schedule('30 8 * * *', () => { 
    sendMorningChoicePrompt(); 
});

// 9:00 AM Daily - Morning Quote
cron.schedule('0 9 * * *', () => { 
    sendMorningQuote(); 
});

// 1:00 PM Daily - Afternoon Quote
cron.schedule('0 13 * * *', () => { 
    sendAfternoonQuote(); 
});

// 8:00 PM Daily - Evening Quote
cron.schedule('0 20 * * *', () => { 
    sendEveningQuote(); 
});

console.log('🚀 Premium User Journey Scheduler Loaded Successfully with Motivating Quotes & Choice Check-ins!');

module.exports = {
    sendMorningChoicePrompt,
    sendMorningQuote,
    sendAfternoonQuote,
    sendEveningQuote
};