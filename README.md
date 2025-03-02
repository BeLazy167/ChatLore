# ChatLore: Privacy-First Chat Analysis Platform

![ChatLore Logo](docs/images/chatlore_logo.png)

**ChatLore** is a privacy-focused platform that helps users understand, protect, and gain insights from their personal messaging data. Built for the MLH Hackathon, ChatLore addresses the critical need for privacy and security in our digital conversations.

## 🌟 Key Features

### 🔒 Sensitive Data Protection

-   Automatically identifies personal information like phone numbers, addresses, and financial details
-   Provides redaction capabilities for sharing or analysis
-   Gives users control over what information is visible and to whom

### 🛡️ Security Insights

-   Analyzes conversations for potential security risks
-   Provides a security score and actionable recommendations
-   Identifies high-risk messages and suggests protective measures

### 🔍 Context-Aware Search & AI Assistant

-   Understands the context of conversations, not just keywords
-   Provides relevant messages with surrounding context
-   Answers complex questions about your chat history using AI

## 📱 Demo

![ChatLore Demo](docs/images/chatlore_demo.gif)

## 🏆 Hackathon Context

ChatLore was developed for the MLH Hackathon with a focus on privacy and security in digital communications. Our team identified that while messaging apps are increasingly central to our lives, they lack robust tools for users to understand and protect their sensitive information.

### Problem Statement

-   The average person sends 40+ messages per day, many containing sensitive information
-   Existing chat platforms provide minimal tools for identifying or protecting sensitive data
-   Users have limited visibility into potential security risks in their conversations
-   Finding specific information in chat history is difficult without proper context

### Our Solution

ChatLore addresses these challenges by providing a secure platform where users can:

1. Upload their chat data (currently supporting WhatsApp exports)
2. Automatically identify sensitive information
3. Receive security insights and recommendations
4. Search and ask questions with context-awareness

## 🛠️ Technology Stack

### Frontend

-   React 19 with TypeScript
-   Tailwind CSS for styling
-   Shadcn UI component library
-   React Query for data fetching

### Backend

-   FastAPI (Python)
-   Google Gemini for natural language processing
-   Custom ML models for sensitive data detection
-   Vector embeddings for semantic search

### Architecture

-   Client-side processing for privacy-sensitive operations
-   Secure API design with minimal data transfer
-   Local-first approach with optional cloud features

## 🚀 Getting Started

For detailed setup instructions, see [SETUP.md](SETUP.md).

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/chatlore.git
cd chatlore

# Run the quick setup script
./quick_setup.sh
```

Then open your browser to http://localhost:3000.

## 📊 Architecture

![ChatLore Architecture](docs/images/architecture_diagram.png)

ChatLore uses a privacy-first architecture:

1. **Data Processing Layer**: Handles chat data parsing and initial processing
2. **Analysis Layer**: Identifies sensitive information and security risks
3. **Context Engine**: Builds semantic understanding of conversations
4. **Query Layer**: Processes search queries and questions
5. **Presentation Layer**: Provides user interface and visualization

## 🔍 Technical Challenges

### Privacy-Preserving Analysis

We developed techniques to analyze sensitive data while minimizing exposure, using local processing where possible and secure API design.

### Context-Aware Search

Building a system that understands the context of conversations required advanced NLP techniques and custom vector embeddings.

### Real-Time Security Analysis

Developing heuristics and models to identify security risks in conversational data presented unique challenges in pattern recognition and risk assessment.

## 🔮 Future Development

-   Support for more messaging platforms (Telegram, Discord, Slack)
-   Advanced threat detection for potential phishing or scam messages
-   Personalized security recommendations based on user behavior
-   End-to-end encrypted cloud backup options
-   Integration with privacy-focused identity management systems

## 👥 Team

-   [Team Member 1] - Role
-   [Team Member 2] - Role
-   [Team Member 3] - Role
-   [Team Member 4] - Role

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   Thanks to MLH for hosting this hackathon
-   Google for providing access to the Gemini API
-   All the open-source libraries that made this project possible
