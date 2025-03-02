import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
    Shield,
    AlertTriangle,
    Info,
    Eye,
    Link,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CreditCard,
} from "lucide-react";
import { Progress } from "./ui/progress";
import { useSecurityInsights } from "@/hooks/useAI";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { useChatContext } from "@/lib/ChatContext";

interface SecurityMetrics {
    securityScore: number;
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    sensitiveDataCount: number;
}

interface SecurityFinding {
    title: string;
    description: string;
    severity: string;
    impact: string;
    recommendations: string[];
    examples?: string[];
}

interface SensitiveDataInfo {
    count: number;
    examples: string[];
}

interface SecurityTrend {
    category: string;
    count: number;
}

interface SecurityRecommendation {
    title: string;
    description: string;
    impact: string;
    priority: string;
    steps: string[];
}

interface SecurityInsightsResponse {
    insights: SecurityFinding[];
    metrics: SecurityMetrics;
    sensitiveData: Record<string, SensitiveDataInfo>;
    trends: SecurityTrend[];
    recommendations: SecurityRecommendation[];
}

const SecurityDashboard = () => {
    const { messages: contextMessages } = useChatContext();
    const { data, isPending, error } = useSecurityInsights(
        contextMessages.map((msg) => ({
            id: msg.id,
            timestamp: msg.timestamp.toISOString(),
            sender: msg.sender,
            content: msg.content,
            message_type: msg.messageType || "text",
            is_system_message: msg.isSystemMessage || false,
        }))
    );
    const securityData = (data || {}) as SecurityInsightsResponse;
    const {
        insights = [],
        metrics = {} as SecurityMetrics,
        sensitiveData = {} as Record<string, SensitiveDataInfo>,
        trends = [],
        recommendations = [],
    } = securityData;
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );

    if (isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Security Analysis</CardTitle>
                    <CardDescription>
                        Analyzing your chat for security risks...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center h-[400px]">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                        <p className="text-sm text-muted-foreground">
                            Loading security analysis...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
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
                            {error instanceof Error
                                ? error.message
                                : "An unknown error occurred. Please try again later."}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const getSeverityBadge = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "critical":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "high":
                return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "low":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            default:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        }
    };

    const getDataTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "url":
                return <Link className="h-4 w-4" />;
            case "location":
                return <MapPin className="h-4 w-4" />;
            case "phone":
                return <Phone className="h-4 w-4" />;
            case "email":
                return <Mail className="h-4 w-4" />;
            case "date":
                return <Calendar className="h-4 w-4" />;
            case "payment":
                return <CreditCard className="h-4 w-4" />;
            default:
                return <Eye className="h-4 w-4" />;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <div>
                        <CardTitle>Security Dashboard</CardTitle>
                        <CardDescription>
                            AI-powered security analysis and insights
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="findings">Findings</TabsTrigger>
                        <TabsTrigger value="sensitive">
                            Sensitive Data
                        </TabsTrigger>
                        <TabsTrigger value="recommendations">
                            Recommendations
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="grid gap-4">
                            {/* Security Score */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold">
                                            {metrics?.securityScore}%
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Security Score
                                        </p>
                                        <Progress
                                            value={metrics?.securityScore}
                                            className="mt-2"
                                        />
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold">
                                            {metrics?.totalFindings}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Security Findings
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge variant="destructive">
                                                {metrics?.criticalCount}{" "}
                                                Critical
                                            </Badge>
                                            <Badge variant="secondary">
                                                {metrics?.highCount} High
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-2xl font-bold">
                                            {metrics?.sensitiveDataCount}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Sensitive Data Points
                                        </p>
                                        <div className="flex gap-2 mt-2">
                                            <Badge>
                                                {
                                                    Object.keys(
                                                        sensitiveData || {}
                                                    ).length
                                                }{" "}
                                                Categories
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Trends Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Trends</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart data={trends}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="category" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar
                                                    dataKey="count"
                                                    fill="var(--primary)"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="findings">
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-4">
                                {insights?.map((finding, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle>
                                                        {finding.title}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {finding.description}
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    className={getSeverityBadge(
                                                        finding.severity
                                                    )}
                                                >
                                                    {finding.severity}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium mb-2">
                                                        Impact
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {finding.impact}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium mb-2">
                                                        Recommendations
                                                    </h4>
                                                    <ul className="list-disc pl-4 space-y-2">
                                                        {finding.recommendations.map(
                                                            (rec, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className="text-sm text-muted-foreground"
                                                                >
                                                                    {rec}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                                {finding.examples && (
                                                    <div>
                                                        <h4 className="font-medium mb-2">
                                                            Examples
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {finding.examples.map(
                                                                (
                                                                    example,
                                                                    idx
                                                                ) => (
                                                                    <Alert
                                                                        key={
                                                                            idx
                                                                        }
                                                                    >
                                                                        <AlertDescription>
                                                                            {
                                                                                example
                                                                            }
                                                                        </AlertDescription>
                                                                    </Alert>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="sensitive">
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(sensitiveData || {}).map(
                                    ([type, data]) => (
                                        <Card
                                            key={type}
                                            className={`cursor-pointer ${
                                                selectedCategory === type
                                                    ? "ring-2 ring-primary"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setSelectedCategory(
                                                    selectedCategory === type
                                                        ? null
                                                        : type
                                                )
                                            }
                                        >
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {getDataTypeIcon(type)}
                                                        <span className="font-medium">
                                                            {type}
                                                        </span>
                                                    </div>
                                                    <Badge>{data.count}</Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                )}
                            </div>

                            {selectedCategory &&
                                sensitiveData?.[selectedCategory] && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                {selectedCategory} Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ScrollArea className="h-[300px]">
                                                <div className="space-y-2">
                                                    {sensitiveData[
                                                        selectedCategory
                                                    ].examples.map(
                                                        (example, index) => (
                                                            <Alert key={index}>
                                                                <AlertDescription>
                                                                    {example}
                                                                </AlertDescription>
                                                            </Alert>
                                                        )
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                )}
                        </div>
                    </TabsContent>

                    <TabsContent value="recommendations">
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-4">
                                {recommendations?.map((rec, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">
                                                    {rec.title}
                                                </CardTitle>
                                                <HoverCard>
                                                    <HoverCardTrigger>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                    </HoverCardTrigger>
                                                    <HoverCardContent>
                                                        <div className="space-y-2">
                                                            <p className="text-sm">
                                                                {rec.impact}
                                                            </p>
                                                            <div className="pt-2">
                                                                <Badge variant="secondary">
                                                                    Priority:{" "}
                                                                    {
                                                                        rec.priority
                                                                    }
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <p className="text-sm text-muted-foreground">
                                                    {rec.description}
                                                </p>
                                                <div className="space-y-2">
                                                    <h4 className="font-medium">
                                                        Steps to Implement:
                                                    </h4>
                                                    <ul className="list-disc pl-4 space-y-2">
                                                        {rec.steps.map(
                                                            (step, idx) => (
                                                                <li
                                                                    key={idx}
                                                                    className="text-sm text-muted-foreground"
                                                                >
                                                                    {step}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export { SecurityDashboard };
