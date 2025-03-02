import axios from "axios";

// API base URL - change this to your production URL when deploying
const API_BASE_URL = "http://localhost:8000/api";

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Types for API responses
export interface ChatStatistics {
    total_messages: number;
    participants: string[];
    media_count: number;
    date_range: {
        start: string;
        end: string;
    };
    activity_by_hour: Record<string, number>;
    activity_by_date: Record<string, number>;
    participant_stats: Record<
        string,
        {
            message_count: number;
            word_count: number;
            media_count: number;
        }
    >;
}

export interface ProcessChatResponse {
    message: string;
    total_messages: number;
    statistics: ChatStatistics;
    messages: Message[];
}

export interface Message {
    id?: string;
    timestamp: string;
    sender: string;
    content: string;
    message_type: string;
    duration?: string | null;
    url?: string | null;
    language?: string;
    is_system_message: boolean;
}

export interface MessageContext {
    before: string[];
    after: string[];
}

export interface SearchResult {
    message: Message;
    similarity: number;
    context: MessageContext;
    explanation?: string;
}

export interface SecurityAnalysis {
    security_score: number;
    total_findings: number;
    findings: Array<{
        type: string;
        description: string;
        message_index: number;
        risk_level: string;
        sender: string;
        timestamp: string;
    }>;
    risk_levels: {
        high: number;
        medium: number;
        low: number;
    };
    recommendations: Array<{
        title: string;
        description: string;
    }>;
}

export interface SensitiveData {
    [key: string]: string[];
}

export interface RedactedMessage {
    original: Message;
    redacted_content: string;
}

export interface TopicCluster {
    topic_id: number;
    messages: Message[];
    summary: string;
}

export interface ConversationInsights {
    insights: string;
    timestamp: string;
}

// API functions
export const api = {
    // Chat endpoints
    chat: {
        process: async (chatText: string): Promise<ProcessChatResponse> => {
            const response = await apiClient.post("/chat/process", {
                chat_text: chatText,
            });
            return response.data;
        },

        getMessages: async (
            messages: Message[],
            skip: number = 0,
            limit: number = 10
        ): Promise<Message[]> => {
            const response = await apiClient.post("/chat/messages", {
                messages,
                skip,
                limit,
            });
            return response.data;
        },

        getStats: async (messages: Message[]): Promise<ChatStatistics> => {
            const response = await apiClient.post("/chat/stats", {
                messages,
            });
            return response.data;
        },
    },

    // Security endpoints
    security: {
        analyze: async (messages: Message[]): Promise<SecurityAnalysis> => {
            const response = await apiClient.post("/security/analyze", {
                messages,
            });
            return response.data;
        },

        getSensitiveData: async (
            messages: Message[]
        ): Promise<SensitiveData> => {
            const response = await apiClient.post("/security/sensitive-data", {
                messages,
            });
            return response.data;
        },

        getRedactedMessages: async (
            messages: Message[]
        ): Promise<RedactedMessage[]> => {
            const response = await apiClient.post("/security/redacted", {
                messages,
            });
            return response.data;
        },
    },

    // Search endpoints
    search: {
        semantic: async (
            query: string,
            messages: Message[],
            min_similarity: number = 0.3,
            limit: number = 10,
            with_explanation: boolean = false
        ): Promise<SearchResult[]> => {
            const response = await apiClient.post("/search/semantic", {
                query,
                messages,
                min_similarity,
                limit,
                with_explanation,
            });
            return response.data;
        },

        similar: async (
            message_id: number,
            messages: Message[],
            min_similarity: number = 0.3,
            limit: number = 10
        ): Promise<SearchResult[]> => {
            const response = await apiClient.post("/search/similar", {
                message_id,
                messages,
                min_similarity,
                limit,
            });
            return response.data;
        },

        getTopicClusters: async (
            messages: Message[]
        ): Promise<TopicCluster[]> => {
            const response = await apiClient.post("/search/topics", {
                messages,
            });
            return response.data;
        },

        getInsights: async (
            messages: Message[],
            start_date?: string,
            end_date?: string
        ): Promise<ConversationInsights> => {
            const response = await apiClient.post("/search/insights", {
                messages,
                start_date,
                end_date,
            });
            return response.data;
        },
    },
};

export default api;
