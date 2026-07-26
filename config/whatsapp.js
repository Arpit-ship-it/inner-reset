const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ✅ Global flag — sendMessage tabhi call hoga jab client poori tarah ready ho
let isClientReady = false;

const whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        handleSIGINT: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--disable-extensions'
        ]
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
});

// 📢 QR Code Event
whatsappClient.on('qr', (qr) => {
    console.log('📢 [WhatsApp QR] Naya QR code generate hua — terminal se scan karo!');
    qrcode.generate(qr, { small: true });
});

// ✅ Client Ready — flag true karo
whatsappClient.on('ready', () => {
    isClientReady = true;
    console.log('🚀 [WhatsApp Ready] Client fully connected! Messages ab send ho sakte hain.');
});

// ❌ Auth Failure
whatsappClient.on('auth_failure', (msg) => {
    isClientReady = false;
    console.error('❌ [WhatsApp Auth Failed] Authentication fail ho gayi:', msg);
});

// 🔌 Disconnect — flag reset + auto-reconnect
whatsappClient.on('disconnected', (reason) => {
    isClientReady = false;
    console.warn('⚠️ [WhatsApp Disconnected] Reason:', reason);
    console.log('🔁 [WhatsApp Reconnect] 5 seconds mein dobara initialize ho raha hai...');
    setTimeout(() => {
        whatsappClient.initialize().catch(e => {
            console.error('❌ [WhatsApp Reconnect Failed]:', e.message || e);
        });
    }, 5000);
});

// 🚨 Error Event
whatsappClient.on('error', (err) => {
    const errMsg = err && err.message ? err.message : String(err);
    console.error('🚨 [WhatsApp Client Error] Page or browser crashed:', errMsg);
    
    const isFatal = errMsg.includes('detached') || errMsg.includes('Protocol error') || errMsg.includes('closed');
    if (isFatal) {
        console.error('🚨 [WhatsApp Critical] Fatal browser event error! Restarting process in 2 seconds...');
        setTimeout(() => {
            process.exit(1);
        }, 2000);
    }
});

/**
 * Number string ko WhatsApp ID format mein convert karo
 * Handles:
 *  - Already formatted: 1234@c.us, 1234@lid  → as-is
 *  - LID numbers (15+ digits starting with non-91): @lid suffix
 *  - Normal Indian 10-digit: 91XXXXXXXXXX@c.us
 *  - Already 91-prefixed 12-digit: as-is @c.us
 */
const resolveWhatsAppId = (number) => {
    // Already has @ suffix — use as-is
    if (typeof number === 'string' && number.includes('@')) {
        return number;
    }

    let clean = String(number).replace(/[^\d]/g, '');

    // LID detection: 14+ digits (WhatsApp internal LID format)
    // LIDs typically start with large numbers and are 14+ digits long
    if (clean.length >= 14) {
        return `${clean}@lid`;
    }

    // Normal Indian number: pad to 91XXXXXXXXXX
    if (clean.length === 10) {
        clean = `91${clean}`;
    }

    return `${clean}@c.us`;
};

/**
 * ✅ SAFE MESSAGE SENDER WRAPPER
 * - Client ready check built-in
 * - Direct sendMessage (getChatById avoid kiya — unnecessary overhead)
 * - whatsapp-web.js non-standard error objects properly handle kiye
 * @param {string} number - WhatsApp number ya formatted ID
 * @param {string} message - Message text
 * @returns {Promise<boolean>} - true on success, false on failure
 */
const sendWAMessage = async (number, message) => {
    if (!isClientReady) {
        console.warn(`⚠️ [WA Skipped] Client not ready — message not sent to: ${number}`);
        return false;
    }

    const targetId = resolveWhatsAppId(number);

    try {
        await whatsappClient.sendMessage(targetId, message);
        console.log(`✅ [WA Message Sent] Delivered to: ${targetId}`);
        return true;
    } catch (err) {
        const errMsg = (err && err.message) ? err.message : String(err);
        console.error(`❌ [WA Message Failed] Target: ${targetId} | Error: ${errMsg}`);

        // Detect Puppeteer browser context detachment and restart the process so PM2 can recover
        const isFatalPuppeteerError = 
            errMsg.includes('detached Frame') || 
            errMsg.includes('Protocol error') || 
            errMsg.includes('Target closed') || 
            errMsg.includes('Session closed') || 
            errMsg.includes('Browser has been closed');

        if (isFatalPuppeteerError) {
            console.error('🚨 [WhatsApp Critical] Fatal Puppeteer context error detected! Triggering self-recovery restart in 2 seconds...');
            setTimeout(() => {
                process.exit(1); // Exits the process, letting PM2 or nodemon reboot it cleanly
            }, 2000);
        }

        return false;
    }
};

module.exports = { whatsappClient, isClientReady: () => isClientReady, sendWAMessage };
