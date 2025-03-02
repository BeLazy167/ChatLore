import {
    QueryClient,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { api } from "./api";

const queryClient = new QueryClient();
// Chat queries
export function useUploadChat(chatName: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file_text: string) => api.chat.process(file_text),
        onSuccess: (res) => {
            // Invalidate relevant queries when a new chat is uploaded
            queryClient.invalidateQueries({ queryKey: ["messages"] });
            queryClient.invalidateQueries({ queryKey: ["security"] });
            queryClient.invalidateQueries({ queryKey: ["topics"] });
            // create an array of chat names and save it to local storage

            if (!localStorage.getItem("chat_names")) {
                localStorage.setItem("chat_names", JSON.stringify([chatName]));
            } else {
                const chatNames = JSON.parse(
                    localStorage.getItem("chat_names") || "[]"
                );
                chatNames.push(chatName);
                localStorage.setItem("chat_names", JSON.stringify(chatNames));
            }
            localStorage.setItem(chatName, JSON.stringify(res.messages));
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
            const chatNames = JSON.parse(
                localStorage.getItem("chat_names") || "[]"
            );
            const processedChat = localStorage.getItem(chatNames[0]);
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
            const chatNames = JSON.parse(
                localStorage.getItem("chat_names") || "[]"
            );
            const processedChat = localStorage.getItem(chatNames[0]);
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
            const chatNames = JSON.parse(
                localStorage.getItem("chat_names") || "[]"
            );
            const processedChat = localStorage.getItem(chatNames[0]);
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
            const chatNames = JSON.parse(
                localStorage.getItem("chat_names") || "[]"
            );
            const processedChat = localStorage.getItem(chatNames[0]);
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

export function useSearchSimilarStateless(
    message: string,
    withExplanation: boolean,
    minSimilarity: number,
    resultLimit: number
) {
    return useMutation({
        mutationKey: ["searchSimilar", message],
        mutationFn: async () => {
            const chatNames = JSON.parse(
                localStorage.getItem("chat_names") || "[]"
            );
            const processedChat = localStorage.getItem(chatNames[0]);
            if (!processedChat) {
                return null;
            }
            return await api.search.similar(
                message,
                JSON.parse(processedChat),
                minSimilarity,
                resultLimit,
                withExplanation
            );
        },
    });
}

export { queryClient };
