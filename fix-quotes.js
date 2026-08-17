const fs = require('fs');
let html = fs.readFileSync('finalscp.html', 'utf8');

// Fix unquoted lines in avatarRotationConfig
html = html.replace(/quote:\s*Place your hand on your heart and say, "Thank you for carrying me through today\." ❤️/g, 'quote: `"Place your hand on your heart and say, \\"Thank you for carrying me through today.\\" ❤️"`');
html = html.replace(/quote:\s*Repeat gently: "I'm Sorry\. Please Forgive Me\. Thank You\. I Love You\." 🕯️/g, 'quote: `"Repeat gently: \\"I\'m Sorry. Please Forgive Me. Thank You. I Love You.\\" 🕯️"`');

fs.writeFileSync('finalscp.html', html, 'utf8');
console.log('✅ Fixed unquoted string values in avatarRotationConfig!');
