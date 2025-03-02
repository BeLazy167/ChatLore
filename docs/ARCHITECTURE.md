# ChatLore Architecture Documentation

This document provides a detailed overview of ChatLore's architecture, explaining the system design, components, data flow, and technical decisions.

## System Overview

ChatLore is designed with a privacy-first architecture that processes sensitive chat data securely while providing powerful analysis capabilities. The system consists of five main layers:

1. **Data Processing Layer**: Handles chat data parsing and initial processing
2. **Analysis Layer**: Identifies sensitive information and security risks
3. **Context Engine**: Builds semantic understanding of conversations
4. **Query Layer**: Processes search queries and questions
5. **Presentation Layer**: Provides user interface and visualization

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Presentation Layer                          │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │ Chat Interface│  │Security Insights│ │Sensitive Data View│    │
│  └───────────────┘  └───────────────┘  └───────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Query Layer                              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │Semantic Search│  │Question Answer│  │Context Retrieval   │    │
│  └───────────────┘  └───────────────┘  └───────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Context Engine                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │Vector Database│  │Semantic Models│  │Thread Detection   │    │
│  └───────────────┘  └───────────────┘  └───────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Analysis Layer                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │Sensitive Data │  │Security Risk  │  │Pattern Recognition│    │
│  │Detection      │  │Analysis       │  │                   │    │
│  └───────────────┘  └───────────────┘  └───────────────────┘    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Processing Layer                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │WhatsApp Parser│  │Data Validation│  │Message Normalization│   │
│  └───────────────┘  └───────────────┘  └───────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Data Processing Layer

#### WhatsApp Parser

-   **Purpose**: Parses WhatsApp chat exports into structured data
-   **Implementation**: Custom regex-based parser that handles WhatsApp's export format
-   **Key Features**:
    -   Extracts message metadata (sender, timestamp)
    -   Identifies message types (text, media, system)
    -   Handles multi-line messages and special characters

#### Data Validation

-   **Purpose**: Ensures data integrity and format consistency
-   **Implementation**: Schema validation using Pydantic models
-   **Key Features**:
    -   Validates message structure
    -   Handles edge cases and malformed data
    -   Provides error reporting for invalid data

#### Message Normalization

-   **Purpose**: Standardizes message format for analysis
-   **Implementation**: Text processing pipeline using NLTK and custom rules
-   **Key Features**:
    -   Normalizes text (lowercase, whitespace)
    -   Handles emoji and special characters
    -   Prepares text for embedding generation

### Analysis Layer

#### Sensitive Data Detection

-   **Purpose**: Identifies personal and sensitive information in messages
-   **Implementation**: Combination of regex patterns, NER models, and heuristics
-   **Key Features**:
    -   Detects phone numbers, emails, addresses
    -   Identifies financial information (credit cards, account numbers)
    -   Recognizes personal identifiers (names, IDs)

#### Security Risk Analysis

-   **Purpose**: Analyzes conversations for potential security risks
-   **Implementation**: Rule-based system with ML classification
-   **Key Features**:
    -   Identifies shared credentials and passwords
    -   Detects potentially unsafe links
    -   Recognizes patterns of information disclosure

#### Pattern Recognition

-   **Purpose**: Identifies recurring patterns and anomalies in conversations
-   **Implementation**: Statistical analysis and clustering algorithms
-   **Key Features**:
    -   Detects unusual message patterns
    -   Identifies information sharing trends
    -   Recognizes potential security anomalies

### Context Engine

#### Vector Database

-   **Purpose**: Stores and retrieves message embeddings for semantic search
-   **Implementation**: In-memory vector store with similarity search
-   **Key Features**:
    -   Efficient similarity search
    -   Contextual message retrieval
    -   Support for semantic queries

#### Semantic Models

-   **Purpose**: Generates embeddings and semantic understanding of messages
-   **Implementation**: Google Gemini for embedding generation and semantic analysis
-   **Key Features**:
    -   High-quality text embeddings
    -   Semantic understanding of message content
    -   Support for multiple languages

#### Thread Detection

-   **Purpose**: Identifies conversation threads and topics
-   **Implementation**: Clustering and topic modeling algorithms
-   **Key Features**:
    -   Groups related messages into threads
    -   Identifies conversation topics
    -   Provides temporal context for messages

### Query Layer

#### Semantic Search

-   **Purpose**: Enables context-aware search of messages
-   **Implementation**: Vector similarity search with relevance ranking
-   **Key Features**:
    -   Semantic understanding of search queries
    -   Context-aware results ranking
    -   Support for natural language queries

#### Question Answering

-   **Purpose**: Answers questions about chat content
-   **Implementation**: RAG (Retrieval-Augmented Generation) with Google Gemini
-   **Key Features**:
    -   Retrieves relevant context for questions
    -   Generates accurate answers based on chat content
    -   Handles complex and nuanced questions

#### Context Retrieval

-   **Purpose**: Provides surrounding context for messages
-   **Implementation**: Custom context window algorithm
-   **Key Features**:
    -   Retrieves messages before and after a target message
    -   Identifies related messages across time
    -   Provides conversation flow understanding

### Presentation Layer

#### Chat Interface

-   **Purpose**: Provides interactive chat-like interface for queries
-   **Implementation**: React-based UI with real-time updates
-   **Key Features**:
    -   Natural conversation flow
    -   Message threading and context display
    -   Support for various query types

#### Security Insights

-   **Purpose**: Visualizes security analysis results
-   **Implementation**: Interactive dashboard with risk metrics
-   **Key Features**:
    -   Security score visualization
    -   Risk breakdown by category
    -   Actionable recommendations

#### Sensitive Data View

-   **Purpose**: Displays and manages sensitive information
-   **Implementation**: Interactive UI with redaction controls
-   **Key Features**:
    -   Highlights sensitive information
    -   Provides redaction capabilities
    -   Allows user control over visibility

## Data Flow

1. **Chat Upload**: User uploads WhatsApp chat export
2. **Parsing & Processing**: System parses and normalizes the chat data
3. **Analysis**: Sensitive data detection and security analysis are performed
4. **Embedding Generation**: Messages are converted to vector embeddings
5. **Context Building**: Conversation threads and topics are identified
6. **User Interaction**: User interacts with the system through search or questions
7. **Query Processing**: System retrieves relevant context and generates responses
8. **Result Presentation**: Results are displayed in the UI with appropriate context

## Privacy and Security Considerations

### Local Processing

-   Sensitive operations are performed locally when possible
-   Minimizes data transfer to external services

### Secure API Design

-   API endpoints designed with minimal data exposure
-   Only necessary data is sent for remote processing

### Data Minimization

-   System only processes required data for each operation
-   Unnecessary sensitive information is excluded from processing

### User Control

-   Users have control over what data is analyzed
-   Redaction capabilities for sharing and export

## Technical Decisions

### Why Google Gemini?

-   Superior performance for semantic understanding
-   Strong multilingual capabilities
-   Efficient embedding generation
-   Excellent question-answering capabilities

### Why FastAPI?

-   High performance for API endpoints
-   Native async support for efficient processing
-   Strong typing with Pydantic integration
-   Excellent documentation and OpenAPI support

### Why React with TypeScript?

-   Type safety for complex UI components
-   Improved developer experience and code quality
-   Strong ecosystem and component libraries
-   Efficient rendering for interactive UI

## Scalability and Performance

### Current Limitations

-   In-memory vector store limits chat size
-   Processing time increases with chat size
-   Some operations require significant CPU resources

### Optimization Strategies

-   Chunking large chats for incremental processing
-   Caching intermediate results for frequent operations
-   Parallel processing for independent operations

### Future Scalability Plans

-   Persistent vector storage for larger chats
-   Distributed processing for heavy operations
-   Optimized embedding models for faster processing

## Conclusion

ChatLore's architecture is designed to provide powerful chat analysis capabilities while prioritizing user privacy and security. The layered approach allows for modular development and clear separation of concerns, while the privacy-first design ensures sensitive data is handled responsibly.
