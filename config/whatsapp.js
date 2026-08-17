const { Client, RemoteAuth, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');

let isClientReady = false;
let isAuthenticated = false;
let latestQR = null;

// Determine Chrome/Chromium Executable Path for Linux/Railway
const getExecutablePath = () => {
    if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
    if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
    return undefined; // Puppeteer will use default bundled Chromium if not set
};

// Configure Puppeteer options for production cloud stability and full JS execution speed
const puppeteerConfig = {
    headless: true,
    handleSIGINT: false,
    executablePath: getExecutablePath(),
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--mute-audio'
    ]
};

// Configure Auth Strategy: RemoteAuth via MongoDB if MONGODB_URI is provided, otherwise fallback to LocalAuth
let authStrategy;
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;

if (mongoUri) {
    console.log('🍃 [WhatsApp Session] MONGODB_URI detected. Initializing RemoteAuth with wwebjs-mongo...');
    try {
        const { MongoStore } = require('wwebjs-mongo');
        
        if (mongoose.connection.readyState === 0) {
            mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
                .then(() => console.log('✅ [MongoDB] Connected successfully for RemoteAuth session storage.'))
                .catch(err => console.error('❌ [MongoDB Error]:', err.message));
        }

        const store = new MongoStore({ mongoose: mongoose });
        authStrategy = new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000 // Backup session every 5 minutes
        });
    } catch (err) {
        console.warn('⚠️ [RemoteAuth Fallback] Failed initializing wwebjs-mongo, falling back to LocalAuth:', err.message);
        authStrategy = new LocalAuth({
            dataPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth'
        });
    }
} else {
    console.log('📁 [WhatsApp Session] No MONGODB_URI provided. Operating with LocalAuth session storage...');
    authStrategy = new LocalAuth({
        dataPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth'
    });
}

const whatsappClient = new Client({
    authStrategy: authStrategy,
    puppeteer: puppeteerConfig,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
});

let isSyncing = false;

// Event Listeners
whatsappClient.on('qr', (qr) => {
    latestQR = qr;
    isClientReady = false;
    isAuthenticated = false;
    isSyncing = false;
    console.log('📢 [WhatsApp QR] New QR code generated!');
    qrcode.generate(qr, { small: true });
});

whatsappClient.on('authenticated', () => {
    isAuthenticated = true;
    latestQR = null;
    console.log('🔐 [WhatsApp Auth] Authentication successful! Syncing chats...');
});

whatsappClient.on('remote_session_saved', () => {
    console.log('☁️ [WhatsApp RemoteAuth] Session backed up to MongoDB successfully!');
});

whatsappClient.on('loading_screen', (percent, message) => {
    isSyncing = true;
    console.log(`⏳ [WhatsApp Syncing] ${percent}% - ${message}`);
});

whatsappClient.on('ready', () => {
    isClientReady = true;
    isAuthenticated = true;
    isSyncing = false;
    latestQR = null;
    console.log('🚀 [WhatsApp Ready] Client fully connected in Production! Messages can now be sent.');

    // Periodic Zombie Tab Cleanup (RAM Leak Prevention)
    setInterval(async () => {
        try {
            if (whatsappClient && whatsappClient.pupBrowser) {
                const pages = await whatsappClient.pupBrowser.pages();
                if (pages.length > 2) {
                    for (let i = 1; i < pages.length - 1; i++) {
                        if (!pages[i].isClosed() && pages[i] !== whatsappClient.pupPage) {
                            await pages[i].close().catch(() => {});
                        }
                    }
                }
            }
        } catch (e) {}
    }, 60000);
});

whatsappClient.on('auth_failure', (msg) => {
    isClientReady = false;
    isAuthenticated = false;
    isSyncing = false;
    latestQR = null;
    console.error('❌ [WhatsApp Auth Failed]:', msg);
});

whatsappClient.on('disconnected', async (reason) => {
    isClientReady = false;
    isAuthenticated = false;
    isSyncing = false;
    latestQR = null;
    console.warn('⚠️ [WhatsApp Disconnected]:', reason);
    console.log('🔁 [WhatsApp Reconnect] Destroying stale instance and re-initializing in 5s...');
    try {
        await whatsappClient.destroy();
    } catch (e) {}
    
    setTimeout(() => {
        whatsappClient.initialize().catch(e => console.error('❌ [WhatsApp Reconnect Failed]:', e.message || e));
    }, 5000);
});

whatsappClient.on('error', (err) => {
    const errMsg = err && err.message ? err.message : String(err);
    console.error('🚨 [WhatsApp Client Error]:', errMsg);
});

// In-memory transmission lock map to prevent duplicate concurrent sending loops
const activeTransmissions = new Set();

// ⏱️ 10-Second Cloud Transmission Timeout for Primary Attempt
const sendMessageWithTimeout = (targetId, message, timeoutMs = 10000) => {
    return Promise.race([
        whatsappClient.sendMessage(targetId, message),
        new Promise((_, reject) => setTimeout(() => reject(new Error('WA_TRANSMISSION_TIMEOUT_10S')), timeoutMs))
    ]);
};

// Alternative Direct DOM Send via WWebJS Injected Helper
const directStoreSend = async (targetId, messageText) => {
    if (!whatsappClient || !whatsappClient.pupPage || typeof whatsappClient.pupPage.isClosed !== 'function' || whatsappClient.pupPage.isClosed()) {
        console.warn('⚠️ [Direct Store Send] Puppeteer page is not available or closed.');
        return false;
    }
    try {
        console.log(`🔄 [Direct Store Send] Attempting DOM helper injection for targetId: ${targetId}...`);
        const result = await whatsappClient.pupPage.evaluate(async (chatId, text) => {
            try {
                if (window.WWebJS && typeof window.WWebJS.sendMessage === 'function') {
                    await window.WWebJS.sendMessage(chatId, text, {});
                    return true;
                }
                if (window.Store) {
                    let chat = window.Store.Chat ? (window.Store.Chat.get(chatId) || await window.Store.Chat.find(chatId)) : null;
                    if (window.Store.SendTextMsgToChat && chat) {
                        await window.Store.SendTextMsgToChat(chat, text);
                        return true;
                    }
                    if (window.Store.SendMessage && window.Store.SendMessage.sendMessage && chat) {
                        await window.Store.SendMessage.sendMessage(chat, text);
                        return true;
                    }
                }
            } catch (e) {
                return { error: e.message };
            }
            return false;
        }, targetId, messageText);

        if (result === true) {
            console.log(`✅ [Direct Store Send] Delivered successfully to ${targetId}`);
            return true;
        } else {
            console.warn(`⚠️ [Direct Store Send] Evaluation returned:`, result);
            return false;
        }
    } catch (err) {
        console.warn('⚠️ [Direct Store Send Fallback Error]:', err.message || err);
        return false;
    }
};

// Helper: Wait for WhatsApp sync/loading to complete before sending message
const waitForPageReady = async (maxWaitMs = 6000) => {
    if (!isSyncing && isClientReady) return true;
    console.log('⏳ [sendWAMessage Sync Wait] WhatsApp is currently syncing/loading. Waiting for DOM to settle...');
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
        if (!isSyncing && isClientReady) return true;
        await new Promise(res => setTimeout(res, 500));
    }
    return isClientReady;
};

const sendWAMessage = async (number, message) => {
    console.log(`📥 [Entering sendWAMessage] Target number received: ${number}`);
    let lockKey = null;

    try {
        // 1. Explicit Number Formatting
        let clean = String(number || '').replace(/[^\d]/g, '');
        if (clean.length === 10) {
            clean = `91${clean}`;
        } else if (clean.length > 10 && clean.startsWith('0')) {
            clean = `91${clean.slice(1)}`;
        }
        const standardId = (clean.endsWith('@c.us') || clean.endsWith('@lid')) ? clean : `${clean}@c.us`;
        console.log(`🔍 [sendWAMessage] Formatted target JID: ${standardId}`);

        // 2. Lock Check
        lockKey = `${standardId}_${message.slice(0, 15)}`;
        if (activeTransmissions.has(lockKey)) {
            console.warn(`⚠️ [sendWAMessage Debounce] Transmission lock active for ${standardId}. Skipping.`);
            return false;
        }

        activeTransmissions.add(lockKey);
        setTimeout(() => {
            if (lockKey) activeTransmissions.delete(lockKey);
        }, 10000);

        // 3. Sync & Readiness Wait
        if (isSyncing) {
            await waitForPageReady(6000);
        }

        // Browser & Page state checks
        const isPupPageAlive = whatsappClient && whatsappClient.pupPage && typeof whatsappClient.pupPage.isClosed === 'function' && !whatsappClient.pupPage.isClosed();
        const hasClientInfo = whatsappClient && whatsappClient.info && whatsappClient.info.wid;

        console.log(`📊 [sendWAMessage State] isReady:${isClientReady} isAuth:${isAuthenticated} hasInfo:${!!hasClientInfo} pageAlive:${isPupPageAlive}`);

        if (hasClientInfo && !isSyncing) {
            isClientReady = true;
            isAuthenticated = true;
        }

        if (!isPupPageAlive && !hasClientInfo) {
            console.error('🚨 [sendWAMessage] Puppeteer browser page is closed/detached!');
            try { whatsappClient.initialize().catch(e => {}); } catch(e){}
            return false;
        }

        if (!isClientReady && !isAuthenticated && !hasClientInfo) {
            console.error('🚨 [WA Transmission Blocked] WhatsApp Web client is NOT authenticated yet! Please visit /qr to scan the QR code.');
            return false;
        }

        // 4. Resolve Verified Number ID via getNumberId (8s timeout for cloud reliability)
        let targetId = standardId;
        try {
            const p1 = whatsappClient.getNumberId(clean);
            const t1 = new Promise((res) => setTimeout(() => res(null), 8000));
            const numberId = await Promise.race([p1, t1]);
            if (numberId && numberId._serialized) {
                targetId = numberId._serialized;
                console.log(`🎯 [WA Verified JID] Resolved ${clean} -> ${targetId}`);
            } else {
                console.warn(`⚠️ [WA getNumberId Check] Number ${clean} not resolved by getNumberId. Falling back to ${standardId}`);
            }
        } catch (idErr) {
            console.warn(`⚠️ [WA getNumberId Check Error]:`, idErr.message || idErr);
        }

        let sentSuccess = false;

        // 5. Attempt 1: Primary client.sendMessage with 30s timeout to allow new chat resolution
        try {
            console.log(`🚀 [sendWAMessage Attempt 1] Invoking client.sendMessage for ${targetId}...`);
            await sendMessageWithTimeout(targetId, message, 30000);
            console.log(`✅ [sendWAMessage Success via client.sendMessage] Message delivered to ${targetId}`);
            sentSuccess = true;
            isClientReady = true;
            isAuthenticated = true;
        } catch (clientErr) {
            const errStr = clientErr.message || String(clientErr);
            console.warn(`⚠️ [sendWAMessage Attempt 1 Error] ${targetId}: ${errStr}`);
            
            // Retry Attempt 1 if page was navigating during execution
            if (errStr.includes('context was destroyed') || errStr.includes('navigation')) {
                console.log('🔄 [Navigation Retry] Execution context was destroyed during page load. Retrying in 2 seconds...');
                await new Promise(r => setTimeout(r, 2000));
                try {
                    await sendMessageWithTimeout(targetId, message, 20000);
                    console.log(`✅ [sendWAMessage Navigation Retry Success] Delivered to ${targetId}`);
                    sentSuccess = true;
                } catch (retryErr) {
                    console.warn(`⚠️ [Navigation Retry Failed]:`, retryErr.message || retryErr);
                }
            }
        }

        // 6. Attempt 2: Direct Chat Instance Resolution & Send with 15s timeout
        if (!sentSuccess) {
            try {
                console.log(`💬 [sendWAMessage Attempt 2] Resolving chat instance for ${targetId}...`);
                const chatPromise = whatsappClient.getChatById(targetId);
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('CHAT_RESOLVE_TIMEOUT_15S')), 15000));
                const chat = await Promise.race([chatPromise, timeoutPromise]);

                if (chat) {
                    console.log(`🚀 [sendWAMessage Attempt 2] Transmitting via chat.sendMessage to ${targetId}...`);
                    await chat.sendMessage(message);
                    console.log(`✅ [sendWAMessage Success via chat.sendMessage] Message delivered to ${targetId}`);
                    sentSuccess = true;
                    isClientReady = true;
                    isAuthenticated = true;
                }
            } catch (chatErr) {
                console.warn(`⚠️ [sendWAMessage Attempt 2 Error] ${targetId}: ${chatErr.message || chatErr}`);
            }
        }

        // 7. Attempt 3: Direct DOM Helper Fallback
        if (!sentSuccess) {
            try {
                console.log(`🔄 [sendWAMessage Attempt 3] Direct DOM helper dispatch for ${targetId}...`);
                const storeSent = await directStoreSend(targetId, message);
                if (storeSent) {
                    console.log(`✅ [sendWAMessage DOM Helper Success] Delivered to ${targetId}`);
                    sentSuccess = true;
                    isClientReady = true;
                }
            } catch (storeErr) {
                console.error(`❌ [sendWAMessage Attempt 3 Error] ${targetId}:`, storeErr.message || storeErr);
            }
        }

        console.log(`🏁 [Exiting sendWAMessage] Final transmission result for ${targetId}: ${sentSuccess}`);
        return sentSuccess;
    } catch (fatalErr) {
        console.error(`🚨 [sendWAMessage Top-Level Fatal Error]:`, fatalErr.message || fatalErr);
        return false;
    } finally {
        if (lockKey) {
            activeTransmissions.delete(lockKey);
        }
    }
};

module.exports = {
    whatsappClient,
    isClientReady: () => isClientReady || (whatsappClient && !!(whatsappClient.info && whatsappClient.info.wid)),
    isAuthenticated: () => isAuthenticated || (whatsappClient && !!(whatsappClient.info && whatsappClient.info.wid)),
    getLatestQR: () => latestQR,
    sendWAMessage,
    resetSessionFlags: () => {
        isClientReady = false;
        isAuthenticated = false;
        latestQR = null;
        if (whatsappClient && whatsappClient.info) {
            delete whatsappClient.info;
        }
    }
};
