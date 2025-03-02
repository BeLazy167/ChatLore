# ChatLore API Documentation v2

## Overview

ChatLore provides a stateless REST API for analyzing chat conversations, detecting sensitive information, and providing security insights. This document outlines the available endpoints, request/response formats, and usage examples.

## Base URL

```
https://api.chatlore.com/api
```

## Authentication

All API requests require an API key to be included in the header:

```
Authorization: Bearer YOUR_API_KEY
```

## Common Request Format

Most endpoints accept a list of messages in the following format:

```json
{
    "messages": [
        {
            "timestamp": "2023-03-01T12:34:56",
            "sender": "John Doe",
            "content": "Hello, how are you?",
            "message_type": "text"
        },
        {
            "timestamp": "2023-03-01T12:35:23",
            "sender": "Jane Smith",
            "content": "I'm good, thanks!",
            "message_type": "text"
        }
    ]
}
```

## API Endpoints

### Chat Processing

#### Process Chat Text

Processes chat text and returns structured message data.

-   **URL**: `/chat/process`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
        "text": "03/01/2023, 12:34 - John: Hello, how are you?\n03/01/2023, 12:35 - Jane: I'm good, thanks!"
    }
    ```
-   **Response**:
    ```json
    {
        "message": "Chat processed successfully",
        "total_messages": 2,
        "statistics": {
            "sender_count": 2,
            "date_range": {
                "start": "2023-03-01T12:34:00",
                "end": "2023-03-01T12:35:00"
            }
        },
        "messages": [
            {
                "timestamp": "2023-03-01T12:34:00",
                "sender": "John",
                "content": "Hello, how are you?",
                "message_type": "text"
            },
            {
                "timestamp": "2023-03-01T12:35:00",
                "sender": "Jane",
                "content": "I'm good, thanks!",
                "message_type": "text"
            }
        ]
    }
    ```

#### Get Messages with Pagination

Retrieves messages with pagination support.

-   **URL**: `/chat/messages`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "messages": [...],
      "page": 1,
      "page_size": 50,
      "start_date": "2023-01-01T00:00:00",
      "end_date": "2023-03-31T23:59:59"
    }
    ```
-   **Response**:
    ```json
    {
      "total": 120,
      "page": 1,
      "page_size": 50,
      "total_pages": 3,
      "messages": [...]
    }
    ```

#### Get Chat Statistics

Retrieves statistics about the chat.

-   **URL**: `/chat/stats`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "messages": [...]
    }
    ```
-   **Response**:
    ```json
    {
        "total_messages": 120,
        "active_days": 15,
        "message_per_day": 8,
        "sender_stats": {
            "John": 65,
            "Jane": 55
        },
        "busiest_day": "2023-03-15",
        "quietest_day": "2023-03-01",
        "time_distribution": {
            "morning": 30,
            "afternoon": 45,
            "evening": 35,
            "night": 10
        }
    }
    ```

### Security Analysis

#### Analyze Security

Analyzes chat messages for security concerns and sensitive data.

-   **URL**: `/security/analyze`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "messages": [...]
    }
    ```
-   **Response**:
    ```json
    {
      "security_score": 85.5,
      "total_findings": 3,
      "findings": [
        {
          "type": "sensitive_data_exposure",
          "risk_level": "high",
          "message": {...},
          "description": "Found sensitive data: email, phone",
          "message_index": 12,
          "sender": "John Doe",
          "timestamp": "2023-03-15T14:23:45"
        }
      ],
      "risk_levels": {
        "high": 1,
        "medium": 1,
        "low": 1
      },
      "recommendations": [
        {
          "title": "Protect email addresses",
          "description": "Email addresses can lead to spam or phishing attacks",
          "steps": ["Remove email addresses", "Use secure channels"],
          "priority": "high"
        }
      ]
    }
    ```

#### Get Sensitive Data

Retrieves all detected sensitive data from the chat.

-   **URL**: `/security/sensitive-data`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "messages": [...]
    }
    ```
-   **Response**:
    ```json
    {
        "email": ["john@example.com", "jane@example.com"],
        "phone": ["123-456-7890"],
        "credit_card": ["4111-1111-1111-1111"]
    }
    ```

#### Get Redacted Messages

Retrieves messages with sensitive data redacted.

-   **URL**: `/security/redacted`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "messages": [...]
    }
    ```
-   **Response**:
    ```json
    [
      {
        "original": {...},
        "redacted_content": "My email is [REDACTED EMAIL]"
      }
    ]
    ```

#### Get Security Insights

Generates comprehensive security insights from chat messages.

-   **URL**: `/security/insights`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "messages": [...]
    }
    ```
-   **Response**:
    ```json
    {
        "insights": [
            {
                "title": "Email Address Exposure",
                "description": "Email addresses were found in the conversation",
                "severity": "high",
                "impact": "Email addresses can be used for phishing attacks, spam, or identity theft",
                "recommendations": [
                    "Remove email addresses when sharing conversations",
                    "Use secure channels for sharing email addresses",
                    "Consider using masked or temporary email addresses"
                ],
                "examples": ["john@example.com", "jane@example.com"]
            }
        ],
        "metrics": {
            "securityScore": 75.5,
            "totalFindings": 3,
            "criticalCount": 0,
            "highCount": 2,
            "sensitiveDataCount": 5
        },
        "sensitiveData": {
            "email": {
                "count": 2,
                "examples": ["john@example.com", "jane@example.com"]
            },
            "phone": {
                "count": 1,
                "examples": ["123-456-7890"]
            }
        },
        "trends": [
            {
                "category": "High",
                "count": 2
            },
            {
                "category": "Email",
                "count": 2
            }
        ],
        "recommendations": [
            {
                "title": "Secure Sensitive Information",
                "description": "Remove or secure highly sensitive information found in your conversations",
                "impact": "Reduces risk of identity theft, financial fraud, and privacy violations",
                "priority": "high",
                "steps": [
                    "Review all conversations for sensitive data like credit cards and phone numbers",
                    "Delete or redact sensitive information",
                    "Use secure channels for sharing necessary sensitive information",
                    "Consider using encryption for highly sensitive communications"
                ]
            }
        ]
    }
    ```

#### Get Security Insights V2

Generates simplified and focused security insights with metrics, detailed insights, and trends.

-   **URL**: `/security/security-insight-2`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "messages": [...],
      "compare_with_previous": true
    }
    ```
-   **Response**:
    ```json
    {
        "metrics": {
            "overallScore": 85.5,
            "totalRisks": 3,
            "riskLevel": "medium",
            "highRiskCount": 1,
            "mediumRiskCount": 1,
            "lowRiskCount": 1,
            "sensitiveDataByType": {
                "email": 2,
                "phone": 1
            }
        },
        "insights": [
            {
                "title": "Email Address Exposure",
                "description": "Found 2 email addresses in the conversation that could be used for phishing attacks or identity theft.",
                "severity": "high",
                "recommendations": [
                    "Remove email addresses when sharing conversations",
                    "Use secure channels for sharing email addresses",
                    "Consider using masked or temporary email addresses"
                ]
            }
        ],
        "trends": [
            {
                "type": "Overall Security",
                "direction": "increasing",
                "changePercentage": 7.5,
                "period": "last 7 days",
                "description": "Overall security has been increasing by 7.5% over the last week."
            }
        ]
    }
    ```

### Search

#### Semantic Search

Performs semantic search on chat messages.

-   **URL**: `/search/semantic`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "messages": [...],
      "query": "meeting tomorrow",
      "min_similarity": 0.3,
      "limit": 10,
      "with_explanation": true
    }
    ```
-   **Response**:
    ```json
    [
      {
        "message": {...},
        "similarity": 0.85,
        "context": {
          "before": ["Let me check my calendar"],
          "after": ["I'll bring the documents"]
        },
        "explanation": "This message directly mentions a meeting scheduled for tomorrow"
      }
    ]
    ```

#### Get Topic Clusters

Identifies topic clusters in the conversation.

-   **URL**: `/search/topics`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "messages": [...]
    }
    ```
-   **Response**:
    ```json
    [
      {
        "topic_id": "meeting_planning",
        "messages": [...],
        "summary": "Discussion about planning the quarterly meeting"
      }
    ]
    ```

#### Get Conversation Insights

Provides insights about the conversation.

-   **URL**: `/search/insights`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "messages": [...],
      "start_date": "2023-01-01T00:00:00",
      "end_date": "2023-03-31T23:59:59"
    }
    ```
-   **Response**:
    ```json
    {
        "insights": "The conversation primarily revolves around project planning and scheduling meetings. There are frequent discussions about deadlines and resource allocation.",
        "timestamp": "2023-04-01T12:00:00"
    }
    ```

## Error Responses

All endpoints return standard HTTP status codes:

-   `200 OK`: Request successful
-   `400 Bad Request`: Invalid request parameters
-   `401 Unauthorized`: Invalid or missing API key
-   `429 Too Many Requests`: Rate limit exceeded
-   `500 Internal Server Error`: Server error

Error response body:

```json
{
    "error": "Invalid request parameters",
    "details": "The 'messages' field is required"
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per API key. The following headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1680355200
```

## Deployment Considerations

The API is designed to be stateless, meaning that all necessary data should be passed with each request. No data is stored on the server between requests.
