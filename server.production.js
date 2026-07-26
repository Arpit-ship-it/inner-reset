const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');

// Use production WhatsApp config in production, development config otherwise
const whatsappClient = process.env.NODE_ENV === 'production' 
    ? require('./config/whatsapp.production')
    : require('./config/whatsapp');

// Start background scheduler automation
require('./utils/scheduler');

const authRoutes = require('./routes/auth');

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
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://yourdomain.com', // Replace with actual domain
    'https://www.yourdomain.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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
