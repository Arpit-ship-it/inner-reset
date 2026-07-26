const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const whatsappClient = new Client({
    authStrategy: new LocalAuth({
        dataPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true, // Production mode: runs without visible browser
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-software-rasterizer',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Critical for VPS stability
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ],
        executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome-stable',
        protocolTimeout: 0 // ✅ CRITICAL: Prevents timeout errors in production
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
});

whatsappClient.on('qr', (qr) => {
    console.log('📱 ============================================');
    console.log('📱 SCAN THIS QR CODE WITH YOUR WHATSAPP APP');
    console.log('📱 ============================================');
    qrcode.generate(qr, { small: true });
    console.log('\n⚠️  QR Code expires in 60 seconds. Scan quickly!');
    console.log('📱 Open WhatsApp on your phone > Settings > Linked Devices > Link a Device\n');
});

whatsappClient.on('ready', () => {
    console.log('✅ ============================================');
    console.log('✅ WhatsApp Client is READY in Production!');
    console.log('✅ Phone:', whatsappClient.info?.pushname || 'Connected');
    console.log('✅ Number:', whatsappClient.info?.wid?.user || 'Authenticated');
    console.log('✅ ============================================');
});

whatsappClient.on('authenticated', () => {
    console.log('✅ WhatsApp authentication successful');
});

whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ ============================================');
    console.error('❌ WhatsApp Authentication FAILED:', msg);
    console.error('❌ Please delete .wwebjs_auth folder and rescan QR');
    console.error('❌ ============================================');
});

whatsappClient.on('disconnected', (reason) => {
    console.error('❌ WhatsApp disconnected:', reason);
    console.log('🔄 Auto-reconnect will be attempted...');
});

whatsappClient.on('loading_screen', (percent, message) => {
    console.log('⏳ WhatsApp loading:', percent, message);
});

// Graceful shutdown handler
process.on('SIGINT', async () => {
    console.log('🛑 Shutting down WhatsApp client gracefully...');
    await whatsappClient.destroy();
    process.exit(0);
});

module.exports = whatsappClient;
