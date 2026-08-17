const https = require('https');

function getHtml(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function testNetlifyLiveHtml() {
    console.log('🔍 Checking Live Netlify HTML structure for shaifalysangal.com...\n');
    const html = await getHtml('https://shaifalysangal.com');

    console.log('Length of HTML:', html.length);
    console.log('Contains registrationModal:', html.includes('id="registrationModal"'));
    console.log('Contains openRegistrationModal:', html.includes('openRegistrationModal'));
    
    // Extract button elements
    const buttonMatches = html.match(/<button[^>]*>([\s\S]*?)<\/button>/gi) || [];
    console.log('\nButtons found in HTML:');
    buttonMatches.forEach((btn, i) => {
        console.log(`[${i}] ${btn}`);
    });
}

testNetlifyLiveHtml();
