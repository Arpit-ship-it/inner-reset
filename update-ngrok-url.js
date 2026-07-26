#!/usr/bin/env node

/**
 * Quick script to update ngrok URL in frontend .env file
 * Usage: node update-ngrok-url.js https://your-new-ngrok-url.ngrok-free.app
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'frontend', '.env');

// Get URL from command line argument
const newUrl = process.argv[2];

if (!newUrl) {
    console.error('❌ Error: Please provide ngrok URL as argument');
    console.log('\n📖 Usage:');
    console.log('   node update-ngrok-url.js https://your-ngrok-url.ngrok-free.app');
    console.log('\n💡 Example:');
    console.log('   node update-ngrok-url.js https://abc123.ngrok-free.app');
    process.exit(1);
}

// Validate URL format
if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
    console.error('❌ Error: URL must start with http:// or https://');
    process.exit(1);
}

// Create or update .env file
const envContent = `# Frontend Development Environment Variables
# Update this with your ngrok URL when using ngrok

# Current ngrok URL (auto-updated)
VITE_API_URL=${newUrl}

# For local development, use:
# VITE_API_URL=http://localhost:5000
`;

try {
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ Successfully updated frontend/.env');
    console.log(`🔗 API URL set to: ${newUrl}`);
    console.log('\n⚠️  Important: Restart your frontend dev server for changes to take effect!');
    console.log('   cd frontend && npm run dev');
} catch (error) {
    console.error('❌ Error writing to .env file:', error.message);
    process.exit(1);
}
