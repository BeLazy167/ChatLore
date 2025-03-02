# ChatLore Backend (Stateless)

ChatLore is an AI-powered WhatsApp chat analysis tool that helps you understand, search, and gain insights from your conversations. This version uses a stateless API design.

## Features

-   **WhatsApp Chat Parsing**: Support for the exact WhatsApp chat export format with multi-line messages, media attachments, and call records
-   **AI-Powered Search**: Semantic search using Gemini embeddings and context-aware results
-   **Security Analysis**: Detection of sensitive information and security risk assessment
-   **Conversation Insights**: AI-generated insights about topics, patterns, and key information
-   **Topic Clustering**: Automatic grouping of related messages with summaries
-   **Stateless API**: All endpoints accept message data in each request, allowing for client-side data management

## Setup

1. **Environment Setup**:

    ```bash
    # Create and activate virtual environment
    python3 -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate

    # Install dependencies
    pip install -r requirements.txt
    ```

2. **Environment Variables**:
   Create a `.env` file in the backend directory with:

    ```
    GEMINI_API_KEY=your_api_key_here
    ```

3. **Running the Server**:
    ```bash
    python run.py
    ```
    The server will start at `http://localhost:8000`

## API Endpoints

### Chat Processing

-   `POST /api/chat/process`: Process WhatsApp chat text

    -   Request: JSON with `chat_text` field
    -   Response: Chat statistics and parsed messages

-   `POST /api/chat/messages`: Get processed messages with pagination

    -   Request: JSON with `messages` array and optional `skip`, `limit` params
    -   Response: Paginated messages

-   `POST /api/chat/stats`: Get chat statistics and metadata
    -   Request: JSON with `messages` array
    -   Response: Chat statistics

### Search and Analysis

-   `POST /api/search/semantic`: Perform semantic search

    -   Request: JSON with:
        -   `messages`: Array of messages
        -   `query`: Search query
        -   `min_similarity`: Minimum similarity score (0-1)
        -   `limit`: Maximum results
        -   `with_explanation`: Include AI explanations

-   `POST /api/search/similar`: Find similar messages

    -   Request: JSON with:
        -   `messages`: Array of messages
        -   `message_id`: ID of the message to find similar ones
        -   `min_similarity`: Minimum similarity score
        -   `limit`: Maximum results

-   `POST /api/search/topics`: Get topic clusters with summaries

    -   Request: JSON with `messages` array

-   `POST /api/search/insights`: Get AI-generated conversation insights
    -   Request: JSON with `messages` array and optional `start_date`, `end_date`

### Security Analysis

-   `POST /api/security/analyze`: Get comprehensive security analysis

    -   Request: JSON with `messages` array
    -   Response: Security score, findings, and recommendations

-   `POST /api/security/sensitive-data`: Get detected sensitive information

    -   Request: JSON with `messages` array

-   `POST /api/security/redacted`: Get messages with sensitive data redacted
    -   Request: JSON with `messages` array

## Example Usage

1. **Process Chat**:

    ```python
    import requests

    with open('chat.txt', 'r', encoding='utf-8') as f:
        chat_text = f.read()

    response = requests.post(
        'http://localhost:8000/api/chat/process',
        json={'chat_text': chat_text}
    )

    # Store messages in client-side database
    messages = response.json()["messages"]
    ```

2. **Search Messages**:

    ```python
    response = requests.post(
        'http://localhost:8000/api/search/semantic',
        json={
            'messages': messages,
            'query': 'meeting tomorrow',
            'min_similarity': 0.5,
            'limit': 10,
            'with_explanation': True
        }
    )
    print(response.json())
    ```

3. **Get Security Analysis**:
    ```python
    response = requests.post(
        'http://localhost:8000/api/security/analyze',
        json={'messages': messages}
    )
    print(response.json())
    ```

## Development

-   The backend is built with FastAPI for high performance and easy API development
-   Uses Gemini for AI capabilities including embeddings and text generation
-   Implements efficient message parsing and indexing for quick search
-   Includes comprehensive security analysis with ML-based detection
-   Stateless API design allows for client-side data management and better scalability

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
