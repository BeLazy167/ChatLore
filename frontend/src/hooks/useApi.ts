import { Message } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface SecurityInsight {
    id: string;
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    category: string;
    generatedAt: string;
    recommendations: string[];
    relatedMessageIds?: string[];
    metadata?: Record<string, unknown>;
}

interface SecurityMetrics {
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

interface SecurityTrend {
    type: string;
    description: string;
    direction: "increasing" | "decreasing" | "stable";
    changePercentage: number;
    period: string;
    dataPoints: number[];
    timestamps: string[];
}

interface ConversationThread {
    id: string;
    title: string;
    messageIds: string[];
    startTime: string;
    endTime: string;
    participants: string[];
    topics: string[];
    sentiment: "positive" | "negative" | "neutral";
}

interface ChatResponse {
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
    };
}

const API_BASE_URL = "http://localhost:8000";

// Security Insights Hook
export const useSecurityInsights = (messages: Message[]) => {
    return useQuery<{
        insights: SecurityInsight[];
        metrics: SecurityMetrics;
        trends: SecurityTrend[];
    }>({
        queryKey: ["securityInsights"],
        queryFn: async () => {
            const response = await axios.post(
                `${API_BASE_URL}/api/chat/security`,
                {
                    messages: messages,
                }
            );
            return response.data;
        },
    });
};

// Conversation Threads Hook
export const useConversationThreads = () => {
    return useQuery<{ threads: ConversationThread[] }>({
        queryKey: ["threads"],
        queryFn: async () => {
            const response = await axios.get(
                `${API_BASE_URL}/api/chat/threads`
            );
            return response.data;
        },
    });
};

// Chat Upload Hook
export const useChatUpload = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("chatFile", file);

            const response = await axios.post(
                `${API_BASE_URL}/api/chat/parse`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        },
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["securityInsights"] });
            queryClient.invalidateQueries({ queryKey: ["threads"] });
        },
    });
};

// Chat Question Hook
export const useChatQuestion = () => {
    return useMutation({
        mutationFn: async (question: string) => {
            const response = await axios.post(`${API_BASE_URL}/api/chat/ask`, {
                question,
            });
            return response.data as ChatResponse;
        },
    });
};
