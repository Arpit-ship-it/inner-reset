#!/bin/bash

# Script to help you start everything with ngrok easily
# Usage: ./start-with-ngrok.sh

echo "🚀 Starting Backend Server..."
echo ""

# Check if server is already running
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Backend already running on port 5000"
else
    echo "⚠️  Backend not running. Please start it first:"
    echo "   node server.js"
    exit 1
fi

echo ""
echo "📋 Current ngrok tunnels:"
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | grep -o 'https://[^"]*'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 SETUP INSTRUCTIONS:"
echo ""
echo "1. Start ngrok in a new terminal:"
echo "   ngrok http 5000"
echo ""
echo "2. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok-free.app)"
echo ""
echo "3. Update frontend config:"
echo "   node update-ngrok-url.js https://YOUR-NGROK-URL"
echo ""
echo "4. Start frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Open ngrok dashboard
echo "💡 Opening ngrok dashboard in browser..."
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:4040
elif command -v open > /dev/null; then
    open http://localhost:4040
else
    echo "   Visit: http://localhost:4040"
fi
