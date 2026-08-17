const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');

const waModule = process.env.NODE_ENV === 'production' 
    ? require('./config/whatsapp.production')
    : require('./config/whatsapp');
const whatsappClient = waModule.whatsappClient || waModule;

// Start background scheduler automation
require('./utils/scheduler');

const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const chatRoutes = require('./routes/chat');
const initializeChatbot = require('./utils/chatbot');

const app = express();

// ========================================
// SECURITY MIDDLEWARE
// ========================================

// Helmet: Security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable if using CDN
    crossOriginEmbedderPolicy: false
}));

// CORS Configuration
app.use(cors({ origin: '*', credentials: false }));

// Rate Limiting: Prevent brute force attacks
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per IP per 15 minutes
    message: {
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static('frontend'));

// ========================================
// REQUEST LOGGING (Production)
// ========================================
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}

// ========================================
// ROUTES
// ========================================
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        const whatsappStatus = whatsappClient.info ? 'Connected' : 'Disconnected';
        
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            database: 'Connected',
            whatsapp: whatsappStatus,
            whatsappNumber: whatsappClient.info?.wid?.user || 'Not authenticated'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: error.message
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Affirmation App API is running! ✨',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        endpoints: {
            health: '/health',
            api: '/api/auth'
        }
    });
});

// 📱 High-Res Browser QR Code Endpoint for Easy WhatsApp Scanning
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
                    <a href="/reset-session" style="background:#dc2626; color:white; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:bold; display:inline-block; box-shadow:0 4px 12px rgba(220,38,38,0.3);">
                        🚨 Disconnect & Re-Scan QR Code for New Phone Number
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
                <div style="margin-top: 20px;">
                    <a href="/reset-session" style="background:#dc2626; color:white; padding:10px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">
                        Force Full Cache Wipe & Reset
                    </a>
                </div>
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
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: sans-serif; text-align: center; background: #0f172a; color: white; padding: 30px; }
                .card { background: #1e293b; display: inline-block; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                img { border-radius: 12px; padding: 10px; background: white; }
                .badge { background: #22c55e; color: white; padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>📱 Scan WhatsApp QR Code</h2>
                <p style="color:#94a3b8; font-size:14px;">Open WhatsApp on phone > Settings > Linked Devices > Link a Device</p>
                <img src="${qrImageUrl}" alt="WhatsApp QR Code" />
                <p style="margin-top:15px;"><span class="badge">Auto-Refreshes Every 15 Seconds</span></p>
                <p><a href="/reset-session" style="color:#f87171; text-decoration:underline;">Click here to reset session & generate new QR</a></p>
            </div>
        </body>
        </html>
    `);
});

// 🔄 Reset WhatsApp Session Endpoint
app.get('/reset-session', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const waModule = process.env.NODE_ENV === 'production' 
            ? require('./config/whatsapp.production') 
            : require('./config/whatsapp');
        const client = waModule.whatsappClient || waModule;

        if (waModule.resetSessionFlags) {
            waModule.resetSessionFlags();
        }

        try { if (client && client.destroy) await client.destroy(); } catch (e) {}

        const authDir = path.resolve(__dirname, '.wwebjs_auth');
        if (fs.existsSync(authDir)) {
            fs.rmSync(authDir, { recursive: true, force: true });
        }

        setTimeout(() => {
            if (client && client.initialize) {
                client.initialize().catch(e => console.error("Re-init error:", e));
            }
        }, 1000);

        return res.send(`
            <!DOCTYPE html>
            <html>
            <head><title>Session Reset</title><meta http-equiv="refresh" content="3;url=/qr"></head>
            <body style="font-family:sans-serif; text-align:center; background:#0f172a; color:white; padding:50px;">
                <h2 style="color:#22c55e;">✅ WhatsApp Session Cache Reset Successfully!</h2>
                <p>Generating fresh QR code... Redirecting in 3 seconds...</p>
            </body>
            </html>
        `);
    } catch (err) {
        return res.status(500).send('Error resetting session: ' + err.message);
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Endpoint not found',
        path: req.path
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Global Error:', err);
    
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ========================================
// SERVER STARTUP
// ========================================
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        
        // Sync database models
        console.log('🔄 Syncing database models...');
        await sequelize.sync({ alter: true }); // ✅ DO NOT use { force: true } in production
        console.log('✅ MySQL tables synced successfully!');
        
        // Initialize WhatsApp Client
        console.log('🔄 Initializing WhatsApp client...');
        whatsappClient.initialize();
        initializeChatbot(whatsappClient);
        
        // Start Express server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log('========================================');
            console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
            console.log(`🚀 Port: ${PORT}`);
            console.log(`🚀 API: http://localhost:${PORT}`);
            console.log(`🚀 Health: http://localhost:${PORT}/health`);
            console.log('========================================');
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// ========================================
// GRACEFUL SHUTDOWN
// ========================================
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    try {
        // Close WhatsApp client
        console.log('🔄 Closing WhatsApp connection...');
        await whatsappClient.destroy();
        
        // Close database connection
        console.log('🔄 Closing database connection...');
        await sequelize.close();
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
