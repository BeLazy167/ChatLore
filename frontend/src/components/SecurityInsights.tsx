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
    TrendingUp,
    Info,
    Link,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    Eye,
} from "lucide-react";
import { Progress } from "./ui/progress";
import { useSecurityInsightsV2Stateless } from "@/lib/queries";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";

// Data structure from API:
// {
//     "metrics": {
//       "overallScore": 0,
//       "totalRisks": 0,
//       "riskLevel": "string",
//       "highRiskCount": 0,
//       "mediumRiskCount": 0,
//       "lowRiskCount": 0,
//       "sensitiveDataByType": {
//         "additionalProp1": 0,
//         "additionalProp2": 0,
//         "additionalProp3": 0
//       }
//     },
//     "insights": [
//       {
//         "title": "string",
//         "description": "string",
//         "severity": "string",
//         "recommendations": [
//           "string"
//         ]
//       }
//     ],
//     "trends": [
//       {
//         "type": "string",
//         "direction": "string",
//         "changePercentage": 0,
//         "period": "string",
//         "description": "string"
//       }
//     ]
//   }

const SecurityInsights = () => {
    const { data, isPending, error } = useSecurityInsightsV2Stateless();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );

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
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="findings">Findings</TabsTrigger>
                        <TabsTrigger value="sensitive">
                            Sensitive Data
                        </TabsTrigger>
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
                                                        metrics.totalRisks > 0
                                                            ? (metrics.highRiskCount /
                                                                  metrics.totalRisks) *
                                                              100
                                                            : 0
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
                                                        metrics.totalRisks > 0
                                                            ? (metrics.mediumRiskCount /
                                                                  metrics.totalRisks) *
                                                              100
                                                            : 0
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
                                                        metrics.totalRisks > 0
                                                            ? (metrics.lowRiskCount /
                                                                  metrics.totalRisks) *
                                                              100
                                                            : 0
                                                    }
                                                    className="bg-green-100 h-2"
                                                    indicatorClassName="bg-green-600"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
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
                                {metrics?.sensitiveDataByType &&
                                    Object.entries(
                                        metrics.sensitiveDataByType
                                    ).map(([type, count]) => (
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
                                                    <Badge>
                                                        {count as number}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>

                            {selectedCategory &&
                                metrics?.sensitiveDataByType && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                {selectedCategory} Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Alert>
                                                <Info className="h-4 w-4" />
                                                <AlertTitle>
                                                    Information
                                                </AlertTitle>
                                                <AlertDescription>
                                                    {
                                                        metrics
                                                            .sensitiveDataByType[
                                                            selectedCategory
                                                        ]
                                                    }{" "}
                                                    instances of{" "}
                                                    {selectedCategory} data were
                                                    detected in the
                                                    conversation.
                                                </AlertDescription>
                                            </Alert>
                                        </CardContent>
                                    </Card>
                                )}
                        </div>
                    </TabsContent>

                    <TabsContent value="trends" className="space-y-4">
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-4">
                                {trends?.map((trend, index) => (
                                    <Card key={index}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">
                                                    {trend.type}
                                                </CardTitle>
                                                <div className="flex items-center gap-2">
                                                    {getTrendIcon(
                                                        trend.direction
                                                    )}
                                                    <Badge
                                                        variant={
                                                            trend.direction ===
                                                            "increasing"
                                                                ? "destructive"
                                                                : "default"
                                                        }
                                                    >
                                                        {trend.changePercentage}
                                                        % in {trend.period}
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
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

export default SecurityInsights;
