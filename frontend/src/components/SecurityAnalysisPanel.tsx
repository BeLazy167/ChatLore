import React, { useState } from "react";
import { useSecurityAnalysisStateless } from "../lib/queries";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import { Info, AlertTriangle, Shield } from "lucide-react";

// data
// {
//     "security_score": 0,
//     "total_findings": 0,
//     "findings": [
//       {
//         "type": "string",
//         "risk_level": "string",
//         "message": {},
//         "description": "string",
//         "message_index": 0,
//         "sender": "string",
//         "timestamp": "string"
//       }
//     ],
//     "risk_levels": {
//       "high": 0,
//       "medium": 0,
//       "low": 0
//     },
//     "recommendations": [
//       {
//         "title": "string",
//         "description": "string",
//         "steps": [
//           "string"
//         ],
//         "priority": "string"
//       }
//     ]
//   }
export function SecurityAnalysisPanel() {
    // Use the stateless query if we have messages in the context
    const {
        data: securityAnalysis,
        isLoading: isAnalysisLoading,
        error: analysisError,
    } = useSecurityAnalysisStateless();

    const [selectedTab, setSelectedTab] = useState("overview");

    // Show loading state
    if (isAnalysisLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Security Analysis</CardTitle>
                    <CardDescription>
                        Analyzing conversation security...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Show error state
    if (analysisError) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Security Analysis</CardTitle>
                    <CardDescription>
                        There was an error loading the security analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {analysisError instanceof Error
                                ? analysisError.message
                                : "An unknown error occurred. Please try again later."}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    // Show empty state
    if (!securityAnalysis) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Security Analysis</CardTitle>
                    <CardDescription>No data available</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>No Data</AlertTitle>
                        <AlertDescription>
                            Please upload a chat to analyze security risks.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    // Calculate risk color
    const getScoreColor = (score: number) => {
        if (score >= 90) return "text-green-500";
        if (score >= 70) return "text-yellow-500";
        return "text-red-500";
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "high":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "low":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            default:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        }
    };

    // Render the security analysis
    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Security Analysis</CardTitle>
                        <CardDescription>
                            Analysis of potential security risks in this
                            conversation
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs
                    defaultValue="overview"
                    value={selectedTab}
                    onValueChange={setSelectedTab}
                >
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="findings">Findings</TabsTrigger>
                        <TabsTrigger value="recommendations">
                            Recommendations
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid gap-4">
                            {/* Security Score */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Score</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-muted-foreground">
                                            Overall Security
                                        </span>
                                        <span
                                            className={`text-2xl font-bold ${getScoreColor(
                                                securityAnalysis.security_score
                                            )}`}
                                        >
                                            {securityAnalysis.security_score.toFixed(
                                                1
                                            )}
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary h-2 rounded-full">
                                        <div
                                            className={`h-2 rounded-full ${getScoreColor(
                                                securityAnalysis.security_score
                                            ).replace("text-", "bg-")}`}
                                            style={{
                                                width: `${securityAnalysis.security_score}%`,
                                            }}
                                        ></div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Risk Levels */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Risk Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-red-100 dark:bg-red-950/30 rounded-md text-center">
                                            <div className="text-red-500 font-bold text-2xl">
                                                {
                                                    securityAnalysis.risk_levels
                                                        .high
                                                }
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                High Risk
                                            </div>
                                        </div>
                                        <div className="p-4 bg-yellow-100 dark:bg-yellow-950/30 rounded-md text-center">
                                            <div className="text-yellow-500 font-bold text-2xl">
                                                {
                                                    securityAnalysis.risk_levels
                                                        .medium
                                                }
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Medium Risk
                                            </div>
                                        </div>
                                        <div className="p-4 bg-green-100 dark:bg-green-950/30 rounded-md text-center">
                                            <div className="text-green-500 font-bold text-2xl">
                                                {
                                                    securityAnalysis.risk_levels
                                                        .low
                                                }
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Low Risk
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="findings">
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-4">
                                {securityAnalysis.findings.map(
                                    (finding, index) => (
                                        <Card key={index}>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-1">
                                                        <CardTitle>
                                                            {finding.type}
                                                        </CardTitle>
                                                        <CardDescription>
                                                            {
                                                                finding.description
                                                            }
                                                        </CardDescription>
                                                    </div>
                                                    <Badge
                                                        className={getSeverityBadge(
                                                            finding.risk_level
                                                        )}
                                                    >
                                                        {finding.risk_level}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="font-medium mb-2">
                                                            Details
                                                        </h4>
                                                        <div className="text-sm text-muted-foreground">
                                                            <p>
                                                                Sender:{" "}
                                                                {finding.sender ||
                                                                    "Unknown"}
                                                            </p>
                                                            <p>
                                                                Message Index:{" "}
                                                                {
                                                                    finding.message_index
                                                                }
                                                            </p>
                                                            {finding.timestamp && (
                                                                <p>
                                                                    Time:{" "}
                                                                    {new Date(
                                                                        finding.timestamp
                                                                    ).toLocaleString()}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                )}

                                {securityAnalysis.findings.length === 0 && (
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>No Findings</AlertTitle>
                                        <AlertDescription>
                                            No security issues were detected in
                                            this conversation.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="recommendations">
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-4">
                                {securityAnalysis.recommendations.map(
                                    (rec, index) => (
                                        <Card key={index}>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg">
                                                        {rec.title}
                                                    </CardTitle>
                                                    {rec.priority && (
                                                        <Badge
                                                            className={getSeverityBadge(
                                                                rec.priority
                                                            )}
                                                        >
                                                            {rec.priority}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <p className="text-sm text-muted-foreground">
                                                        {rec.description}
                                                    </p>
                                                    {rec.steps &&
                                                        rec.steps.length >
                                                            0 && (
                                                            <div>
                                                                <h4 className="font-medium mb-2">
                                                                    Steps
                                                                </h4>
                                                                <ul className="list-disc pl-4 space-y-2">
                                                                    {rec.steps.map(
                                                                        (
                                                                            step,
                                                                            idx
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="text-sm text-muted-foreground"
                                                                            >
                                                                                {
                                                                                    step
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                )}

                                {securityAnalysis.recommendations.length ===
                                    0 && (
                                    <Alert>
                                        <Info className="h-4 w-4" />
                                        <AlertTitle>
                                            No Recommendations
                                        </AlertTitle>
                                        <AlertDescription>
                                            No security recommendations are
                                            available for this conversation.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
