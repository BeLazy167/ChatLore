import {
    QueryClient,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { api } from "./api";

const queryClient = new QueryClient();
// Chat queries
export function useUploadChat() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file_text: string) => api.chat.process(file_text),
        onSuccess: (res) => {
            // Invalidate relevant queries when a new chat is uploaded
            queryClient.invalidateQueries({ queryKey: ["messages"] });
            queryClient.invalidateQueries({ queryKey: ["security"] });
            queryClient.invalidateQueries({ queryKey: ["topics"] });
            localStorage.setItem(
                "processed_chat",
                JSON.stringify(res.messages)
            );
        },
        onError: (error) => {
            console.error("Error uploading chat:", error);
        },
    });
}

export function useSecurityAnalysisStateless() {
    return useQuery({
        queryKey: ["analytics"],
        queryFn: async () => {
            const processedChat = localStorage.getItem("processed_chat");
            if (!processedChat) {
                return null;
            }
            return await api.security.analyze(JSON.parse(processedChat));
        },
    });
}

//this is for das

export function useSecurityInsightsStateless() {
    return useQuery({
        queryKey: ["securityInsights"],
        queryFn: async () => {
            const processedChat = localStorage.getItem("processed_chat");
            if (!processedChat) {
                return null;
            }
            return await api.security.getInsights(JSON.parse(processedChat));
        },
    });
}

//this is for insights
export function useSecurityInsightsV2Stateless() {
    return useQuery({
        queryKey: ["securityInsightsv2"],
        queryFn: async () => {
            const processedChat = localStorage.getItem("processed_chat");
            if (!processedChat) {
                return null;
            }
            return await api.security.getInsightsV2(JSON.parse(processedChat));
        },
    });
}

export function useSearchSemanticStateless(
    query: string,
    minSimilarity: number,
    resultLimit: number,
    withExplanation: boolean
) {
    return useMutation({
        mutationKey: ["searchSemantic", query],
        mutationFn: async () => {
            const processedChat = localStorage.getItem("processed_chat");
            if (!processedChat) {
                return null;
            }
            return await api.search.semantic(
                query,
                JSON.parse(processedChat),
                minSimilarity,
                resultLimit,
                withExplanation
            );
        },
        onSuccess: (data) => {
            // Optional: you can add any success handling here if needed
            console.log("Search completed successfully", data);
        },
        onError: (error) => {
            console.error("Error performing semantic search:", error);
        },
    });
}
export { queryClient };
