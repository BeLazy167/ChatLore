#!/bin/bash

# ChatLore Quick Setup Script
# This script sets up the ChatLore application for demo purposes

echo "🚀 Starting ChatLore Quick Setup..."

# Check for required tools
echo "📋 Checking prerequisites..."

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not found. Please install Python 3.10 or higher."
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not found. Please install Node.js 18 or higher."
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not found. Please install npm 9 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p demo_data

# Copy demo data if it doesn't exist
if [ ! -f "demo_data/whatsapp_demo_chat.txt" ]; then
    echo "📄 Setting up demo data..."
    # If the file was created in a previous step, this will be skipped
    if [ ! -f "demo_data/whatsapp_demo_chat.txt" ]; then
        echo "❌ Demo data not found. Please make sure the demo_data directory contains whatsapp_demo_chat.txt"
        exit 1
    fi
fi

# Set up backend
echo "🔧 Setting up backend..."
cd backend || { echo "❌ Backend directory not found!"; exit 1; }

# Create Python virtual environment
echo "🐍 Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate || { echo "❌ Failed to activate virtual environment!"; exit 1; }

# Install backend dependencies
echo "📦 Installing backend dependencies..."
pip install -r requirements.txt || { echo "❌ Failed to install backend dependencies!"; exit 1; }

# Create .env file for backend
echo "🔑 Setting up environment variables..."
if [ ! -f ".env" ]; then
    echo "GEMINI_API_KEY=your_gemini_api_key" > .env
    echo "⚠️ Please update the GEMINI_API_KEY in backend/.env with your actual API key!"
fi

# Start backend server in the background
echo "🚀 Starting backend server..."
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "✅ Backend server started with PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend server to initialize..."
sleep 5

# Set up frontend
echo "🔧 Setting up frontend..."
cd ../frontend || { echo "❌ Frontend directory not found!"; exit 1; }

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install || { echo "❌ Failed to install frontend dependencies!"; exit 1; }

# Create .env file for frontend
if [ ! -f ".env" ]; then
    echo "VITE_API_BASE_URL=http://localhost:8000" > .env
fi

# Start frontend server
echo "🚀 Starting frontend server..."
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend server started with PID: $FRONTEND_PID"

# Wait for frontend to start
echo "⏳ Waiting for frontend server to initialize..."
sleep 5

# Print success message
echo ""
echo "🎉 ChatLore setup complete! 🎉"
echo ""
echo "📱 Access the application at: http://localhost:3000"
echo ""
echo "📝 Demo Instructions:"
echo "1. Click on 'New Chat' to create a new chat"
echo "2. Upload the sample WhatsApp chat file from demo_data/whatsapp_demo_chat.txt"
echo "3. Explore the features: sensitive data detection, security insights, and context-aware search"
echo ""
echo "⚠️ Important Notes:"
echo "- The backend server is running on http://localhost:8000"
echo "- To stop the servers, press Ctrl+C and then run: kill $BACKEND_PID $FRONTEND_PID"
echo "- For a production setup, please refer to the SETUP.md file"
echo ""
echo "Thank you for trying ChatLore! 🙏"

# Keep the script running to maintain the servers
wait 