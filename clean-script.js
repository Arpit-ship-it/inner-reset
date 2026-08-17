const fs = require('fs');
let html = fs.readFileSync('finalscp.html', 'utf8');
html = html.replace(/<script>([\s\S]*?)<\/script>/gi, (match) => {
    return match
        .split('’').join("'")
        .split('‘').join("'")
        .split('“').join('"')
        .split('”').join('"');
});
fs.writeFileSync('finalscp.html', html, 'utf8');
console.log('✅ Cleaned smart quotes from finalscp.html!');
