// 🌅 30-Day Morning Mood & Affirmation Journey
// Heart-touching questions with 4 choices and personalized responses

const morningJourney = [
    {
        day: 1,
        greeting: "Good Morning 🌞",
        question: "Before the world asks anything from you today, what would you like to choose for yourself? 💛",
        choices: [
            { emoji: "🌞", text: "Peace", response: "🌸 'Peace is not the absence of storm, but the presence of anchor within.' May your mind remain deeply serene today." },
            { emoji: "✨", text: "Happiness", response: "✨ 'Happiness is a state of active appreciation.' Let your joy be an internal blueprint that powers your day!" },
            { emoji: "💪", text: "Confidence", response: "💪 'You have survived 100% of your hardest days.' Trust your inherent strength and step forward with absolute certainty!" },
            { emoji: "🌈", text: "Surprise", response: "🌈 'When you remain open to receive, life orchestrates unexpected gifts.' May today bring an amazing silver lining!" }
        ],
        closingNote: "Whatever you choose, may today bring you a little more of it. ❤️"
    },
    {
        day: 2,
        greeting: "Good Morning 🌷",
        question: "If today could give you one beautiful gift, what would you ask for?",
        choices: [
            { emoji: "🕊️", text: "Peace of Mind", response: "🕊️ 'A peaceful mind generates power.' When your thoughts settle, clarity follows." },
            { emoji: "💪", text: "Inner Strength", response: "💪 'Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.'" },
            { emoji: "✨", text: "New Hope", response: "✨ 'Hope is being able to see that there is light despite all of the darkness.' Keep believing." },
            { emoji: "💖", text: "Love", response: "💖 'Love yourself first, and everything else falls into line.' You deserve your own kindness." }
        ],
        closingNote: "Sometimes, simply knowing what we need brings us one step closer to receiving it."
    },
    {
        day: 3,
        greeting: "Good Morning ☀️",
        question: "How would you love to feel today?",
        choices: [
            { emoji: "😊", text: "Happy", response: "😊 'Happiness is not by chance, but by choice.' Choose it as many times as you need today." },
            { emoji: "😌", text: "Calm", response: "😌 'Calmness is the cradle of power.' In stillness, you find your greatest strength." },
            { emoji: "💪", text: "Confident", response: "💪 'With confidence, you have won before you have started.' Trust yourself completely today." },
            { emoji: "🌻", text: "Hopeful", response: "🌻 'Hope is the thing with feathers that perches in the soul.' Let it lift you today." }
        ],
        closingNote: "Choose your feeling before the day chooses it for you. ❤️"
    },
    {
        day: 4,
        greeting: "Good Morning 🌈",
        question: "What does your heart need a little more of today?",
        choices: [
            { emoji: "💖", text: "Love", response: "💖 'Love is the bridge between you and everything.' Open your heart to receive it." },
            { emoji: "🕊️", text: "Peace", response: "🕊️ 'Peace begins with a smile.' Let tranquility wash over you today." },
            { emoji: "🤗", text: "Understanding", response: "🤗 'Understanding is the first step to acceptance.' Be gentle with yourself and others." },
            { emoji: "✨", text: "Hope", response: "✨ 'Hope is the only thing stronger than fear.' Hold onto it tightly." }
        ],
        closingNote: "Listen to your heart today. Sometimes, it quietly knows exactly what you need."
    },
    {
        day: 5,
        greeting: "Good Morning 🌞",
        question: "What would you love to hear today?",
        choices: [
            { emoji: "💖", text: "You are loved", response: "💖 You are deeply loved, exactly as you are. Your presence matters more than you know." },
            { emoji: "🌟", text: "You are enough", response: "🌟 You are enough. You have always been enough. You will always be enough." },
            { emoji: "💪", text: "You can do this", response: "💪 You can do this. You've done hard things before. This is just one more mountain to climb." },
            { emoji: "🌈", text: "Something beautiful is coming", response: "🌈 Something beautiful is on its way to you. Stay open. Stay hopeful. Stay ready." }
        ],
        closingNote: "Sometimes, the words we wait to hear from others are the words we most need to say to ourselves."
    },
    {
        day: 6,
        greeting: "Good Morning 🌱",
        question: "What are you ready to welcome into your life today?",
        choices: [
            { emoji: "🚪", text: "New Opportunities", response: "🚪 'Opportunities don't happen. You create them.' Be open to what comes your way today." },
            { emoji: "🕊️", text: "Peace", response: "🕊️ 'Do not let the behavior of others destroy your inner peace.' Guard it fiercely." },
            { emoji: "✨", text: "Abundance", response: "✨ 'Abundance is not something we acquire. It is something we tune into.' Feel it flowing to you." },
            { emoji: "😊", text: "Happiness", response: "😊 'Happiness is when what you think, what you say, and what you do are in harmony.' Align yourself today." }
        ],
        closingNote: "When we become open to receiving, life often surprises us in beautiful ways."
    },
    {
        day: 7,
        greeting: "Good Morning ☀️",
        question: "How would you love this day to unfold?",
        choices: [
            { emoji: "🌞", text: "Peacefully", response: "🌞 'Peace is not the absence of conflict, but the ability to cope with it.' May calm guide your day." },
            { emoji: "🎯", text: "Productively", response: "🎯 'Productivity is never an accident.' Your focused effort today will create tomorrow's results." },
            { emoji: "😊", text: "Happily", response: "😊 'Every day may not be good, but there is something good in every day.' Find those moments." },
            { emoji: "✨", text: "Surprisingly Beautiful", response: "✨ 'Expect nothing. Appreciate everything.' Let life surprise you in wonderful ways." }
        ],
        closingNote: "You may not control everything that happens today, but you can choose the energy you carry into it."
    },
    {
        day: 8,
        greeting: "Good Morning 🦋",
        question: "What are you giving yourself permission to feel today?",
        choices: [
            { emoji: "😊", text: "Happy", response: "😊 'Happiness is an inside job.' Give yourself full permission to feel joy without reason." },
            { emoji: "🕊️", text: "Free", response: "🕊️ 'The secret to happiness is freedom, and the secret to freedom is courage.' Be free today." },
            { emoji: "😌", text: "Relaxed", response: "😌 'Sometimes the most productive thing you can do is relax.' Release all tension now." },
            { emoji: "💪", text: "Confident", response: "💪 'Confidence is not 'they will like me.' Confidence is 'I'll be fine if they don't.'" }
        ],
        closingNote: "You don't always need a reason to feel good. Sometimes, you can simply give yourself permission."
    },
    {
        day: 9,
        greeting: "Good Morning 🌞",
        question: "What little thing would make you smile today?",
        choices: [
            { emoji: "🎉", text: "Good News", response: "🎉 'Every accomplishment starts with the decision to try.' May good news find you today." },
            { emoji: "☕", text: "Some Me-Time", response: "☕ 'Self-care is how you take your power back.' Carve out moments just for you." },
            { emoji: "💖", text: "Appreciation", response: "💖 'Feeling gratitude and not expressing it is like wrapping a present and not giving it.' Share or receive appreciation today." },
            { emoji: "🏆", text: "A Small Win", response: "🏆 'Success is the sum of small efforts repeated day in and day out.' Celebrate every tiny victory." }
        ],
        closingNote: "Happiness doesn't always arrive in big moments. Sometimes, it quietly appears in the little ones."
    },
    {
        day: 10,
        greeting: "Good Morning 💫",
        question: "What are you choosing to trust today?",
        choices: [
            { emoji: "💖", text: "Myself", response: "💖 'Trust yourself. You have survived a lot, and you'll survive whatever is coming.' Believe in your resilience." },
            { emoji: "🌍", text: "Life", response: "🌍 'Life is a series of natural and spontaneous changes. Don't resist them.' Trust the flow." },
            { emoji: "🌱", text: "The Process", response: "🌱 'Trust the process. Your time is coming. Just do the work and the results will handle themselves.'" },
            { emoji: "✨", text: "Miracles", response: "✨ 'Miracles happen every day. Change your perception of what a miracle is and you'll see them all around you.'" }
        ],
        closingNote: "You don't need to have all the answers today. Sometimes, trust is enough for the next step."
    },
    // Days 11-30 continue with same structure...
    {
        day: 11,
        greeting: "Good Morning 🌿",
        question: "What kindness would you like to give yourself today?",
        choices: [
            { emoji: "😎", text: "Rest", response: "😎 'Rest when you're weary. Refresh and renew yourself, your body, your mind, your spirit. Then get back to work.'" },
            { emoji: "🤗", text: "Patience", response: "🤗 'Patience is not the ability to wait, but how you act while you're waiting.' Be gentle with your journey." },
            { emoji: "💖", text: "Appreciation", response: "💖 'Appreciation is a wonderful thing. It makes what is excellent in others belong to us as well.' Start with yourself." },
            { emoji: "🥗", text: "Better Care", response: "🥗 'Take care of your body. It's the only place you have to live.' Nourish yourself well today." }
        ],
        closingNote: "Speak to yourself today the way you would speak to someone you deeply love."
    },
    {
        day: 12,
        greeting: "Good Morning 🎯",
        question: "What deserves your best energy today?",
        choices: [
            { emoji: "💖", text: "Myself", response: "💖 'You yourself, as much as anybody in the entire universe, deserve your love and affection.' Prioritize yourself." },
            { emoji: "🌟", text: "My Dreams", response: "🌟 'The future belongs to those who believe in the beauty of their dreams.' Invest in your vision." },
            { emoji: "💼", text: "My Work", response: "💼 'Choose a job you love, and you will never have to work a day in your life.' Give your best today." },
            { emoji: "👨‍👩‍👧‍👦", text: "My Relationships", response: "👨‍👩‍👧‍👦 'The greatest gift you can give someone is your time, your attention, your love, your concern.' Share wisely." }
        ],
        closingNote: "Your energy is precious. Give it today to what truly matters."
    },
    {
        day: 13,
        greeting: "Good Morning 🌻",
        question: "What would make today feel a little more beautiful?",
        choices: [
            { emoji: "😂", text: "Laughter", response: "😂 'Laughter is an instant vacation.' Find reasons to smile and laugh today." },
            { emoji: "🕊️", text: "Peace", response: "🕊️ 'Peace is the beauty of life. It is sunshine. It is the smile of a child.' Cultivate it within." },
            { emoji: "💖", text: "Love", response: "💖 'Where there is love there is life.' Let love color your entire day." },
            { emoji: "🔥", text: "Motivation", response: "🔥 'The only way to do great work is to love what you do.' Ignite your passion today." }
        ],
        closingNote: "You don't have to change your whole life today. One beautiful moment is a wonderful beginning."
    },
    {
        day: 14,
        greeting: "Good Morning 🌞",
        question: "Complete this sentence: 'Today is going to be...'",
        choices: [
            { emoji: "🌞", text: "Beautiful", response: "🌞 'Every day is a beautiful day if you choose to see it.' Look for the beauty around you." },
            { emoji: "🕊️", text: "Peaceful", response: "🕊️ 'Peace comes from within. Do not seek it without.' Carry serenity with you today." },
            { emoji: "🎯", text: "Productive", response: "🎯 'You don't have to be great to start, but you have to start to be great.' Take action today." },
            { emoji: "✨", text: "Full of Surprises", response: "✨ 'Life is full of surprises, some good, some not so good.' Stay open to all possibilities." }
        ],
        closingNote: "The way you speak about your day can change the way you walk through it."
    },
    {
        day: 15,
        greeting: "Good Morning 🧘",
        question: "What small thing can you do for yourself today?",
        choices: [
            { emoji: "🌬️", text: "Take Deep Breaths", response: "🌬️ 'Breath is the bridge which connects life to consciousness.' Breathe deeply and intentionally today." },
            { emoji: "🚶", text: "Go for a Walk", response: "🚶 'All truly great thoughts are conceived while walking.' Move your body, clear your mind." },
            { emoji: "🙏", text: "Feel Gratitude", response: "🙏 'Gratitude turns what we have into enough.' Count your blessings, however small." },
            { emoji: "😊", text: "Smile More", response: "😊 'A warm smile is the universal language of kindness.' Share yours freely today." }
        ],
        closingNote: "Small acts of self-care can create big shifts in how we feel."
    },
    {
        day: 16,
        greeting: "Good Morning 💭",
        question: "What would you like to tell your mind this morning?",
        choices: [
            { emoji: "😌", text: "Relax", response: "😌 'Your mind will answer most questions if you learn to relax and wait for the answer.' Give yourself permission to pause." },
            { emoji: "💖", text: "Trust", response: "💖 'Trust your own magic.' You know more than you think you do." },
            { emoji: "🎯", text: "Focus", response: "🎯 'Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.'" },
            { emoji: "🌈", text: "Everything Will Be Okay", response: "🌈 'Everything will be okay in the end. If it's not okay, it's not the end.' Keep believing." }
        ],
        closingNote: "Your mind listens to the words you repeat. Give it something kind to believe today."
    },
    {
        day: 17,
        greeting: "Good Morning 💗",
        question: "Which part of your life deserves some extra love today?",
        choices: [
            { emoji: "💖", text: "Myself", response: "💖 'Love yourself first and everything else falls into line.' You are your most important relationship." },
            { emoji: "🌿", text: "My Body", response: "🌿 'Your body hears everything your mind says. Stay positive.' Treat your body with reverence." },
            { emoji: "🤝", text: "My Relationships", response: "🤝 'The quality of your life is the quality of your relationships.' Nurture your connections." },
            { emoji: "🌟", text: "My Dreams", response: "🌟 'All our dreams can come true, if we have the courage to pursue them.' Keep dreaming, keep believing." }
        ],
        closingNote: "Whatever you choose today, give it your attention without forgetting to give yourself some too."
    },
    {
        day: 18,
        greeting: "Good Morning ⭐",
        question: "At the end of today, what would make you feel proud?",
        choices: [
            { emoji: "💪", text: "I Tried", response: "💪 'It is hard to fail, but it is worse never to have tried to succeed.' Effort itself is victory." },
            { emoji: "🕊️", text: "I Stayed Calm", response: "🕊️ 'In the midst of movement and chaos, keep stillness inside of you.' Your peace is your power." },
            { emoji: "🚀", text: "I Took Action", response: "🚀 'The way to get started is to quit talking and begin doing.' Action creates momentum." },
            { emoji: "💖", text: "I Chose Myself", response: "💖 'You can't pour from an empty cup. Take care of yourself first.' Choosing yourself is never selfish." }
        ],
        closingNote: "Success isn't always about doing more. Sometimes, it's about recognising how beautifully you handled the day."
    },
    {
        day: 19,
        greeting: "Good Morning 💕",
        question: "Which loving thought would you like to carry today?",
        choices: [
            { emoji: "🌟", text: "I am enough", response: "🌟 'You alone are enough. You have nothing to prove to anybody.' Walk in this truth today." },
            { emoji: "😊", text: "I deserve happiness", response: "😊 'Happiness is not something you postpone for the future; it is something you design for the present.'" },
            { emoji: "💪", text: "I trust myself", response: "💪 'As soon as you trust yourself, you will know how to live.' Your intuition is your guide." },
            { emoji: "🌱", text: "I am growing", response: "🌱 'Life is growth. If we stop growing, technically and spiritually, we are as good as dead.' Celebrate your evolution." }
        ],
        closingNote: "Carry your chosen thought with you today. Return to it whenever you need strength."
    },
    {
        day: 20,
        greeting: "Good Morning ☕",
        question: "What kind of pace does your heart need today?",
        choices: [
            { emoji: "⚡", text: "Energetic", response: "⚡ 'Energy and persistence conquer all things.' Channel your vitality into meaningful action." },
            { emoji: "⚖️", text: "Balanced", response: "⚖️ 'Balance is not something you find, it's something you create.' Design your day mindfully." },
            { emoji: "🌿", text: "Slow & Steady", response: "🌿 'Slow and steady wins the race.' Progress, not perfection, is the goal." },
            { emoji: "😎", text: "Rest & Recharge", response: "😎 'Almost everything will work again if you unplug it for a few minutes, including you.' Rest is productive." }
        ],
        closingNote: "Not every day needs the same pace. Listen to yourself and honour what you need today."
    },
    {
        day: 21,
        greeting: "Good Morning 🍃",
        question: "What are you ready to make a little lighter today?",
        choices: [
            { emoji: "😟", text: "Stress", response: "😟 'It's not the load that breaks you down, it's the way you carry it.' Set down what's too heavy." },
            { emoji: "💭", text: "Overthinking", response: "💭 'Overthinking is the art of creating problems that weren't even there.' Trust and release." },
            { emoji: "😨", text: "Fear", response: "😨 'Everything you want is on the other side of fear.' Take one brave step forward." },
            { emoji: "🎒", text: "Expectations", response: "🎒 'Expectation is the root of all heartache.' Release attachment to outcomes." }
        ],
        closingNote: "You don't have to carry everything today. Put down what feels too heavy, even if only for a while."
    },
    {
        day: 22,
        greeting: "Good Morning ✨",
        question: "What beautiful energy are you inviting into your life today?",
        choices: [
            { emoji: "😊", text: "Joy", response: "😊 'Joy is what happens when we allow ourselves to recognize how good things really are.' Welcome it in." },
            { emoji: "🕊️", text: "Peace", response: "🕊️ 'Nobody can bring you peace but yourself.' Cultivate it from within." },
            { emoji: "💰", text: "Abundance", response: "💰 'Abundance is not something we acquire. It is something we tune into.' Shift your frequency." },
            { emoji: "💪", text: "Confidence", response: "💪 'With confidence, you have won before you have started.' Believe in your capability." }
        ],
        closingNote: "What you consciously welcome into your life begins to receive more of your attention."
    },
    {
        day: 23,
        greeting: "Good Morning 🌞",
        question: "What would help you feel closer to yourself today?",
        choices: [
            { emoji: "🤫", text: "Quiet Time", response: "🤫 'Silence is not the absence of something but the presence of everything.' Find moments of stillness." },
            { emoji: "🙏", text: "Gratitude", response: "🙏 'Gratitude makes sense of our past, brings peace for today, and creates vision for tomorrow.' Count your blessings." },
            { emoji: "💭", text: "Positive Self-Talk", response: "💭 'Talk to yourself like you would to someone you love.' Words shape your reality." },
            { emoji: "🎨", text: "Doing Something I Love", response: "🎨 'Do more of what makes you happy.' Joy is a form of self-care." }
        ],
        closingNote: "In the noise of everyday life, don't forget to spend a few moments with yourself."
    },
    {
        day: 24,
        greeting: "Good Morning ⚖️",
        question: "Where would a little more ease feel wonderful today?",
        choices: [
            { emoji: "💼", text: "Work", response: "💼 'Choose a job you love, and you will never have to work a day in your life.' Bring ease to your efforts." },
            { emoji: "🌿", text: "Health", response: "🌿 'Health is not about the weight you lose, but the life you gain.' Move gently, nourish kindly." },
            { emoji: "🤝", text: "Relationships", response: "🤝 'A healthy relationship doesn't drag you down. It inspires you to be better.' Choose ease and joy." },
            { emoji: "💭", text: "My Mind", response: "💭 'A quiet mind is able to hear intuition over fear.' Soften your thoughts today." }
        ],
        closingNote: "Not everything needs to be forced. Sometimes, life flows better when we allow a little more ease."
    },
    {
        day: 25,
        greeting: "Good Morning 🌱",
        question: "What would you like to appreciate about yourself today?",
        choices: [
            { emoji: "🌱", text: "My Growth", response: "🌱 'Be patient with yourself. Self-growth is tender; it's holy ground.' Honor how far you've come." },
            { emoji: "💪", text: "My Strength", response: "💪 'You are braver than you believe, stronger than you seem, and smarter than you think.' Own your power." },
            { emoji: "👏", text: "My Efforts", response: "👏 'It's not about perfect. It's about effort.' Celebrate every step you take." },
            { emoji: "🛤️", text: "How Far I've Come", response: "🛤️ 'Look how far you've come. You've been through so much and still, you rise.' Be proud." }
        ],
        closingNote: "Before chasing the next goal, take a moment to appreciate the person who brought you this far."
    },
    {
        day: 26,
        greeting: "Good Morning 💡",
        question: "Which thought would make today feel easier?",
        choices: [
            { emoji: "💪", text: "I Can Handle This", response: "💪 'You have been assigned this mountain to show others it can be moved.' You are capable." },
            { emoji: "👣", text: "One Step at a Time", response: "👣 'The journey of a thousand miles begins with one step.' Just take the next one." },
            { emoji: "🌍", text: "I Trust Life", response: "🌍 'Trust the wait. Embrace the uncertainty. Enjoy the beauty of becoming.' Surrender to the flow." },
            { emoji: "🌈", text: "Things Will Work Out", response: "🌈 'Everything always works out in the end. If it hasn't worked out yet, then it's not the end.' Keep faith." }
        ],
        closingNote: "You may not need a different situation today. Sometimes, you simply need a kinder thought."
    },
    {
        day: 27,
        greeting: "Good Morning ❤️",
        question: "What little joy would you love to give yourself today?",
        choices: [
            { emoji: "🍲", text: "Favourite Food", response: "🍲 'One cannot think well, love well, sleep well, if one has not dined well.' Treat yourself!" },
            { emoji: "☕", text: "Me-Time", response: "☕ 'Me-time is not selfish. Me-time is essential.' Claim space just for you." },
            { emoji: "🎵", text: "Music", response: "🎵 'Music is the shorthand of emotion.' Let it lift your spirits today." },
            { emoji: "📞", text: "Talking to Someone I Love", response: "📞 'A real conversation always contains an invitation.' Reach out, connect, share." }
        ],
        closingNote: "Don't wait for happiness to find you. Create one small happy moment for yourself today."
    },
    {
        day: 28,
        greeting: "Good Morning 🌞",
        question: "What energy would you love to share with the world today?",
        choices: [
            { emoji: "✨", text: "Positivity", response: "✨ 'Once you replace negative thoughts with positive ones, you'll start having positive results.' Radiate light." },
            { emoji: "💖", text: "Kindness", response: "💖 'Kindness is a language the deaf can hear and the blind can see.' Speak it fluently today." },
            { emoji: "🕊️", text: "Calm", response: "🕊️ 'Calmness is the cradle of power.' Share your peaceful presence." },
            { emoji: "💪", text: "Confidence", response: "💪 'Confidence is contagious. So is lack of confidence.' Choose to inspire others." }
        ],
        closingNote: "The energy you share with others often finds its way back to you."
    },
    {
        day: 29,
        greeting: "Good Morning 🌻",
        question: "Which inner strength would you like beside you today?",
        choices: [
            { emoji: "🧘", text: "Patience", response: "🧘 'Patience is not about how long you can wait, but how well you behave while waiting.' Practice grace." },
            { emoji: "🦁", text: "Courage", response: "🦁 'Courage doesn't mean you don't get afraid. Courage means you don't let fear stop you.' Be brave today." },
            { emoji: "🎯", text: "Discipline", response: "🎯 'Discipline is the bridge between goals and accomplishment.' Stay committed to yourself." },
            { emoji: "🙏", text: "Trust", response: "🙏 'Trust the process. Your time is coming. Just do the work and the results will handle themselves.'" }
        ],
        closingNote: "You may already have more of this strength within you than you realise."
    },
    {
        day: 30,
        greeting: "Good Morning 🎉",
        question: "After spending 30 mornings together, what are you choosing for yourself today?",
        choices: [
            { emoji: "😊", text: "Happiness", response: "😊 'Happiness is when what you think, what you say, and what you do are in harmony.' You've learned to align with yourself." },
            { emoji: "🕊️", text: "Peace", response: "🕊️ 'Peace is not a destination, it's a way of life.' You've cultivated it within these 30 days." },
            { emoji: "💖", text: "Myself", response: "💖 'You yourself, as much as anybody in the entire universe, deserve your love.' You've chosen yourself for 30 days. Keep going." },
            { emoji: "✨", text: "Miracles", response: "✨ 'Miracles happen every day. Change your perception and you'll see them everywhere.' You are the miracle." }
        ],
        closingNote: "For the last 30 days, you have checked in with yourself every morning. Today, remember this: the most important conversation you have each day is the one you have with yourself. ❤️\n\nYour affirmation for today 💛 - Congratulations on completing this journey! You are ready to continue this practice on your own. Keep choosing yourself, every single day."
    }
];

module.exports = morningJourney;
