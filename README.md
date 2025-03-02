# ChatLore

ChatLore is a privacy-first conversation intelligence app for WhatsApp chat exports. It provides advanced security insights, context management, and intelligent search capabilities while keeping your data private.

## Features

-   **Privacy-First**: All processing happens locally - your data never leaves your device
-   **WhatsApp Chat Parsing**: Import and analyze your WhatsApp chat exports
-   **Sensitive Data Detection**: Automatically identify and protect sensitive information
-   **Security Analysis**: Get insights into potential security risks in your conversations
-   **Context Management**: Automatically identify conversation threads and topics
-   **Intelligent Search**: Find information in your chats with context-aware search
-   **RAG-Powered Q&A**: Ask questions about your conversations and get accurate answers

## Project Structure

The project is organized into two main parts:

### Backend

-   **WhatsApp Parser**: Parses WhatsApp chat exports into structured data
-   **Sensitive Data Detector**: Identifies and protects sensitive information
-   **Security Analysis Engine**: Analyzes conversations for security risks
-   **Context Manager**: Manages conversation context and threads
-   **Vector Database**: Stores and retrieves message embeddings
-   **RAG Pipeline**: Provides intelligent responses to user queries

### Frontend

-   **Chat Uploader**: Upload and process WhatsApp chat exports
-   **Security Insights**: View security analysis and insights
-   **Conversation Threads**: Explore automatically identified conversation threads
-   **Chat Interface**: Ask questions about your conversations

## Getting Started

### Prerequisites

-   Node.js 18+
-   npm or yarn

### Installation

1. Clone the repository:

    ```
    git clone https://github.com/yourusername/chatlore.git
    cd chatlore
    ```

2. Install dependencies for both backend and frontend:

    ```
    # Install backend dependencies
    cd backend
    npm install

    # Install frontend dependencies
    cd ../frontend
    npm install
    ```

3. Start the development servers:

    ```
    # Start backend server (from the backend directory)
    npm run dev

    # Start frontend server (from the frontend directory)
    npm run dev
    ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Export your WhatsApp chat**:

    - Open WhatsApp
    - Go to the chat you want to analyze
    - Tap the three dots (menu) > More > Export chat
    - Choose "Without Media"
    - Save the .txt file

2. **Upload the chat file**:

    - Go to the ChatLore app
    - Click on the "Upload Chat" tab
    - Upload the .txt file you exported from WhatsApp

3. **Explore insights**:
    - View security insights in the "Security Insights" tab
    - Explore conversation threads in the "Conversation Threads" tab
    - Ask questions about your chat in the "Chat with Data" tab

## Privacy

ChatLore is designed with privacy as a core principle:

-   All processing happens locally in your browser
-   No data is sent to external servers
-   No analytics or tracking
-   No cloud storage of your conversations

## Technologies Used

-   **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
-   **Backend**: Node.js, Express, TypeScript
-   **Data Processing**: Vector embeddings, RAG (Retrieval-Augmented Generation)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

-   This project was inspired by the need for privacy-focused conversation analysis tools
-   Thanks to the open-source community for the amazing libraries and tools that made this possible
