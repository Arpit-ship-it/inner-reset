const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
const waModule = process.env.NODE_ENV === 'production'
    ? require('./config/whatsapp.production')
    : require('./config/whatsapp');
const { whatsappClient, sendWAMessage } = waModule;

const initializeChatbot = require('./utils/chatbot');
require('./utils/scheduler');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const chatRoutes = require('./routes/chat');

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 [Unhandled Rejection at Promise]:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('🚨 [Uncaught Exception]:', err.message || err);
});

const app = express();

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

app.use(express.static('frontend'));
app.use(express.static('.'));

app.use('/api/auth', authRoutes);

app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const waModule = process.env.NODE_ENV === 'production'
            ? require('./config/whatsapp.production')
            : require('./config/whatsapp');
        const isReady = waModule.isClientReady ? waModule.isClientReady() : false;
        const client = waModule.whatsappClient;
        
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: 'Connected',
            whatsapp: isReady ? 'Connected' : 'Disconnected',
            whatsappNumber: client?.info?.wid?.user || 'Not authenticated'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: error.message
        });
    }
});

// Browser QR Endpoint
app.get('/qr', (req, res) => {
    const waModule = process.env.NODE_ENV === 'production'
        ? require('./config/whatsapp.production')
        : require('./config/whatsapp');
    const qrString = waModule.getLatestQR ? waModule.getLatestQR() : null;
    const ready = waModule.isClientReady ? waModule.isClientReady() : false;

    if (ready) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>WhatsApp Connected!</title><meta http-equiv="refresh" content="10"></head>
            <body style="font-family:sans-serif; text-align:center; background:#f0fdf4; padding:50px;">
                <h1 style="color:#166534;">✅ WhatsApp Client is Ready & Authenticated!</h1>
                <p style="color:#15803d; font-size:18px;">Your AI Chatbot is live and active on WhatsApp.</p>
                <div style="margin-top: 30px;">
                    <a href="/reset-session" style="background:#dc2626; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block;">
                        🚨 Disconnect & Re-Scan QR Code
                    </a>
                </div>
            </body>
            </html>
        `);
    }

    if (!qrString) {
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>WhatsApp QR Generating...</title><meta http-equiv="refresh" content="3"></head>
            <body style="font-family:sans-serif; text-align:center; background:#fefce8; padding:50px;">
                <h2 style="color:#a16207;">⏳ Generating fresh WhatsApp QR code...</h2>
                <p style="color:#854d0e;">This page will auto-refresh in 3 seconds...</p>
            </body>
            </html>
        `);
    }

    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(qrString)}`;

    return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Scan WhatsApp QR Code</title>
            <meta http-equiv="refresh" content="15">
            <style>
                body { font-family: sans-serif; text-align: center; background: #0f172a; color: white; padding: 30px; }
                .card { background: #1e293b; display: inline-block; padding: 30px; border-radius: 20px; }
                img { border-radius: 12px; padding: 10px; background: white; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>📱 Scan WhatsApp QR Code</h2>
                <img src="${qrImageUrl}" alt="WhatsApp QR Code" />
            </div>
        </body>
        </html>
    `);
});

// Reset Session Endpoint
app.get('/reset-session', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const waModule = process.env.NODE_ENV === 'production'
            ? require('./config/whatsapp.production')
            : require('./config/whatsapp');
        const client = waModule.whatsappClient;

        if (waModule.resetSessionFlags) waModule.resetSessionFlags();
        try { if (client && client.destroy) await client.destroy(); } catch (e) {}

        const authDir = path.resolve(__dirname, '.wwebjs_auth');
        if (fs.existsSync(authDir)) fs.rmSync(authDir, { recursive: true, force: true });

        setTimeout(() => {
            if (client && client.initialize) client.initialize().catch(e => {});
        }, 1000);

        return res.send(`<h2>✅ WhatsApp Session Reset! Redirecting to /qr...</h2><script>setTimeout(()=>location.href='/qr', 3000)</script>`);
    } catch (err) {
        return res.status(500).send('Error: ' + err.message);
    }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();
        await sequelize.sync({ alter: false });
        console.log('✅ Database connected and synced');

        if (whatsappClient && typeof whatsappClient.initialize === 'function') {
            whatsappClient.initialize().catch(err => {
                console.warn('⚠️ WhatsApp client initialization warning:', err.message);
            });
            initializeChatbot(whatsappClient);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err);
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} (without DB sync)`);
        });
    }
}

startServer();
