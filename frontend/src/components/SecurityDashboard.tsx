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
import { SecurityInsightItem } from "@/lib/api";
import { useSecurityInsightsStateless } from "@/lib/queries";

const getSeverityBadge = (severity: string) => {
    const severityMap: Record<string, string> = {
        critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return (
        severityMap[severity.toLowerCase()] ||
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    );
};

interface Metrics {
    totalFindings: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    securityScore: number;
}

interface SensitiveDataCategoryProps {
    type: string;
    count: number;
    isSelected: boolean;
    onSelect: () => void;
    icon: React.ReactNode;
}

interface SensitiveDataDetailsProps {
    category: string;
    data: {
        count: number;
        examples: string[];
    };
}

interface Recommendation {
    title: string;
    priority: string;
    impact: string;
    description: string;
    steps: string[];
}

const SecurityDashboard = () => {
    const { data, isPending, error } = useSecurityInsightsStateless();
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );

    if (isPending) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (!data) return <EmptyState />;

    const { insights, metrics, sensitiveData, trends, recommendations } = data;

    const getDataTypeIcon = (type: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            url: <Link className="h-4 w-4" />,
            location: <MapPin className="h-4 w-4" />,
            phone: <Phone className="h-4 w-4" />,
            email: <Mail className="h-4 w-4" />,
            date: <Calendar className="h-4 w-4" />,
            payment: <CreditCard className="h-4 w-4" />,
            address: <MapPin className="h-4 w-4" />,
        };
        return iconMap[type.toLowerCase()] || <Eye className="h-4 w-4" />;
    };

    const trendData = trends.map((trend) => ({
        category: trend.category,
        count: trend.count,
    }));

    const totalSensitiveData = Object.values(sensitiveData).reduce(
        (sum, { count }) => sum + count,
        0
    );

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
                <Tabs defaultValue="overview">
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

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SecurityScoreCard score={metrics.securityScore} />
                            <FindingsCard metrics={metrics} />
                            <SensitiveDataCard
                                total={totalSensitiveData}
                                categories={Object.keys(sensitiveData)}
                            />
                        </div>
                        <TrendsChart data={trendData} />
                    </TabsContent>

                    <TabsContent value="findings">
                        <div className="space-y-6">
                            {/* Critical Findings */}
                            {insights.filter((i) => i.severity === "critical")
                                .length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-destructive flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Critical Issues
                                    </h3>
                                    {insights
                                        .filter(
                                            (i) => i.severity === "critical"
                                        )
                                        .map((finding, index) => (
                                            <FindingCard
                                                key={index}
                                                finding={finding}
                                            />
                                        ))}
                                </div>
                            )}

                            {/* High Severity Findings */}
                            {insights.filter((i) => i.severity === "high")
                                .length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-orange-500 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        High Risk Issues
                                    </h3>
                                    {insights
                                        .filter((i) => i.severity === "high")
                                        .map((finding, index) => (
                                            <FindingCard
                                                key={index}
                                                finding={finding}
                                            />
                                        ))}
                                </div>
                            )}

                            {/* Medium Severity Findings */}
                            {insights.filter((i) => i.severity === "medium")
                                .length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-yellow-500 flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4" />
                                        Medium Risk Issues
                                    </h3>
                                    {insights
                                        .filter((i) => i.severity === "medium")
                                        .map((finding, index) => (
                                            <FindingCard
                                                key={index}
                                                finding={finding}
                                            />
                                        ))}
                                </div>
                            )}

                            {/* Low Severity Findings */}
                            {insights.filter((i) => i.severity === "low")
                                .length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-green-500 flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        Low Risk Issues
                                    </h3>
                                    {insights
                                        .filter((i) => i.severity === "low")
                                        .map((finding, index) => (
                                            <FindingCard
                                                key={index}
                                                finding={finding}
                                            />
                                        ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="sensitive">
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(sensitiveData).map(
                                    ([type, { count }]) => (
                                        <SensitiveDataCategoryCard
                                            key={type}
                                            type={type}
                                            count={count}
                                            isSelected={
                                                selectedCategory === type
                                            }
                                            onSelect={() =>
                                                setSelectedCategory((prev) =>
                                                    prev === type ? null : type
                                                )
                                            }
                                            icon={getDataTypeIcon(type)}
                                        />
                                    )
                                )}
                            </div>
                            {selectedCategory && (
                                <SensitiveDataDetails
                                    category={selectedCategory}
                                    data={sensitiveData[selectedCategory]}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="recommendations">
                        <ScrollArea className="h-[600px] pr-4">
                            <div className="space-y-4">
                                {recommendations.map((rec, index) => (
                                    <RecommendationCard
                                        key={index}
                                        recommendation={rec}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

// Sub-components for better organization
const LoadingState = () => (
    <Card>
        <CardHeader>
            <CardTitle>Security Analysis</CardTitle>
            <CardDescription>
                Analyzing your chat for security risks...
            </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[400px]">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">
                    Loading security analysis...
                </p>
            </div>
        </CardContent>
    </Card>
);

const ErrorState = ({ error }: { error: Error }) => (
    <Card>
        <CardHeader>
            <CardTitle>Security Analysis</CardTitle>
            <CardDescription>Error loading security analysis</CardDescription>
        </CardHeader>
        <CardContent>
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error.message ||
                        "An unknown error occurred. Please try again later."}
                </AlertDescription>
            </Alert>
        </CardContent>
    </Card>
);

const EmptyState = () => (
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

const SecurityScoreCard = ({ score }: { score: number }) => (
    <Card>
        <CardContent className="pt-6">
            <div className="text-2xl font-bold">{score}%</div>
            <p className="text-sm text-muted-foreground">Security Score</p>
            <Progress value={score} className="mt-2" />
        </CardContent>
    </Card>
);

const FindingsCard = ({
    metrics,
}: {
    metrics: Pick<Metrics, "totalFindings" | "highCount">;
}) => (
    <Card>
        <CardContent className="pt-6">
            <div className="text-2xl font-bold">{metrics.totalFindings}</div>
            <p className="text-sm text-muted-foreground">Security Findings</p>
            <div className="flex gap-2 mt-2">
                <Badge variant="destructive">{metrics.highCount} High</Badge>
            </div>
        </CardContent>
    </Card>
);

const SensitiveDataCard = ({
    total,
    categories,
}: {
    total: number;
    categories: string[];
}) => (
    <Card>
        <CardContent className="pt-6">
            <div className="text-2xl font-bold">{total.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">
                Sensitive Data Points
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
                <Badge>{categories.length} Categories</Badge>
            </div>
        </CardContent>
    </Card>
);

const TrendsChart = ({
    data,
}: {
    data: { category: string; count: number }[];
}) => (
    <Card>
        <CardHeader>
            <CardTitle>Security Trends</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="var(--primary)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
    </Card>
);

const FindingCard = ({ finding }: { finding: SecurityInsightItem }) => (
    <Card>
        <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {finding.severity === "critical" && (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                    )}
                    {finding.severity === "high" && (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                    {finding.severity === "medium" && (
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    {finding.severity === "low" && (
                        <Info className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                        <CardTitle className="text-lg">
                            {finding.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {finding.description}
                        </CardDescription>
                    </div>
                </div>
                <Badge
                    className={`${getSeverityBadge(
                        finding.severity
                    )} capitalize`}
                >
                    {finding.severity}
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
            <div className="rounded-md bg-muted p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Impact
                </h4>
                <p className="text-sm text-muted-foreground">
                    {finding.impact}
                </p>
            </div>

            <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Detected Instances
                </h4>
                <ScrollArea className="h-[100px]">
                    <div className="grid grid-cols-2 gap-2">
                        {finding.examples?.map((ex: string, idx: number) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 bg-muted rounded-md p-2 break-all"
                            >
                                <span className="text-xs text-muted-foreground font-mono min-w-[24px]">
                                    {idx + 1}.
                                </span>
                                <code className="text-sm flex-1">{ex}</code>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <div className="rounded-md bg-muted/50 p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Recommendations
                </h4>
                <ul className="space-y-2">
                    {finding.recommendations.map((rec: string, idx: number) => (
                        <li
                            key={idx}
                            className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                            <span className="text-primary mt-1">•</span>
                            <span>{rec}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </CardContent>
    </Card>
);

const SensitiveDataCategoryCard = ({
    type,
    count,
    isSelected,
    onSelect,
    icon,
}: SensitiveDataCategoryProps) => (
    <Card
        className={`cursor-pointer ${isSelected ? "ring-2 ring-primary" : ""}`}
        onClick={onSelect}
    >
        <CardContent className="pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium capitalize">{type}</span>
                </div>
                <Badge>{count}</Badge>
            </div>
        </CardContent>
    </Card>
);

const SensitiveDataDetails = ({
    category,
    data,
}: SensitiveDataDetailsProps) => (
    <Card>
        <CardHeader>
            <CardTitle className="capitalize">{category} Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>{data.count} Instances Found</AlertTitle>
                <AlertDescription>
                    Found in conversation examples:
                </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.examples.map((ex: string, idx: number) => (
                    <code key={idx} className="text-sm p-2 bg-muted rounded">
                        {ex}
                    </code>
                ))}
            </div>
        </CardContent>
    </Card>
);

const RecommendationCard = ({
    recommendation,
}: {
    recommendation: Recommendation;
}) => (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                    {recommendation.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                        {recommendation.priority} priority
                    </Badge>
                    <HoverCard>
                        <HoverCardTrigger>
                            <Button variant="ghost" size="sm">
                                <Info className="h-4 w-4" />
                            </Button>
                        </HoverCardTrigger>
                        <HoverCardContent>
                            <p className="text-sm">{recommendation.impact}</p>
                        </HoverCardContent>
                    </HoverCard>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
                {recommendation.description}
            </p>
            <div>
                <h4 className="font-medium mb-2">Implementation Steps</h4>
                <ul className="list-decimal pl-4 space-y-2">
                    {recommendation.steps.map((step: string, idx: number) => (
                        <li key={idx} className="text-sm text-muted-foreground">
                            {step}
                        </li>
                    ))}
                </ul>
            </div>
        </CardContent>
    </Card>
);

export { SecurityDashboard };
