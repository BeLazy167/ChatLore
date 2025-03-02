# TanStack Query Implementation for ChatLore

This document explains how we've implemented TanStack Query (React Query) to handle API communication in the ChatLore application.

## Overview

TanStack Query is a powerful data fetching and state management library for React applications. It provides a clean, declarative way to fetch, cache, and update data in your application.

In ChatLore, we use TanStack Query to:

1. Fetch data from the backend API
2. Cache responses for better performance
3. Handle loading and error states
4. Automatically refetch data when needed
5. Invalidate and update the cache when data changes

## Implementation Details

### 1. API Client (`src/lib/api.ts`)

The API client provides a clean interface for making requests to the backend. It:

-   Uses Axios for HTTP requests
-   Defines TypeScript interfaces for API responses
-   Provides both stateful and stateless versions of each endpoint
-   Organizes endpoints by feature (chat, security, search)

```typescript
// Example API function
export const api = {
    security: {
        analyze: async (): Promise<SecurityAnalysis> => {
            const response = await apiClient.get("/security/analyze");
            return response.data;
        },

        // Stateless version that accepts messages directly
        analyzeStateless: async (
            messages: any[]
        ): Promise<SecurityAnalysis> => {
            const response = await apiClient.post(
                "/security/analyze/stateless",
                { messages }
            );
            return response.data;
        },
    },
    // ...
};
```

### 2. Query Hooks (`src/lib/queries.ts`)

The query hooks provide React components with an easy way to use the API. They:

-   Wrap the API client with TanStack Query's `useQuery` and `useMutation` hooks
-   Handle caching, loading states, and error handling
-   Provide automatic refetching and cache invalidation
-   Support both stateful and stateless API endpoints

```typescript
// Example query hook
export function useSecurityAnalysis() {
    return useQuery<SecurityAnalysis>({
        queryKey: ["security", "analysis"],
        queryFn: () => api.security.analyze(),
    });
}

export function useSecurityAnalysisStateless(messages: any[]) {
    return useQuery<SecurityAnalysis>({
        queryKey: ["security", "analysis", "stateless", messages.length],
        queryFn: () => api.security.analyzeStateless(messages),
        enabled: messages.length > 0,
    });
}
```

### 3. QueryClientProvider (`src/main.tsx`)

The QueryClientProvider sets up the TanStack Query client and makes it available to all components:

```typescript
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queries";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    </StrictMode>
);
```

### 4. Component Usage

Components can use the query hooks to fetch and display data:

```typescript
function SecurityAnalysisPanel() {
    const { messages } = useChatContext();

    const {
        data: securityAnalysis,
        isLoading,
        error,
    } = useSecurityAnalysisStateless(messages);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage error={error} />;
    if (!securityAnalysis) return <EmptyState />;

    return <SecurityAnalysisDisplay data={securityAnalysis} />;
}
```

## Multi-User Support

This implementation supports multiple users by:

1. Using stateless API endpoints that accept data in the request body
2. Storing user data in the browser using IndexedDB
3. Sending the necessary data with each request
4. Not relying on server-side state

## Benefits

1. **Improved Performance**: Automatic caching reduces unnecessary network requests
2. **Better UX**: Built-in loading and error states make it easy to show feedback to users
3. **Reduced Boilerplate**: No need to manage loading/error states manually
4. **Automatic Updates**: Data is automatically refetched when needed
5. **Devtools**: ReactQueryDevtools make it easy to debug and inspect the cache

## Next Steps

1. Implement optimistic updates for mutations
2. Add retry logic for failed requests
3. Implement prefetching for common queries
4. Add pagination support for large datasets
