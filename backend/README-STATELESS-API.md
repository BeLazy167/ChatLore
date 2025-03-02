# Stateless API Implementation for ChatLore Backend

This document explains the implementation of a stateless API for ChatLore, which allows the application to work with multiple users in a deployed environment without requiring server-side user management.

## Overview

The ChatLore backend has been updated to use a fully stateless API design:

1. **Stateless API**: Accepts all necessary data in each request, allowing for client-side data management.

This approach enables the browser-based database architecture and improves scalability.

## Key Changes

### 1. Removed Stateful Endpoints

All stateful endpoints that relied on server-side storage have been removed:

-   Removed `GET` endpoints that depended on the global parser instance
-   Removed the `/api/chat/upload` endpoint that stored data on the server
-   Removed all dependencies on the global `_whatsapp_parser` variable

### 2. Stateless Endpoints

The API now exclusively uses POST endpoints that accept message data:

| Endpoint                          | Description                  |
| --------------------------------- | ---------------------------- |
| POST /api/chat/process            | Process chat text            |
| POST /api/chat/messages           | Get messages with pagination |
| POST /api/chat/stats              | Get chat statistics          |
| POST /api/security/analyze        | Analyze security             |
| POST /api/security/sensitive-data | Get sensitive data           |
| POST /api/security/redacted       | Get redacted messages        |
| POST /api/search/semantic         | Perform semantic search      |
| POST /api/search/similar          | Find similar messages        |
| POST /api/search/topics           | Get topic clusters           |
| POST /api/search/insights         | Get conversation insights    |

### 3. Dependencies Update

-   Removed `get_whatsapp_parser` and `set_whatsapp_parser` functions
-   Kept only the `create_parser_from_messages` function for stateless operation

### 4. CORS Configuration

-   Maintained CORS settings to use environment variables for allowed origins
-   Default allowed origins include localhost development servers

## How It Works

### Stateless Flow Example

1. **Client uploads chat**:

    - Client sends chat text to `/api/chat/process`
    - Server processes the chat and returns parsed messages
    - Client stores messages in browser database (IndexedDB)

2. **Client requests security analysis**:
    - Client retrieves messages from browser database
    - Client sends messages to `/api/security/analyze`
    - Server analyzes messages and returns results
    - Client stores results in browser database

### Benefits

1. **Multi-User Support**: Each user's data remains in their browser
2. **Reduced Server Load**: No need to store user data on the server
3. **Privacy**: Sensitive data remains on the client device
4. **Scalability**: Server can handle more users since it's stateless
5. **Horizontal Scaling**: Multiple server instances can be deployed without shared state

## Usage Examples

### Processing Chat Text

```python
import requests

# Process chat text
with open('chat.txt', 'r', encoding='utf-8') as f:
    chat_text = f.read()

response = requests.post(
    "http://localhost:8000/api/chat/process",
    json={"chat_text": chat_text}
)

# Store messages in client-side database
messages = response.json()["messages"]
```

### Analyzing Security

```python
import requests

# Retrieve messages from client-side database
# ...

# Send messages for security analysis
response = requests.post(
    "http://localhost:8000/api/security/analyze",
    json={"messages": messages}
)

# Store security analysis in client-side database
security_analysis = response.json()
```

## Deployment Considerations

1. **Environment Variables**:

    - `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS

2. **Scaling**:

    - The stateless API is designed to be horizontally scalable
    - No shared state between instances is required

3. **Rate Limiting**:
    - Consider implementing rate limiting for production deployments
    - The stateless nature makes it easier to implement per-client rate limiting

## Future Improvements

1. **Authentication**: Add optional authentication for enhanced security
2. **Caching**: Implement server-side caching for common operations
3. **Compression**: Add request/response compression for large message sets
