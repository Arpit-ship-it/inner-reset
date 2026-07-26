# 🚀 Affirmation App - Production Deployment Guide

## 📋 Table of Contents
1. [Architecture Analysis](#architecture-analysis)
2. [Production Deployment Strategy](#production-deployment-strategy)
3. [Backend Deployment (Critical)](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Migration](#database-migration)
6. [Environment Configuration](#environment-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🏗️ Architecture Analysis

### Current State (Localhost)
- **Frontend:** React (Vite) on `http://localhost:5173`
- **Backend:** Node.js/Express on `http://localhost:5000`
- **Database:** MySQL (Local) with Sequelize ORM
- **WhatsApp:** `whatsapp-web.js` with Puppeteer (Browser-based authentication)
- **Scheduler:** `node-cron` for automated quote delivery

### Critical Dependencies Resolved
✅ MySQL max 64 keys issue - Fixed with `{ alter: true }`
✅ Puppeteer timeout - Fixed with `protocolTimeout: 0`
✅ Detached Frame errors - Fixed with 4-second retry logic
✅ Invalid WhatsApp numbers - Gracefully handled with skip logic

---

## 🎯 Production Deployment Strategy

### Option A: VPS Deployment (RECOMMENDED for WhatsApp)
**Platform:** DigitalOcean, AWS EC2, Linode, or Hetzner
**Why?** Full control over Puppeteer/Chrome, persistent sessions, cron jobs

### Option B: Hybrid Deployment
**Backend + WhatsApp:** VPS (Must have GUI access)
**Frontend:** Vercel/Netlify
**Database:** AWS RDS or Railway MySQL

### ⚠️ CRITICAL: WhatsApp-web.js Limitations
- **Cannot run on serverless** (Vercel, Netlify Functions, AWS Lambda)
- **Requires persistent browser session** with GUI/X-server for initial QR scan
- **Needs stable server** that doesn't restart frequently
- **Session files must persist** (`.wwebjs_auth` directory)

---

## 🖥️ Backend Deployment (VPS Setup)

### Step 1: Choose VPS Provider

#### Recommended Specs:
- **RAM:** Minimum 2GB (4GB recommended for Puppeteer)
- **CPU:** 2 vCPUs
- **Storage:** 20GB SSD
- **OS:** Ubuntu 22.04 LTS

#### Provider Options:
1. **DigitalOcean** - $12/month (2GB RAM)
2. **AWS EC2** - t3.small ($15/month)
3. **Linode** - $12/month (2GB RAM)
4. **Hetzner** - €4.5/month (2GB RAM, cheapest)

### Step 2: Server Initial Setup

```bash
# SSH into your server
ssh root@your_server_ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v

# Install Git
sudo apt install git -y

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Chrome dependencies for Puppeteer
sudo apt install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils

# Install Xvfb (Virtual Display for headless Chrome)
sudo apt install -y xvfb
```

### Step 3: MySQL Database Setup

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE affirmation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'affirmation_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON affirmation_db.* TO 'affirmation_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4: Deploy Backend Code

```bash
# Create app directory
mkdir -p /var/www/affirmation-app
cd /var/www/affirmation-app

# Clone your repository (or upload via SCP/SFTP)
git clone YOUR_GITHUB_REPO_URL .

# Install dependencies
npm install

# Install additional production dependencies
npm install --production
```

### Step 5: Configure Environment Variables

```bash
# Create production .env file
nano .env
```

Add the following:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=affirmation_user
DB_PASS=YOUR_STRONG_PASSWORD
DB_NAME=affirmation_db

# Frontend URL (CORS)
FRONTEND_URL=https://your-frontend-domain.com

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=/var/www/affirmation-app/.wwebjs_auth
```

### Step 6: Update Code for Production

Create `config/whatsapp.production.js`:

```javascript
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const whatsappClient = new Client({
    authStrategy: new LocalAuth({
        dataPath: process.env.WHATSAPP_SESSION_PATH || './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true, // ✅ Production me headless mode
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-software-rasterizer',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Important for VPS stability
            '--disable-web-security'
        ],
        executablePath: '/usr/bin/google-chrome-stable' // Explicit Chrome path
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
});

whatsappClient.on('qr', (qr) => {
    console.log('📱 Scan this QR code with WhatsApp on your phone:');
    qrcode.generate(qr, { small: true });
    console.log('\n⚠️  QR Code expires in 60 seconds. Scan quickly!\n');
});

whatsappClient.on('ready', () => {
    console.log('✅ WhatsApp Client is READY in Production!');
});

whatsappClient.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated successfully');
});

whatsappClient.on('auth_failure', (msg) => {
    console.error('❌ WhatsApp Authentication failed:', msg);
});

whatsappClient.on('disconnected', (reason) => {
    console.error('❌ WhatsApp disconnected:', reason);
    console.log('🔄 Attempting to reconnect...');
});

module.exports = whatsappClient;
```

Update `server.js` to use production config:

```javascript
const whatsappClient = process.env.NODE_ENV === 'production' 
    ? require('./config/whatsapp.production')
    : require('./config/whatsapp');
```

### Step 7: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/affirmation-api
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com; # Replace with your domain

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Increase timeouts for WhatsApp operations
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/affirmation-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

### Step 8: Start Application with PM2

```bash
# Navigate to app directory
cd /var/www/affirmation-app

# Start with PM2
pm2 start server.js --name "affirmation-backend" --time

# Setup PM2 startup script
pm2 startup systemd
pm2 save

# Monitor logs
pm2 logs affirmation-backend

# Other useful PM2 commands
pm2 status
pm2 restart affirmation-backend
pm2 stop affirmation-backend
```

### Step 9: Initial WhatsApp QR Scan

⚠️ **CRITICAL FIRST-TIME SETUP:**

For the first deployment, you need to scan the QR code:

**Option A: Temporary GUI Access**
```bash
# Install X11 forwarding (if using SSH)
ssh -X root@your_server_ip

# Or use VNC
sudo apt install tightvncserver -y
vncserver :1
```

**Option B: Generate QR in Terminal (Easier)**
```bash
# The QR code will appear in PM2 logs
pm2 logs affirmation-backend

# Scan with your phone immediately (60 second timeout)
```

**Option C: Local First Setup**
1. Run app locally first with your production credentials
2. Let WhatsApp authenticate and create `.wwebjs_auth` folder
3. Upload `.wwebjs_auth` folder to server via SCP:
```bash
scp -r .wwebjs_auth root@your_server_ip:/var/www/affirmation-app/
```

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Build configuration
npm run build

# Deploy
vercel --prod
```

**Vercel Configuration (`vercel.json`):**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://api.yourdomain.com"
  }
}
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: Same VPS as Backend

```bash
# Build frontend locally
cd frontend
npm run build

# Upload dist folder to server
scp -r dist/* root@your_server_ip:/var/www/affirmation-frontend/

# Nginx configuration
sudo nano /etc/nginx/sites-available/affirmation-frontend
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/affirmation-frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

### Update Frontend API URL

Create `frontend/.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com
```

Update `frontend/src/App.jsx`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Update all axios calls
const response = await axios.get(`${API_URL}/api/auth/users`);
const response = await axios.post(`${API_URL}/api/auth/register`, formData);
```

---

## 🔒 Security Hardening

### 1. Firewall Setup

```bash
# Setup UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Update CORS Configuration

Update `server.js`:

```javascript
const allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : null
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
```

### 3. Rate Limiting

```bash
npm install express-rate-limit
```

Add to `server.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 4. Helmet for Security Headers

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 📊 Monitoring & Maintenance

### 1. Setup Logging

```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 2. Monitor System Resources

```bash
# Install htop
sudo apt install htop -y

# Monitor resources
htop

# Check disk space
df -h

# Check memory
free -m
```

### 3. Backup Strategy

```bash
# Create backup script
nano /root/backup-affirmation.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"

# Backup MySQL
mysqldump -u affirmation_user -p'YOUR_PASSWORD' affirmation_db > $BACKUP_DIR/db_$DATE.sql

# Backup WhatsApp session
tar -czf $BACKUP_DIR/whatsapp_session_$DATE.tar.gz /var/www/affirmation-app/.wwebjs_auth

# Delete backups older than 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make executable
chmod +x /root/backup-affirmation.sh

# Setup cron for daily backups at 3 AM
crontab -e
0 3 * * * /root/backup-affirmation.sh >> /var/log/backup.log 2>&1
```

### 4. Health Check Endpoint

Add to `server.js`:

```javascript
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        whatsapp: whatsappClient.info ? 'Connected' : 'Disconnected'
    });
});
```

---

## 🔧 Troubleshooting Guide

### WhatsApp Session Lost

```bash
# Remove old session
rm -rf /var/www/affirmation-app/.wwebjs_auth

# Restart app to generate new QR
pm2 restart affirmation-backend

# Check logs for QR code
pm2 logs affirmation-backend
```

### Cron Jobs Not Running

```bash
# Check if scheduler is loaded
pm2 logs affirmation-backend | grep "Premium Scheduler Ready"

# Verify server timezone
timedatectl
sudo timedatectl set-timezone Asia/Kolkata # Adjust to your timezone
```

### High Memory Usage

```bash
# Restart application
pm2 restart affirmation-backend

# Increase swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## ✅ Pre-Launch Checklist

- [ ] VPS provisioned with minimum 2GB RAM
- [ ] MySQL database created and secured
- [ ] Backend code deployed and running with PM2
- [ ] WhatsApp QR scanned and authenticated
- [ ] Nginx reverse proxy configured with SSL
- [ ] Frontend deployed and connected to API
- [ ] CORS properly configured
- [ ] Cron jobs verified with test runs
- [ ] Backup scripts setup and tested
- [ ] Firewall enabled and configured
- [ ] Health check endpoint tested
- [ ] Error logging configured
- [ ] Test user registration flow
- [ ] Test WhatsApp message delivery
- [ ] Monitor logs for 24 hours

---

## 📈 Estimated Costs

### Minimum Monthly Cost:
- **VPS (Hetzner):** €4.50 (~$5)
- **Domain:** $12/year (~$1/month)
- **SSL Certificate:** Free (Let's Encrypt)
- **Total:** ~$6/month

### Recommended Monthly Cost:
- **VPS (DigitalOcean 2GB):** $12
- **Domain:** $1/month
- **Backups:** $1.20 (20% of droplet cost)
- **Total:** ~$14/month

---

## 🎯 Next Steps

1. Choose VPS provider and provision server
2. Setup MySQL and Node.js environment
3. Deploy backend with PM2
4. Scan WhatsApp QR code (CRITICAL)
5. Deploy frontend to Vercel/Netlify
6. Configure domain and SSL
7. Test end-to-end flow
8. Setup monitoring and backups
9. Go live! 🚀

---

**Need help with deployment? I'm here to assist every step! 💪**
