#!/usr/bin/env node

/**
 * Localhost Health Check Script
 * Verifies that everything is configured correctly
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Localhost Configuration...\n');

// Color codes for terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function checkMark(condition) {
  return condition ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
}

// Check 1: Frontend .env file
console.log('📁 Checking Frontend Configuration...');
const envPath = path.join(__dirname, 'frontend', '.env');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasLocalhost = envContent.includes('localhost:5000');
  console.log(`${checkMark(hasLocalhost)} frontend/.env file ${hasLocalhost ? 'correctly set to localhost:5000' : 'NOT set to localhost'}`);
  
  if (!hasLocalhost) {
    console.log(`${colors.yellow}⚠️  Expected: VITE_API_URL=http://localhost:5000${colors.reset}\n`);
  } else {
    console.log(`${colors.green}   VITE_API_URL=http://localhost:5000${colors.reset}\n`);
  }
} catch (error) {
  console.log(`${colors.red}❌ frontend/.env file not found${colors.reset}\n`);
}

// Check 2: Backend .env file
console.log('📁 Checking Backend Configuration...');
const backendEnvPath = path.join(__dirname, '.env');
try {
  const envContent = fs.readFileSync(backendEnvPath, 'utf8');
  const hasPort = envContent.includes('PORT=');
  console.log(`${checkMark(hasPort)} .env file exists`);
  
  if (hasPort) {
    const portMatch = envContent.match(/PORT=(\d+)/);
    if (portMatch) {
      console.log(`${colors.green}   PORT=${portMatch[1]}${colors.reset}\n`);
    }
  }
} catch (error) {
  console.log(`${colors.red}❌ .env file not found${colors.reset}\n`);
}

// Check 3: Backend API
console.log('🔗 Checking Backend API...');
http.get('http://localhost:5000/', (res) => {
  console.log(`${colors.green}✅ Backend is running on http://localhost:5000${colors.reset}`);
  console.log(`   Status: ${res.statusCode}\n`);
}).on('error', (err) => {
  console.log(`${colors.red}❌ Backend is NOT running on http://localhost:5000${colors.reset}`);
  console.log(`${colors.yellow}   Start it with: node server.js${colors.reset}\n`);
});

// Check 4: Users API
setTimeout(() => {
  console.log('👥 Checking Users API...');
  http.get('http://localhost:5000/api/auth/users', (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const users = JSON.parse(data);
        console.log(`${colors.green}✅ Users API is working${colors.reset}`);
        console.log(`   Found ${users.length} user(s) in database\n`);
        
        if (users.length > 0) {
          console.log(`${colors.blue}📊 Sample User:${colors.reset}`);
          const sample = users[0];
          console.log(`   Name: ${sample.name}`);
          console.log(`   Email: ${sample.email}`);
          console.log(`   WhatsApp: ${sample.whatsapp_number}`);
          console.log(`   Status: ${sample.status || 'N/A'}\n`);
        }
      } catch (error) {
        console.log(`${colors.yellow}⚠️  API responded but data format unexpected${colors.reset}\n`);
      }
    });
  }).on('error', (err) => {
    console.log(`${colors.red}❌ Users API not accessible${colors.reset}`);
    console.log(`${colors.yellow}   Make sure backend is running!${colors.reset}\n`);
  });
}, 500);

// Check 5: Frontend
setTimeout(() => {
  console.log('🖥️  Checking Frontend...');
  
  // Try common Vite ports
  const ports = [5173, 5174, 5175];
  let foundFrontend = false;
  
  ports.forEach((port, index) => {
    setTimeout(() => {
      http.get(`http://localhost:${port}/`, (res) => {
        if (!foundFrontend) {
          foundFrontend = true;
          console.log(`${colors.green}✅ Frontend is running on http://localhost:${port}${colors.reset}\n`);
          
          // Final summary
          setTimeout(() => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`${colors.green}✨ LOCALHOST SETUP CHECK COMPLETE!${colors.reset}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            console.log(`${colors.blue}🚀 Quick Access:${colors.reset}`);
            console.log(`   Backend:  http://localhost:5000`);
            console.log(`   Frontend: http://localhost:${port}`);
            console.log(`   API Test: http://localhost:5000/api/auth/users\n`);
            console.log(`${colors.green}Everything looks good! Open the frontend URL in your browser.${colors.reset}\n`);
          }, 500);
        }
      }).on('error', (err) => {
        if (index === ports.length - 1 && !foundFrontend) {
          console.log(`${colors.red}❌ Frontend is NOT running${colors.reset}`);
          console.log(`${colors.yellow}   Start it with: cd frontend && npm run dev${colors.reset}\n`);
        }
      });
    }, index * 200);
  });
}, 1000);

// Instructions
setTimeout(() => {
  console.log(`${colors.blue}📖 Need Help?${colors.reset}`);
  console.log(`   Read: LOCALHOST_SETUP.md`);
  console.log(`   Or run: node server.js (Terminal 1)`);
  console.log(`           cd frontend && npm run dev (Terminal 2)\n`);
}, 3000);
