import React from "react";
import { useSecurityAnalysisStateless } from "../lib/queries";
import { useChatContext } from "../lib/ChatContext";
import { Message as ApiMessage } from "@/lib/api";

export function SecurityAnalysisPanel() {
    const { messages, isLoading: isContextLoading } = useChatContext();

    // Convert context messages to the API Message format if needed
    const apiMessages = React.useMemo(() => {
        if (!messages) return [];

        return messages.map(
            (msg) =>
                ({
                    id: msg.id,
                    timestamp: msg.timestamp.toString(),
                    sender: msg.sender,
                    content: msg.content,
                    message_type: msg.messageType,
                    duration: msg.duration?.toString(),
                    url: msg.url,
                    language: msg.language || "en",
                    is_system_message: msg.isSystemMessage,
                } as ApiMessage)
        );
    }, [messages]);

    // Use the stateless query if we have messages in the context
    const {
        data: securityAnalysis,
        isLoading: isAnalysisLoading,
        error: analysisError,
    } = useSecurityAnalysisStateless(apiMessages);

    // Show loading state
    if (isContextLoading || isAnalysisLoading) {
        return (
            <div className="p-4 border rounded-lg bg-background">
                <h2 className="text-xl font-bold mb-4">Security Analysis</h2>
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    // Show error state
    if (analysisError) {
        return (
            <div className="p-4 border rounded-lg bg-background">
                <h2 className="text-xl font-bold mb-4">Security Analysis</h2>
                <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                    <p>
                        Error loading security analysis:{" "}
                        {(analysisError as Error).message}
                    </p>
                </div>
            </div>
        );
    }

    // Show empty state
    if (!securityAnalysis) {
        return (
            <div className="p-4 border rounded-lg bg-background">
                <h2 className="text-xl font-bold mb-4">Security Analysis</h2>
                <p className="text-muted-foreground">
                    No security analysis available. Upload a chat to analyze.
                </p>
            </div>
        );
    }

    // Calculate risk color
    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-500";
        if (score >= 70) return "text-yellow-500";
        return "text-red-500";
    };

    // Render the security analysis
    return (
        <div className="p-4 border rounded-lg bg-background">
            <h2 className="text-xl font-bold mb-4">Security Analysis</h2>

            {/* Security Score */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                        Security Score
                    </span>
                    <span
                        className={`text-2xl font-bold ${getScoreColor(
                            securityAnalysis.security_score
                        )}`}
                    >
                        {securityAnalysis.security_score.toFixed(1)}
                    </span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full mt-2">
                    <div
                        className={`h-2 rounded-full ${getScoreColor(
                            securityAnalysis.security_score
                        ).replace("text-", "bg-")}`}
                        style={{ width: `${securityAnalysis.security_score}%` }}
                    ></div>
                </div>
            </div>

            {/* Risk Levels */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Risk Levels</h3>
                <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-red-100 dark:bg-red-950/30 rounded-md">
                        <div className="text-red-500 font-bold">
                            {securityAnalysis.risk_levels.high}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            High
                        </div>
                    </div>
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-950/30 rounded-md">
                        <div className="text-yellow-500 font-bold">
                            {securityAnalysis.risk_levels.medium}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Medium
                        </div>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-950/30 rounded-md">
                        <div className="text-green-500 font-bold">
                            {securityAnalysis.risk_levels.low}
                        </div>
                        <div className="text-sm text-muted-foreground">Low</div>
                    </div>
                </div>
            </div>

            {/* Findings Summary */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Findings</h3>
                <p className="text-muted-foreground">
                    {securityAnalysis.total_findings} potential security issues
                    found
                </p>

                {/* Top Findings */}
                {securityAnalysis.findings.slice(0, 3).map((finding, index) => (
                    <div key={index} className="mt-2 p-3 border rounded-md">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{finding.type}</span>
                            <span
                                className={`text-sm px-2 py-1 rounded-full ${
                                    finding.risk_level === "high"
                                        ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                                        : finding.risk_level === "medium"
                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400"
                                        : "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                                }`}
                            >
                                {finding.risk_level}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            From: {String(finding.sender || "Unknown")}
                        </p>
                    </div>
                ))}

                {securityAnalysis.findings.length > 3 && (
                    <div className="mt-2 text-center">
                        <button className="text-sm text-primary hover:underline">
                            View all {securityAnalysis.findings.length} findings
                        </button>
                    </div>
                )}
            </div>

            {/* Recommendations */}
            <div>
                <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                {securityAnalysis.recommendations
                    .slice(0, 2)
                    .map((rec, index) => (
                        <div key={index} className="mt-2 p-3 border rounded-md">
                            <div className="font-medium">{rec.title}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                {rec.description}
                            </p>
                        </div>
                    ))}

                {securityAnalysis.recommendations.length > 2 && (
                    <div className="mt-2 text-center">
                        <button className="text-sm text-primary hover:underline">
                            View all {securityAnalysis.recommendations.length}{" "}
                            recommendations
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
