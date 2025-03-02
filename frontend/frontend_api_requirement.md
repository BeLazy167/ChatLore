# ChatLore Frontend API Requirements

This document outlines the API endpoints and request/response formats expected by the frontend application. Backend developers should implement these endpoints to ensure compatibility with the frontend.

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, no authentication is implemented. All endpoints are publicly accessible.

## Endpoints

### Chat Endpoints

#### 1. Upload Chat

-   **URL**: `/chat/upload`
-   **Method**: `POST`
-   **Content-Type**: `multipart/form-data`
-   **Request Body**:
    -   `file`: File (WhatsApp chat export)
-   **Response**:
    ```typescript
    {
        message: string;
        total_messages: number;
        participants: Record<string, number>;
        media_count: Record<string, number>;
        activity: {
            by_hour: Record<string, number>;
            by_date: Record<string, number>;
        }
    }
    ```

#### 2. Process Chat Text

-   **URL**: `/chat/process`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Request Body**:
    ```typescript
    {
        chat_text: string;
    }
    ```
-   **Response**:
    ```typescript
    {
      messages: Message[];
      participants: string[];
      media_count: Record<string, number>;
    }
    ```

#### 3. Get Messages

-   **URL**: `/chat/messages`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Request Body**:
    ```typescript
    {
      messages: Message[];
    }
    ```
-   **Response**: `Message[]`

#### 4. Ask Question

-   **URL**: `/chat/ask`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Request Body**:
    ```typescript
    {
      question: string;
      chatId?: string;
      messages?: Message[];
    }
    ```
-   **Response**:
    ```typescript
    {
        success: boolean;
        response: {
            answer: string;
            relevantMessages: Array<{
                sender: string;
                content: string;
                [key: string]: unknown;
            }>;
            confidence: number;
            timestamp: Date;
        }
    }
    ```

#### 5. Get Conversation Threads

-   **URL**: `/chat/threads`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Request Body**:
    ```typescript
    {
      messages: Message[];
    }
    ```
-   **Response**:
    ```typescript
    {
        threads: Array<{
            id: string;
            title: string;
            messageIds: string[];
            startTime: string;
            endTime: string;
            participants: string[];
            topics: string[];
            sentiment: "positive" | "negative" | "neutral";
        }>;
    }
    ```

#### 6. Parse Chat File

-   **URL**: `/chat/parse`
-   **Method**: `POST`
-   **Content-Type**: `multipart/form-data`
-   **Request Body**:
    -   `chatFile`: File
-   **Response**: Same as `/chat/upload`

#### 7. Get Security Insights

-   **URL**: `/chat/security`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Request Body**:
    ```typescript
    {
      messages: Message[];
    }
    ```
-   **Response**:
    ```typescript
    {
        insights: Array<{
            id: string;
            title: string;
            description: string;
            severity: "high" | "medium" | "low";
            category: string;
            generatedAt: string;
            recommendations: string[];
            relatedMessageIds?: string[];
            metadata?: Record<string, unknown>;
        }>;
        metrics: {
            overallScore: number;
            riskLevel: "high" | "medium" | "low";
            highRiskCount: number;
            mediumRiskCount: number;
            lowRiskCount: number;
            totalRisks: number;
            risksByType: Record<string, number>;
            sensitiveDataByType: Record<string, number>;
            generatedAt: string;
        }
        trends: Array<{
            type: string;
            description: string;
            direction: "increasing" | "decreasing" | "stable";
            changePercentage: number;
            period: string;
            dataPoints: number[];
            timestamps: string[];
        }>;
    }
    ```

### Security Endpoints

#### 1. Analyze Security

-   **URL**: `/security/analyze`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Request Body**:
    ```typescript
    {
      messages: Message[];
    }
    ```
-   **Response**:
    ```typescript
    {
        security_score: number;
        total_findings: number;
        findings: Array<{
            type: string;
            message: Record<string, unknown>;
            sensitive_data: Record<string, string[]>;
            risk_level: string;
        }>;
        risk_levels: {
            high: number;
            medium: number;
            low: number;
        }
        recommendations: Array<{
            title: string;
            description: string;
            steps: string[];
            priority: string;
        }>;
    }
    ```

#### 2. Get Sensitive Data

-   **URL**: `/security/sensitive-data`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Request Body**:
    ```typescript
    {
      messages: Message[];
    }
    ```
-   **Response**:
    ```typescript
    {
      [key: string]: string[];
    }
    ```

#### 3. Get Redacted Messages

-   **URL**: `/security/redacted`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Request Body**:
    ```typescript
    {
      messages: Message[];
    }
    ```
-   **Response**:
    ```typescript
    Array<{
        original: Message;
        redacted_content: string;
    }>;
    ```

### Search Endpoints

#### 1. Get Topic Clusters

-   **URL**: `/search/topics`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Request Body**:
    ```typescript
    {
      messages: Message[];
    }
    ```
-   **Response**:
    ```typescript
    Array<{
        id: string;
        messages: Message[];
        summary: string;
    }>;
    ```

#### 2. Search Messages

-   **URL**: `/search/messages`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Request Body**:
    ```typescript
    {
      query: string;
      messages: Message[];
      min_similarity?: number; // default: 0.3
      limit?: number; // default: 10
      with_explanation?: boolean; // default: false
    }
    ```
-   **Response**: `Message[]`

#### 3. Context-Aware Search

-   **URL**: `/search/similar`
-   **Method**: `POST`
-   **Content-Type**: `application/json`
-   **Request Body**:
    ```typescript
    {
      query: string;
      messages: Message[];
      min_similarity?: number; // default: 0.3
      limit?: number; // default: 10
      with_explanation?: boolean; // default: false
      message_id?: string; // Required field
    }
    ```
-   **Response**: `Message[]`

## Data Types

### Message

```typescript
interface Message {
    id?: string;
    timestamp: string; // ISO format: "2023-11-01T17:21:52"
    sender: string;
    content: string;
    message_type: string; // e.g., "text", "image", "video"
    duration?: string; // For audio/video
    url?: string; // For media
    language?: string; // e.g., "en"
    is_system_message: boolean;
}
```

## Important Notes

1. All endpoints except for file uploads use JSON for request and response bodies.
2. File upload endpoints use `multipart/form-data`.
3. The `/search/similar` endpoint requires a `message_id` field in the request body.
4. All timestamps should be in ISO format.
5. The frontend expects all responses to follow the exact structure defined above.
