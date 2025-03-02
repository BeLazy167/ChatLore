import { useQuery, useMutation } from "@tanstack/react-query";
import { api, Message } from "@/lib/api";

interface SecurityMetrics {
    securityScore: number;
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    sensitiveDataCount: number;
}

interface SecurityFinding {
    title: string;
    description: string;
    severity: "critical" | "high" | "medium" | "low";
    impact: string;
    recommendations: string[];
    examples?: string[];
}

interface SensitiveDataInfo {
    count: number;
    examples: string[];
    riskLevel: "high" | "medium" | "low";
}

interface SecurityTrend {
    category: string;
    count: number;
    change: number;
    period: string;
}

interface SecurityRecommendation {
    title: string;
    description: string;
    impact: string;
    priority: "high" | "medium" | "low";
    steps: string[];
}

interface SecurityInsightsResponse {
    metrics: SecurityMetrics;
    insights: SecurityFinding[];
    sensitiveData: Record<string, SensitiveDataInfo>;
    trends: SecurityTrend[];
    recommendations: SecurityRecommendation[];
}

interface SearchResult {
    id: string;
    content: string;
    sender: string;
    timestamp: string;
    relevanceScore: number;
    aiExplanation: string;
    context: {
        before: string[];
        after: string[];
    };
}

interface SearchResponse {
    results: SearchResult[];
    totalResults: number;
    searchContext: {
        query: string;
        filters: Record<string, unknown>;
        aiEnhancements: string[];
    };
}

interface ContextAnalysis {
    summary: string;
    topics: string[];
    sentiment: string;
    entities: {
        name: string;
        type: string;
        mentions: number;
    }[];
    keyInsights: string[];
}

// Security Insights Hook
export const useSecurityInsights = (messages: Message[]) => {
    return useQuery<SecurityInsightsResponse>({
        queryKey: ["securityInsights", messages.length],
        queryFn: async () => {
            // Use the new stateless security API
            const securityAnalysis = await api.security.analyze(messages);
            const sensitiveData = await api.security.getSensitiveData(messages);

            // Transform the API response to match the expected format
            return {
                metrics: {
                    securityScore: securityAnalysis.security_score,
                    totalFindings: securityAnalysis.total_findings,
                    criticalCount: 0, // Not provided in API, set to 0
                    highCount: securityAnalysis.risk_levels.high,
                    mediumCount: securityAnalysis.risk_levels.medium,
                    lowCount: securityAnalysis.risk_levels.low,
                    sensitiveDataCount: Object.keys(sensitiveData).length,
                },
                insights: securityAnalysis.findings.map((finding) => ({
                    title: finding.type,
                    description: finding.description,
                    severity: finding.risk_level as
                        | "critical"
                        | "high"
                        | "medium"
                        | "low",
                    impact: "Security impact based on risk level",
                    recommendations: securityAnalysis.recommendations.map(
                        (rec) => rec.title
                    ),
                    examples: [],
                })),
                sensitiveData: Object.entries(sensitiveData).reduce(
                    (acc, [key, values]) => {
                        acc[key] = {
                            count: values.length,
                            examples: values.slice(0, 3),
                            riskLevel: "high",
                        };
                        return acc;
                    },
                    {} as Record<string, SensitiveDataInfo>
                ),
                trends: [],
                recommendations: securityAnalysis.recommendations.map(
                    (rec) => ({
                        title: rec.title,
                        description: rec.description,
                        impact: "Security impact based on recommendation",
                        priority: "high",
                        steps: [rec.description],
                    })
                ),
            };
        },
        enabled: messages.length > 0,
    });
};

// AI-powered Search Hook
export const useAISearch = () => {
    return useMutation<
        SearchResponse,
        Error,
        {
            query: string;
            filters?: Record<string, unknown>;
            messages: Message[];
            min_similarity?: number;
            limit?: number;
            with_explanation?: boolean;
        }
    >({
        mutationFn: async ({
            query,
            filters,
            messages,
            min_similarity = 0.3,
            limit = 10,
            with_explanation = false,
        }) => {
            const searchResults = await api.search.semantic(
                query,
                messages,
                min_similarity,
                limit,
                with_explanation
            );

            // Transform the API response to match the expected format
            return {
                results: searchResults.map((result) => ({
                    id: result.message.id || crypto.randomUUID(),
                    content: result.message.content,
                    sender: result.message.sender,
                    timestamp: result.message.timestamp,
                    relevanceScore: result.similarity,
                    aiExplanation:
                        result.explanation ||
                        "This message matches your search query",
                    context: result.context,
                })),
                totalResults: searchResults.length,
                searchContext: {
                    query,
                    filters: filters || {},
                    aiEnhancements: ["semantic search", "context awareness"],
                },
            };
        },
    });
};

// Context Analysis Hook
export const useContextAnalysis = (messageIds: string[]) => {
    return useQuery<ContextAnalysis>({
        queryKey: ["contextAnalysis", messageIds],
        queryFn: async () => {
            // For now, we'll return a simplified version since we don't have a direct API endpoint
            // In a real implementation, you would call an API endpoint with the message IDs

            // Get all messages - using getMessagesStateless instead of getMessages
            // We'll create a dummy array of messages since we don't have the actual messages
            const dummyMessages: Message[] = messageIds.map((id) => ({
                id,
                timestamp: new Date().toISOString(),
                sender: "Unknown",
                content: "",
                message_type: "text",
                is_system_message: false,
            }));

            const messages = await api.chat.getMessages(dummyMessages);

            // Filter to only the requested message IDs
            const filteredMessages = messages.filter((message: Message) =>
                messageIds.includes(message.id || "")
            );

            // Create a simple analysis
            return {
                summary: `Conversation with ${
                    new Set(filteredMessages.map((m: Message) => m.sender)).size
                } participants`,
                topics: ["Chat analysis", "Security"],
                sentiment: "neutral",
                entities: filteredMessages
                    .map((m: Message) => m.sender)
                    .filter(
                        (v: string, i: number, a: string[]) =>
                            a.indexOf(v) === i
                    )
                    .map((name: string) => ({
                        name,
                        type: "person",
                        mentions: filteredMessages.filter(
                            (m: Message) => m.sender === name
                        ).length,
                    })),
                keyInsights: [
                    "Multiple participants in conversation",
                    "Various topics discussed",
                ],
            };
        },
        enabled: messageIds.length > 0,
    });
};

// Insights Hook (formerly Gemini Insights)
export const useGeminiInsights = (text: string) => {
    return useQuery<{
        summary: string;
        insights: string[];
        recommendations: string[];
    }>({
        queryKey: ["insights", text],
        queryFn: async () => {
            // Since we don't have a direct API for this, we'll use the security API as a proxy
            // In a real implementation, you would call a dedicated API endpoint

            // Create a mock message with the text
            const mockMessage: Message = {
                timestamp: new Date().toISOString(),
                sender: "User",
                content: text,
                message_type: "text",
                is_system_message: false,
            };

            // Get security analysis for this message
            const securityAnalysis = await api.security.analyze([mockMessage]);

            return {
                summary: "Analysis of provided text",
                insights: securityAnalysis.findings.map((f) => f.type),
                recommendations: securityAnalysis.recommendations.map(
                    (r) => r.title
                ),
            };
        },
        enabled: !!text,
    });
};
