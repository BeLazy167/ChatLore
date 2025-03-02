# ChatLore Installation and Setup Guide

This guide provides detailed instructions for setting up and running ChatLore for evaluation purposes. Follow these steps to get the application running on your local machine.

## Quick Start (For Judges)

If you're evaluating this project and want to get it running quickly:

```bash
# Clone the repository
git clone https://github.com/yourusername/chatlore.git
cd chatlore

# Run the quick setup script
./quick_setup.sh
```

The quick setup script will:

1. Install all dependencies
2. Set up environment variables with default values
3. Load sample data
4. Start both backend and frontend servers

Then open your browser to http://localhost:3000 to access the application.

## Detailed Setup Instructions

If you prefer to set up the application manually or the quick setup script doesn't work for your environment, follow these detailed steps.

### Prerequisites

-   Python 3.10 or higher
-   Node.js 18 or higher
-   npm 9 or higher
-   Git

### Backend Setup

1. **Set up a Python virtual environment:**

```bash
cd chatlore/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install Python dependencies:**

```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**

Create a `.env` file in the `backend` directory with the following content:

```
GEMINI_API_KEY=your_gemini_api_key
```

You can obtain a Gemini API key from [Google AI Studio](https://ai.google.dev/).

4. **Start the backend server:**

```bash
uvicorn main:app --reload --port 8000
```

The backend server will be available at http://localhost:8000.

### Frontend Setup

1. **Install Node.js dependencies:**

```bash
cd chatlore/frontend
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the `frontend` directory with the following content:

```
VITE_API_BASE_URL=http://localhost:8000
```

3. **Start the frontend development server:**

```bash
npm run dev
```

The frontend will be available at http://localhost:5173.

## Docker Setup (Alternative)

If you prefer to use Docker:

1. **Build and start the containers:**

```bash
cd chatlore
docker-compose up -d
```

2. **Access the application:**

Open your browser to http://localhost:5173.

## Verifying the Installation

To verify that your installation is working correctly:

1. Open your browser to http://localhost:3000
2. Click on "New Chat" to create a new chat
3. Upload the sample WhatsApp chat file from `demo_data/whatsapp_demo_chat.txt`
4. Wait for the processing to complete
5. Explore the features:
    - View the sensitive data detection
    - Check the security insights
    - Try searching for specific information
    - Ask questions about the chat content

## Sample Queries to Test

Try these sample queries to test the system:

1. "When did we discuss the project deadline?"
2. "What sensitive information is shared in this chat?"
3. "Show me all messages from Jamie"
4. "What security risks are present in this conversation?"
5. "Summarize the discussion about the client demo"

## Troubleshooting

### Common Issues

1. **Backend server fails to start:**

    - Check that you have Python 3.10+ installed: `python --version`
    - Ensure all dependencies are installed: `pip install -r requirements.txt`
    - Verify your Gemini API key is correct in the `.env` file

2. **Frontend fails to connect to backend:**

    - Ensure the backend server is running
    - Check that the `VITE_API_BASE_URL` in the frontend `.env` file matches your backend URL
    - Verify there are no CORS issues (the backend should allow requests from the frontend origin)

3. **Processing hangs or fails:**
    - Check the backend logs for errors
    - Ensure your Gemini API key has sufficient quota
    - Try with a smaller chat file first

### Getting Help

If you encounter any issues not covered here, please:

1. Check the GitHub repository issues section
2. Contact the development team at [your contact information]

## Performance Expectations

-   **Initial chat processing:** 5-30 seconds depending on chat size
-   **Search queries:** 1-3 seconds
-   **Question answering:** 3-10 seconds
-   **Security analysis:** 5-15 seconds

## Next Steps

After setting up ChatLore, we recommend:

1. Upload your own WhatsApp chat export to see how it handles real data
2. Explore the security insights to understand potential risks
3. Try the context-aware search with specific questions
4. Check out the sensitive data detection capabilities

Thank you for trying ChatLore! We hope you find it valuable for understanding and protecting your chat data.
