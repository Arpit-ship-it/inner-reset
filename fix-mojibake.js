const fs = require('fs');
const path = require('path');

const targetFiles = [
    path.join(__dirname, 'finalscp.html'),
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'frontend/index.html')
];

const replacements = [
    // Header & separators
    { from: /Life Coach [^<>\n]*? Healer [^<>\n]*? POSH/g, to: 'Life Coach • Healer • POSH' },
    { from: /┬À/g, to: '•' },
    { from: /¬Å/g, to: '•' },
    { from: /┬/g, to: '•' },

    // Avatar quotes corrupted emoji sequences
    { from: /"Take one slow, deep breath. Your nervous system thanks you every time you pause."\s*[\S\s]*?` \}/g, to: `"Take one slow, deep breath. Your nervous system thanks you every time you pause." ☁️\` }` },
    { from: /"Inhale calm. Exhale everything you no longer need."\s*[\S\s]*?` \}/g, to: `"Inhale calm. Exhale everything you no longer need." 🧘‍♀️\` }` },
    { from: /"Before reacting, take three conscious breaths. Clarity follows calm."\s*[\S\s]*?` \}/g, to: `"Before reacting, take three conscious breaths. Clarity follows calm." 🌅\` }` },
    { from: /Place your hand on your heart and say, "Thank you for carrying me through today."\s*[\S\s]*?` \}/g, to: `Place your hand on your heart and say, "Thank you for carrying me through today." ❤️\` }` },
    { from: /"Your body listens to every word you speak. Choose kindness."\s*[\S\s]*?` \}/g, to: `"Your body listens to every word you speak. Choose kindness." ✨\` }` },
    { from: /"Relax your shoulders. You're carrying less than your mind believes."\s*[\S\s]*?` \}/g, to: `"Relax your shoulders. You're carrying less than your mind believes." 🌿\` }` },
    { from: /"Notice one beautiful thing around you. Gratitude begins with awareness."\s*[\S\s]*?` \}/g, to: `"Notice one beautiful thing around you. Gratitude begins with awareness." 🍁\` }` },
    { from: /"One grateful thought can transform an entire day."\s*[\S\s]*?` \}/g, to: `"One grateful thought can transform an entire day." 🦋\` }` },
    { from: /"Pause. Appreciate this moment before rushing to the next."\s*[\S\s]*?` \}/g, to: `"Pause. Appreciate this moment before rushing to the next." ☕\` }` },
    { from: /"Speak to yourself with the same kindness you offer others."\s*[\S\s]*?` \}/g, to: `"Speak to yourself with the same kindness you offer others." 🪷\` }` },
    { from: /"You deserve your own compassion today."\s*[\S\s]*?` \}/g, to: `"You deserve your own compassion today." 🌊\` }` },
    { from: /"Progress matters more than perfection."\s*[\S\s]*?` \}/g, to: `"Progress matters more than perfection." 🚶‍♀️\` }` },
    { from: /"Every emotion has something to teach. Listen before you judge."\s*[\S\s]*?` \}/g, to: `"Every emotion has something to teach. Listen before you judge." 🌳\` }` },
    { from: /"Not every thought deserves your attention."\s*[\S\s]*?` \}/g, to: `"Not every thought deserves your attention." 🌧️\` }` },
    { from: /"Difficult moments don't last forever. Neither do difficult emotions."\s*[\S\s]*?` \}/g, to: `"Difficult moments don't last forever. Neither do difficult emotions." 🌙\` }` },
    { from: /Repeat gently: "I'm Sorry. Please Forgive Me. Thank You. I Love You."\s*[\S\s]*?` \}/g, to: `Repeat gently: "I'm Sorry. Please Forgive Me. Thank You. I Love You." 🕊️\` }` },
    { from: /"Forgiveness is one of the gentlest forms of healing."\s*[\S\s]*?` \}/g, to: `"Forgiveness is one of the gentlest forms of healing." 💖\` }` },
    { from: /"Your mind rests when your attention returns to the present."\s*[\S\s]*?` \}/g, to: `"Your mind rests when your attention returns to the present." 🧘‍♂️\` }` },
    { from: /"Take the next step. You don't need the entire staircase today."\s*[\S\s]*?` \}/g, to: `"Take the next step. You don't need the entire staircase today." 🚀\` }` },
    { from: /"Every small step creates meaningful change."\s*[\S\s]*?` \}/g, to: `"Every small step creates meaningful change." 🪜\` }` },
    { from: /"Growth often feels uncomfortable before it feels beautiful."\s*[\S\s]*?` \}/g, to: `"Growth often feels uncomfortable before it feels beautiful." 🦋\` }` },
    { from: /"Before sleeping, thank yourself for making it through today."\s*[\S\s]*?` \}/g, to: `"Before sleeping, thank yourself for making it through today." ✨\` }` },
    { from: /"Let your breath carry today's stress away."\s*[\S\s]*?` \}/g, to: `"Let your breath carry today's stress away." 🌊\` }` },
    { from: /"Release what you cannot control. Tomorrow brings new possibilities."\s*[\S\s]*?` \}/g, to: `"Release what you cannot control. Tomorrow brings new possibilities." 🌈\` }` },

    // General corrupted emoji tags in HTML comments & text
    { from: /­ƒîà/g, to: '🌅' },
    { from: /­ƒîñ´©Å/g, to: '🌇' },
    { from: /­ƒîÖ/g, to: '🌆' },
    { from: /­ƒô▒/g, to: '📱' },
    { from: /­ƒôè/g, to: '📊' },
    { from: /­ƒñØ/g, to: '🤝' },
    { from: /­ƒÆ░/g, to: '💰' },
    { from: /­ƒÄ»/g, to: '🎯' },
    { from: /­ƒñ░/g, to: '🤰' },
    { from: /­ƒºÿ/g, to: '🧘' },
    { from: /­ƒøì´©Å/g, to: '🛋️' },
    { from: /­ƒÜÇ/g, to: '🚀' },
    { from: /­ƒÜ¿/g, to: '🚨' },
    { from: /Ô£¿/g, to: '✨' },
    { from: /Ôÿò/g, to: '☕' },
    { from: /ÔÜí/g, to: '⚡' },
    { from: /ÔÜÖ´©Å/g, to: '⚙️' },
    { from: /­ƒî▒/g, to: '🌿' },
    { from: /­ƒî×/g, to: '🌸' },
    { from: /­ƒÆø/g, to: '💖' },
    { from: /­ƒîÀ/g, to: '☀️' },
    { from: /­ƒºá/g, to: '🧠' },
    { from: /­ƒôØ/g, to: '📝' },
    { from: /­ƒöä/g, to: '🎛️' },
    { from: /­ƒîÉ/g, to: '🌐' },
    { from: /­ƒöÑ/g, to: '🔥' },
    { from: /Ô£¿/g, to: '✨' },

    // Fix backend URL string escapes
    { from: /fetch\(\\`\\\${BACKEND_URL}/g, to: 'fetch(`${BACKEND_URL}' },
    { from: /\\`\\\${BACKEND_URL}/g, to: '`${BACKEND_URL}' }
];

targetFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });

    const closeIndex = content.lastIndexOf('</html>');
    if (closeIndex !== -1) {
        content = content.substring(0, closeIndex + 7) + '\n';
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Cleaned emojis & Mojibake in: ${path.basename(file)}`);
});
