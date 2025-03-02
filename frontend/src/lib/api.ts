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
    active_days: number;
    message_per_day: number;
    sender_stats: Record<string, number>;
    busiest_day: string;
    quietest_day: string;
    time_distribution: {
        morning: number;
        afternoon: number;
        evening: number;
        night: number;
    };
}

export interface ProcessChatResponse {
    message: string;
    total_messages: number;
    statistics: {
        sender_count: number;
        date_range: {
            start: string;
            end: string;
        };
    };
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

export interface TimeContext {
    same_sender_messages: Message[];
    time_window_messages: Message[];
}

export interface ContextResponse {
    message: Message;
    context: MessageContext;
    time_context: TimeContext;
}

export interface SearchResult {
    message: Message;
    similarity: number;
    context: MessageContext;
    explanation?: string | null;
}

export interface SecurityFinding {
    type: string;
    risk_level: string;
    message: Message;
    description?: string;
    message_index?: number;
    sender?: string;
    timestamp?: string;
}

export interface RiskLevels {
    high: number;
    medium: number;
    low: number;
}

export interface SecurityRecommendation {
    title: string;
    description: string;
    steps?: string[];
    priority?: string;
}

export interface SecurityAnalysis {
    security_score: number;
    total_findings: number;
    findings: SecurityFinding[];
    risk_levels: RiskLevels;
    recommendations: SecurityRecommendation[];
}

export interface SensitiveData {
    [key: string]: string[];
}

export interface RedactedMessage {
    original: Message;
    redacted_content: string;
}

export interface TopicCluster {
    topic_id: string;
    messages: Message[];
    summary: string;
}

export interface ConversationInsights {
    insights: string;
    timestamp: string;
}

// Security Insights interfaces
export interface SecurityInsightItem {
    title: string;
    description: string;
    severity: string;
    impact: string;
    recommendations: string[];
    examples?: string[];
}

export interface SecurityMetrics {
    securityScore: number;
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    sensitiveDataCount: number;
}

export interface SensitiveDataItem {
    count: number;
    examples: string[];
}

export interface SecurityTrend {
    category: string;
    count: number;
}

export interface SecurityRecommendationDetail {
    title: string;
    description: string;
    impact: string;
    priority: string;
    steps: string[];
}

export interface SecurityInsightsResponse {
    insights: SecurityInsightItem[];
    metrics: SecurityMetrics;
    sensitiveData: Record<string, SensitiveDataItem>;
    trends: SecurityTrend[];
    recommendations: SecurityRecommendationDetail[];
}

// Security Insights V2 interfaces
export interface SecurityInsight2 {
    title: string;
    description: string;
    severity: string;
    recommendations: string[];
}

export interface SecurityMetrics2 {
    overallScore: number;
    totalRisks: number;
    riskLevel: string;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    sensitiveDataByType: Record<string, number>;
}

export interface SecurityTrend2 {
    type: string;
    direction: string;
    changePercentage: number;
    period: string;
    description: string;
}

export interface SecurityInsightsResponse2 {
    metrics: SecurityMetrics2;
    insights: SecurityInsight2[];
    trends: SecurityTrend2[];
    recommendations: SecurityRecommendationDetail[];
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
    },

    // Security endpoints
    security: {
        analyze: async (messages: Message[]): Promise<SecurityAnalysis> => {
            const response = await apiClient.post("/security/analyze", {
                messages,
            });
            return response.data;
        },

        // getSensitiveData: async (
        //     messages: Message[]
        // ): Promise<SensitiveData> => {
        //     const response = await apiClient.post("/security/sensitive-data", {
        //         messages,
        //     });
        //     return response.data;
        // },

        // getRedactedMessages: async (
        //     messages: Message[]
        // ): Promise<RedactedMessage[]> => {
        //     const response = await apiClient.post("/security/redacted", {
        //         messages,
        //     });
        //     return response.data;
        // },

        getInsights: async (
            messages: Message[]
        ): Promise<SecurityInsightsResponse> => {
            const response = await apiClient.post("/security/insights", {
                messages,
            });
            return response.data;
        },

        getInsightsV2: async (
            messages: Message[],
            compare_with_previous: boolean = false
        ): Promise<SecurityInsightsResponse2> => {
            const response = await apiClient.post(
                "/security/security-insight-2",
                {
                    messages,
                    compare_with_previous,
                }
            );
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
            message: string,
            messages: Message[],
            min_similarity: number = 0.3,
            limit: number = 10,
            with_explanation: boolean = false
        ): Promise<SearchResult[]> => {
            const response = await apiClient.post("/search/similar", {
                message,
                messages,
                min_similarity,
                limit,
                with_explanation,
            });
            return response.data;
        },

        // getTopicClusters: async (
        //     messages: Message[]
        // ): Promise<TopicCluster[]> => {
        //     const response = await apiClient.post("/search/topics", {
        //         messages,
        //     });
        //     return response.data;
        // },

        // getInsights: async (
        //     messages: Message[],
        //     start_date?: string,
        //     end_date?: string
        // ): Promise<ConversationInsights> => {
        //     const response = await apiClient.post("/search/insights", {
        //         messages,
        //         start_date,
        //         end_date,
        //     });
        //     return response.data;
        // },
    },
};

export default api;
