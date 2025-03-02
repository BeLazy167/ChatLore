import {
    useMutation,
    useQuery,
    useQueryClient,
    QueryClient,
} from "@tanstack/react-query";
import {
    api,
    Message,
    SecurityAnalysis,
    SensitiveData,
    RedactedMessage,
    TopicCluster,
} from "./api";

// Chat queries
export function useUploadChat() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => api.chat.upload(file),
        onSuccess: () => {
            // Invalidate relevant queries when a new chat is uploaded
            queryClient.invalidateQueries({ queryKey: ["messages"] });
            queryClient.invalidateQueries({ queryKey: ["security"] });
            queryClient.invalidateQueries({ queryKey: ["topics"] });
        },
    });
}

export function useSecurityAnalysis(messages: Message[]) {
    return useQuery<SecurityAnalysis>({
        queryKey: ["security", "analysis", messages.length],
        queryFn: () => api.security.analyze(messages),
        enabled: messages.length > 0,
    });
}

export function useSensitiveData(messages: Message[]) {
    return useQuery<SensitiveData>({
        queryKey: ["security", "sensitiveData", messages.length],
        queryFn: () => api.security.getSensitiveData(messages),
        enabled: messages.length > 0,
    });
}

export function useRedactedMessages(messages: Message[]) {
    return useQuery<RedactedMessage[]>({
        queryKey: ["security", "redacted", messages.length],
        queryFn: () => api.security.getRedactedMessages(messages),
        enabled: messages.length > 0,
    });
}

// Search queries
export function useTopicClusters(messages: Message[]) {
    return useQuery<TopicCluster[]>({
        queryKey: ["search", "topics", messages.length],
        queryFn: () => api.search.getTopicClusters(messages),
        enabled: messages.length > 0,
    });
}

export function useSearchMessages(
    query: string,
    messages: Message[],
    min_similarity: number = 0.3,
    limit: number = 10,
    with_explanation: boolean = false
) {
    return useQuery<Message[]>({
        queryKey: [
            "search",
            "messages",
            query,
            messages.length,
            min_similarity,
            limit,
            with_explanation,
        ],
        queryFn: () =>
            api.search.searchMessages(
                query,
                messages,
                min_similarity,
                limit,
                with_explanation
            ),
        enabled: query.length > 0 && messages.length > 0,
    });
}

export function useConversationThreads(messages: Message[]) {
    return useQuery({
        queryKey: ["threads", messages.length],
        queryFn: () => api.chat.getThreads(messages),
        enabled: messages.length > 0,
    });
}

// For backward compatibility
export const useSecurityAnalysisStateless = useSecurityAnalysis;
export const useSensitiveDataStateless = useSensitiveData;
export const useRedactedMessagesStateless = useRedactedMessages;
export const useTopicClustersStateless = useTopicClusters;
export const useSearchMessagesStateless = useSearchMessages;

// Create a client
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
});
