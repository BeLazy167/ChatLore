# ChatLore API Documentation

This document provides detailed information about all endpoints in the ChatLore stateless API.

## Base URL

```
http://localhost:8000
```

## Authentication

The API currently does not require authentication.

## Common Request/Response Formats

All API endpoints follow these conventions:

-   Request bodies must be sent as JSON with `Content-Type: application/json`
-   Responses are returned as JSON
-   Timestamps are in ISO 8601 format (e.g., `2023-03-01T12:34:56.789Z`)
-   All endpoints return appropriate HTTP status codes:
    -   `200 OK`: Request successful
    -   `400 Bad Request`: Invalid request parameters
    -   `404 Not Found`: Resource not found
    -   `500 Internal Server Error`: Server error

## Chat API Endpoints

### Process Chat Text

Processes raw WhatsApp chat text and returns parsed messages with statistics.

**Endpoint:** `POST /api/chat/process`

**Request:**

```json
{
    "chat_text": "3/1/23, 10:15 AM - John: Hello\n3/1/23, 10:16 AM - Jane: Hi there!"
}
```

**Response:**

```json
{
    "message": "Chat processed successfully",
    "total_messages": 2,
    "statistics": {
        "total_messages": 2,
        "participants": ["John", "Jane"],
        "media_count": 0,
        "date_range": {
            "start": "2023-03-01T10:15:00",
            "end": "2023-03-01T10:16:00"
        },
        "activity_by_hour": {
            "10": 2
        },
        "activity_by_date": {
            "2023-03-01": 2
        },
        "participant_stats": {
            "John": {
                "message_count": 1,
                "word_count": 1,
                "media_count": 0
            },
            "Jane": {
                "message_count": 1,
                "word_count": 2,
                "media_count": 0
            }
        }
    },
    "messages": [
        {
            "timestamp": "2023-03-01T10:15:00",
            "sender": "John",
            "content": "Hello",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T10:16:00",
            "sender": "Jane",
            "content": "Hi there!",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        }
    ]
}
```

### Get Messages with Pagination

Retrieves a paginated subset of messages.

**Endpoint:** `POST /api/chat/messages`

**Request:**

```json
{
    "messages": [
        {
            "timestamp": "2023-03-01T10:15:00",
            "sender": "John",
            "content": "Hello",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T10:16:00",
            "sender": "Jane",
            "content": "Hi there!",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        }
    ],
    "skip": 0,
    "limit": 10
}
```

**Response:**

```json
[
    {
        "timestamp": "2023-03-01T10:15:00",
        "sender": "John",
        "content": "Hello",
        "message_type": "text",
        "duration": null,
        "url": null,
        "language": "en",
        "is_system_message": false
    },
    {
        "timestamp": "2023-03-01T10:16:00",
        "sender": "Jane",
        "content": "Hi there!",
        "message_type": "text",
        "duration": null,
        "url": null,
        "language": "en",
        "is_system_message": false
    }
]
```

### Get Chat Statistics

Retrieves statistics about the chat.

**Endpoint:** `POST /api/chat/stats`

**Request:**

```json
{
    "messages": [
        {
            "timestamp": "2023-03-01T10:15:00",
            "sender": "John",
            "content": "Hello",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T10:16:00",
            "sender": "Jane",
            "content": "Hi there!",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        }
    ]
}
```

**Response:**

```json
{
    "total_messages": 2,
    "participants": ["John", "Jane"],
    "media_count": 0,
    "date_range": {
        "start": "2023-03-01T10:15:00",
        "end": "2023-03-01T10:16:00"
    },
    "activity_by_hour": {
        "10": 2
    },
    "activity_by_date": {
        "2023-03-01": 2
    },
    "participant_stats": {
        "John": {
            "message_count": 1,
            "word_count": 1,
            "media_count": 0
        },
        "Jane": {
            "message_count": 1,
            "word_count": 2,
            "media_count": 0
        }
    }
}
```

## Security API Endpoints

### Analyze Security

Analyzes chat messages for security concerns and sensitive data.

**Endpoint:** `POST /api/security/analyze`

**Request:**

```json
{
    "messages": [
        {
            "timestamp": "2023-03-01T10:15:00",
            "sender": "John",
            "content": "Hello",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T10:16:00",
            "sender": "Jane",
            "content": "My password is 12345",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        }
    ]
}
```

**Response:**

```json
{
    "security_score": 80,
    "total_findings": 1,
    "findings": [
        {
            "type": "password_exposed",
            "description": "Password exposed in plain text",
            "message_index": 1,
            "risk_level": "high",
            "sender": "Jane",
            "timestamp": "2023-03-01T10:16:00"
        }
    ],
    "risk_levels": {
        "high": 1,
        "medium": 0,
        "low": 0
    },
    "recommendations": [
        {
            "title": "Avoid sharing passwords",
            "description": "Never share passwords in chat messages, even with trusted contacts."
        }
    ]
}
```

### Get Sensitive Data

Retrieves all detected sensitive data from the chat.

**Endpoint:** `POST /api/security/sensitive-data`

**Request:**

```json
{
    "messages": [
        {
            "timestamp": "2023-03-01T10:15:00",
            "sender": "John",
            "content": "Hello",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T10:16:00",
            "sender": "Jane",
            "content": "My password is 12345",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        }
    ]
}
```

**Response:**

```json
{
    "password": ["12345"]
}
```

### Get Redacted Messages

Retrieves messages with sensitive data redacted.

**Endpoint:** `POST /api/security/redacted`

**Request:**

```json
{
    "messages": [
        {
            "timestamp": "2023-03-01T10:15:00",
            "sender": "John",
            "content": "Hello",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T10:16:00",
            "sender": "Jane",
            "content": "My password is 12345",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        }
    ]
}
```

**Response:**

```json
[
    {
        "original": {
            "timestamp": "2023-03-01T10:16:00",
            "sender": "Jane",
            "content": "My password is 12345",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        "redacted_content": "My password is [REDACTED]"
    }
]
```

## Search API Endpoints

### Semantic Search

Performs semantic search on messages using Gemini.

**Endpoint:** `POST /api/search/semantic`

**Request:**

```json
{
    "messages": [
        {
            "timestamp": "2023-03-01T10:15:00",
            "sender": "John",
            "content": "Let's meet tomorrow at 2pm",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T10:16:00",
            "sender": "Jane",
            "content": "Sure, I'll bring the documents",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        }
    ],
    "query": "meeting",
    "min_similarity": 0.3,
    "limit": 10,
    "with_explanation": true
}
```

**Response:**

```json
[
    {
        "message": {
            "timestamp": "2023-03-01T10:15:00",
            "sender": "John",
            "content": "Let's meet tomorrow at 2pm",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        "similarity": 0.85,
        "context": {
            "before": [],
            "after": ["Sure, I'll bring the documents"]
        },
        "explanation": "This message directly mentions a meeting arrangement with a specific time."
    }
]
```

### Find Similar Messages

Finds messages similar to a specific message.

**Endpoint:** `POST /api/search/similar`

**Request:**

```json
{
    "messages": [
        {
            "timestamp": "2023-03-01T10:15:00",
            "sender": "John",
            "content": "Let's meet tomorrow at 2pm",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T10:16:00",
            "sender": "Jane",
            "content": "Sure, I'll bring the documents",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T11:30:00",
            "sender": "John",
            "content": "Can we reschedule to 3pm instead?",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        }
    ],
    "message_id": 0,
    "min_similarity": 0.3,
    "limit": 10
}
```

**Response:**

```json
[
    {
        "message": {
            "timestamp": "2023-03-01T11:30:00",
            "sender": "John",
            "content": "Can we reschedule to 3pm instead?",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        "similarity": 0.75,
        "context": {
            "before": ["Sure, I'll bring the documents"],
            "after": []
        },
        "explanation": null
    }
]
```

### Get Topic Clusters

Groups messages into topic clusters and generates summaries.

**Endpoint:** `POST /api/search/topics`

**Request:**

```json
{
    "messages": [
        {
            "timestamp": "2023-03-01T10:15:00",
            "sender": "John",
            "content": "Let's meet tomorrow at 2pm",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T10:16:00",
            "sender": "Jane",
            "content": "Sure, I'll bring the documents",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T12:30:00",
            "sender": "John",
            "content": "Did you see the new movie?",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T12:35:00",
            "sender": "Jane",
            "content": "Yes, it was great!",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        }
    ]
}
```

**Response:**

```json
[
    {
        "topic_id": 0,
        "messages": [
            {
                "timestamp": "2023-03-01T10:15:00",
                "sender": "John",
                "content": "Let's meet tomorrow at 2pm",
                "message_type": "text",
                "duration": null,
                "url": null,
                "language": "en",
                "is_system_message": false
            },
            {
                "timestamp": "2023-03-01T10:16:00",
                "sender": "Jane",
                "content": "Sure, I'll bring the documents",
                "message_type": "text",
                "duration": null,
                "url": null,
                "language": "en",
                "is_system_message": false
            }
        ],
        "summary": "Planning a meeting for tomorrow at 2pm with document preparation."
    },
    {
        "topic_id": 1,
        "messages": [
            {
                "timestamp": "2023-03-01T12:30:00",
                "sender": "John",
                "content": "Did you see the new movie?",
                "message_type": "text",
                "duration": null,
                "url": null,
                "language": "en",
                "is_system_message": false
            },
            {
                "timestamp": "2023-03-01T12:35:00",
                "sender": "Jane",
                "content": "Yes, it was great!",
                "message_type": "text",
                "duration": null,
                "url": null,
                "language": "en",
                "is_system_message": false
            }
        ],
        "summary": "Discussion about a movie that both participants enjoyed."
    }
]
```

### Get Conversation Insights

Generates AI insights about the conversation.

**Endpoint:** `POST /api/search/insights`

**Request:**

```json
{
    "messages": [
        {
            "timestamp": "2023-03-01T10:15:00",
            "sender": "John",
            "content": "Let's meet tomorrow at 2pm",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T10:16:00",
            "sender": "Jane",
            "content": "Sure, I'll bring the documents",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T12:30:00",
            "sender": "John",
            "content": "Did you see the new movie?",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        },
        {
            "timestamp": "2023-03-01T12:35:00",
            "sender": "Jane",
            "content": "Yes, it was great!",
            "message_type": "text",
            "duration": null,
            "url": null,
            "language": "en",
            "is_system_message": false
        }
    ],
    "start_date": "2023-03-01T00:00:00",
    "end_date": "2023-03-02T00:00:00"
}
```

**Response:**

```json
{
    "insights": "This conversation contains two main topics: a work-related meeting scheduled for tomorrow at 2pm where documents will be shared, and a casual discussion about a movie that both participants enjoyed. The conversation shows a mix of professional planning and personal interests, indicating a friendly working relationship between John and Jane.",
    "timestamp": "2023-03-02T01:45:30.123Z"
}
```

## Error Responses

### Example Error Response

```json
{
    "detail": "Error message describing what went wrong"
}
```

## Message Object Structure

```json
{
    "timestamp": "2023-03-01T10:15:00", // ISO 8601 timestamp
    "sender": "John", // Sender name
    "content": "Hello", // Message content
    "message_type": "text", // Type: text, image, video, audio, etc.
    "duration": null, // Duration for audio/video (seconds)
    "url": null, // URL for media messages
    "language": "en", // Detected language code
    "is_system_message": false // Whether it's a system message
}
```

## Rate Limiting

The API currently does not implement rate limiting, but it's recommended to limit requests to a reasonable frequency to avoid overloading the server.

## Stateless API Design

This API follows a stateless design pattern where:

1. The client first processes a chat using `/api/chat/process`
2. The client stores the parsed messages
3. For subsequent operations, the client sends the stored messages with each request

This approach eliminates server-side state management, improving scalability and privacy.

## Deployment Considerations

-   Set appropriate CORS headers via the `ALLOWED_ORIGINS` environment variable
-   Configure the `GEMINI_API_KEY` for AI-powered features
-   Consider implementing authentication for production deployments
