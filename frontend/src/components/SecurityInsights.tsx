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
import { Shield, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { Progress } from "./ui/progress";
import { useSecurityInsights } from "@/hooks/useApi";

const SecurityInsights = () => {
    const { data, isPending, error } = useSecurityInsights();

    if (isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Security Insights</CardTitle>
                    <CardDescription>
                        Analyzing your chat for security risks...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Security Insights</CardTitle>
                    <CardDescription>
                        There was a problem loading security insights
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error instanceof Error
                                ? error.message
                                : "Failed to load security insights"}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const { metrics, insights, trends } = data || {};

    const getRiskLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case "high":
                return "text-destructive";
            case "medium":
                return "text-yellow-600 dark:text-yellow-500";
            case "low":
                return "text-green-600 dark:text-green-500";
            default:
                return "text-muted-foreground";
        }
    };

    const getRiskLevelBadge = (level: string) => {
        switch (level.toLowerCase()) {
            case "high":
                return "destructive";
            case "medium":
                return "secondary";
            case "low":
                return "default";
            default:
                return "outline";
        }
    };

    const getTrendIcon = (direction: string) => {
        switch (direction.toLowerCase()) {
            case "increasing":
                return <TrendingUp className="h-4 w-4 text-destructive" />;
            case "decreasing":
                return (
                    <TrendingUp className="h-4 w-4 text-green-600 rotate-180" />
                );
            default:
                return <Info className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>Security Insights</CardTitle>
                </div>
                <CardDescription>
                    AI-powered security analysis of your chat
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="insights">Insights</TabsTrigger>
                        <TabsTrigger value="trends">Trends</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {metrics && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-2xl font-bold">
                                                {metrics.overallScore}%
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Security Score
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div className="text-2xl font-bold">
                                                {metrics.totalRisks}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Risks Found
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-6">
                                            <div
                                                className={`text-2xl font-bold ${getRiskLevelColor(
                                                    metrics.riskLevel
                                                )}`}
                                            >
                                                {metrics.riskLevel.toUpperCase()}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Overall Risk Level
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Risk Distribution</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>High Risk</span>
                                                    <span className="text-destructive">
                                                        {metrics.highRiskCount}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={
                                                        (metrics.highRiskCount /
                                                            metrics.totalRisks) *
                                                        100
                                                    }
                                                    className="bg-destructive/20 h-2"
                                                    indicatorClassName="bg-destructive"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Medium Risk</span>
                                                    <span className="text-yellow-600">
                                                        {
                                                            metrics.mediumRiskCount
                                                        }
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={
                                                        (metrics.mediumRiskCount /
                                                            metrics.totalRisks) *
                                                        100
                                                    }
                                                    className="bg-yellow-100 h-2"
                                                    indicatorClassName="bg-yellow-600"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span>Low Risk</span>
                                                    <span className="text-green-600">
                                                        {metrics.lowRiskCount}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={
                                                        (metrics.lowRiskCount /
                                                            metrics.totalRisks) *
                                                        100
                                                    }
                                                    className="bg-green-100 h-2"
                                                    indicatorClassName="bg-green-600"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Sensitive Data Types
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(
                                                metrics.sensitiveDataByType
                                            ).map(([type, count]) => (
                                                <div
                                                    key={type}
                                                    className="flex justify-between items-center"
                                                >
                                                    <span className="text-sm">
                                                        {type}
                                                    </span>
                                                    <Badge variant="outline">
                                                        {count}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="insights" className="space-y-4">
                        {insights?.map((insight, index) => (
                            <Alert key={index}>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={getRiskLevelBadge(
                                            insight.severity
                                        )}
                                    >
                                        {insight.severity.toUpperCase()}
                                    </Badge>
                                </div>
                                <AlertTitle className="mt-2">
                                    {insight.title}
                                </AlertTitle>
                                <AlertDescription className="mt-2 space-y-2">
                                    <p>{insight.description}</p>
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            Recommendations:
                                        </p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {insight.recommendations.map(
                                                (rec, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="text-sm"
                                                    >
                                                        {rec}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ))}
                    </TabsContent>

                    <TabsContent value="trends" className="space-y-4">
                        {trends?.map((trend, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">
                                            {trend.type}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {getTrendIcon(trend.direction)}
                                            <Badge
                                                variant={
                                                    trend.direction ===
                                                    "increasing"
                                                        ? "destructive"
                                                        : "default"
                                                }
                                            >
                                                {trend.changePercentage}% in{" "}
                                                {trend.period}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {trend.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default SecurityInsights;
