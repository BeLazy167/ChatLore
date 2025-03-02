# Browser-Based Database Implementation for ChatLore

This document explains the implementation of a browser-based database for ChatLore, which allows the application to work with multiple users in a deployed environment without requiring server-side user management.

## Overview

ChatLore now uses IndexedDB, a low-level browser API, to store chat data locally in the user's browser. This approach has several advantages:

1. **Privacy-First**: All data remains on the user's device, aligning with ChatLore's privacy-focused design.
2. **Multi-User Support**: Each user's browser maintains its own database, allowing multiple users to use the application independently.
3. **Offline Capability**: Users can access their chat data even when offline.
4. **Persistence**: Data persists between sessions without requiring server-side storage.

## Implementation Details

### Database Schema

The database is structured with the following object stores:

-   **chats**: Stores metadata about uploaded chat files
-   **messages**: Stores individual messages from chat files
-   **sensitiveData**: Stores detected sensitive information
-   **securityAnalysis**: Stores security analysis results
-   **contextData**: Stores parser context and other application state

### Key Components

1. **IndexedDB Wrapper (`db.ts`)**: Provides a type-safe API for interacting with IndexedDB, handling database initialization, upgrades, and CRUD operations.

2. **Chat Context Provider (`ChatContext.tsx`)**: A React context that manages the application state and provides methods for interacting with the database.

3. **Component Integration**: UI components use the Chat Context to read and write data.

## How It Works with Multiple Users

When ChatLore is deployed:

1. Each user accesses the application through their own browser.
2. When a user uploads a chat file, it's processed by the backend API.
3. The processed data is stored in the user's browser using IndexedDB.
4. All subsequent interactions with that data happen locally in the user's browser.
5. The backend API is used only for processing tasks, not for storing user data.

This approach allows multiple users to use ChatLore simultaneously without their data interfering with each other, even though they're using the same backend API.

## API Interaction Flow

1. **Chat Upload**:

    - User uploads a chat file through the UI
    - Frontend sends the file to the backend API for processing
    - Backend processes the file and returns structured data
    - Frontend stores this data in the local IndexedDB

2. **Security Analysis**:

    - User requests security analysis
    - Frontend retrieves the chat data from IndexedDB
    - Frontend sends the data to the backend API for analysis
    - Backend performs analysis and returns results
    - Frontend stores the results in IndexedDB and displays them

3. **Search and Retrieval**:
    - All search and retrieval operations first check the local IndexedDB
    - If processing is needed, the data is sent to the backend API
    - Results are stored locally for future use

## Benefits for Deployment

This architecture provides several benefits for a deployed environment:

1. **Scalability**: The backend handles stateless processing tasks, making it easier to scale.
2. **Reduced Server Load**: Most data operations happen client-side, reducing server load.
3. **Privacy**: Sensitive user data remains on their devices.
4. **No Authentication Required**: Users don't need accounts to use the application.

## Limitations

1. **Storage Limits**: IndexedDB has storage limits that vary by browser (typically 50MB-2GB).
2. **Browser Support**: While IndexedDB is supported in all modern browsers, older browsers may have issues.
3. **Data Portability**: Data stored in one browser is not accessible from another browser or device.

## Future Improvements

1. **Data Export/Import**: Allow users to export their data and import it on other devices.
2. **Sync Capability**: Optional account creation for syncing data across devices.
3. **Storage Management**: Tools to manage storage usage and clean up old data.

## Dependencies

-   **idb**: A tiny library that makes IndexedDB usable by wrapping it in a promise-based API.
-   **uuid**: For generating unique identifiers for database records.

## Installation

To use this implementation, make sure to install the required dependencies:

```bash
npm install idb uuid
# or
yarn add idb uuid
```
