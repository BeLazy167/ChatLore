import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
    Search,
    Calendar,
    User,
    Info,
    ChevronDown,
    ChevronUp,
    Loader2,
} from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useSearchSemanticStateless } from "@/lib/queries";
import { useState } from "react";

// API Input format:
// {
//     "query": "string",
//     "min_similarity": 0.3,
//     "limit": 10,
//     "with_explanation": false
// }

// API Output format:
// [
//     {
//       "message": {},
//       "similarity": 0,
//       "context": {
//         "before": [
//           "string"
//         ],
//         "after": [
//           "string"
//         ]
//       },
//       "explanation": "string"
//     }
// ]

interface SearchResult {
    message: {
        id?: string;
        sender: string;
        content: string;
        timestamp: string;
    };
    similarity: number;
    context: {
        before: string[];
        after: string[];
    };
    explanation?: string;
}

export const ContextAwareSearch = () => {
    const [query, setQuery] = useState("");
    const [minSimilarity, setMinSimilarity] = useState(0.3);
    const [resultLimit, setResultLimit] = useState(10);
    const [withExplanation, setWithExplanation] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [expandedResults, setExpandedResults] = useState<
        Record<string, boolean>
    >({});

    const {
        mutate: search,
        data,
        isPending,
        isError,
        error,
    } = useSearchSemanticStateless(
        query,
        minSimilarity,
        resultLimit,
        withExplanation
    );

    const handleSearch = () => {
        if (!query.trim()) return;
        search();
    };

    const toggleResultExpansion = (resultId: string) => {
        setExpandedResults((prev) => ({
            ...prev,
            [resultId]: !prev[resultId],
        }));
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (e) {
            console.error("Error formatting date:", e);
            return dateString;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Context-Aware Search
                </CardTitle>
                <CardDescription>
                    Search your chat with AI-powered understanding
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-4">
                    <Input
                        placeholder="Search your chat..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSearch();
                        }}
                        className="flex-1"
                    />
                    <Select
                        value={selectedFilter}
                        onValueChange={setSelectedFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Messages</SelectItem>
                            <SelectItem value="text">Text Only</SelectItem>
                            <SelectItem value="media">Media Only</SelectItem>
                            <SelectItem value="links">Links Only</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleSearch} disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className="flex flex-col gap-1 flex-1">
                        <label className="text-sm text-muted-foreground">
                            Minimum Similarity: {minSimilarity}
                        </label>
                        <input
                            type="range"
                            min="0.1"
                            max="0.9"
                            step="0.1"
                            value={minSimilarity}
                            onChange={(e) =>
                                setMinSimilarity(parseFloat(e.target.value))
                            }
                            className="w-full"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-muted-foreground">
                            Result Limit
                        </label>
                        <Select
                            value={resultLimit.toString()}
                            onValueChange={(value) =>
                                setResultLimit(parseInt(value))
                            }
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Limit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">
                            Include Explanations
                        </label>
                        <input
                            type="checkbox"
                            checked={withExplanation}
                            onChange={(e) =>
                                setWithExplanation(e.target.checked)
                            }
                        />
                    </div>
                </div>

                {isError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error instanceof Error
                                ? error.message
                                : "An error occurred while searching. Please try again."}
                        </AlertDescription>
                    </Alert>
                )}

                {data && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                                {data.length} results found
                            </div>
                        </div>

                        <ScrollArea className="h-[400px] rounded-md border p-4">
                            {data && data.length > 0 ? (
                                <div className="space-y-4">
                                    {data.map((result: SearchResult, index) => (
                                        <Collapsible
                                            key={
                                                result.message.id ||
                                                `result-${index}`
                                            }
                                            open={
                                                result.message.id
                                                    ? expandedResults[
                                                          result.message.id
                                                      ]
                                                    : false
                                            }
                                            className="border rounded-lg overflow-hidden"
                                        >
                                            <div className="bg-muted p-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <span className="font-medium">
                                                                {
                                                                    result
                                                                        .message
                                                                        .sender
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>
                                                                {formatDate(
                                                                    result
                                                                        .message
                                                                        .timestamp
                                                                )}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="ml-2"
                                                            >
                                                                {Math.round(
                                                                    result.similarity *
                                                                        100
                                                                )}
                                                                % match
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <CollapsibleTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                toggleResultExpansion(
                                                                    result
                                                                        .message
                                                                        .id ||
                                                                        `result-${index}`
                                                                )
                                                            }
                                                        >
                                                            {result.message
                                                                .id &&
                                                            expandedResults[
                                                                result.message
                                                                    .id
                                                            ] ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                </div>
                                                <p className="mt-2 text-sm">
                                                    {result.message.content}
                                                </p>
                                            </div>
                                            <CollapsibleContent>
                                                <div className="p-3 bg-background border-t">
                                                    {result.explanation && (
                                                        <div className="flex items-start gap-2 mb-2">
                                                            <Info className="h-4 w-4 text-primary mt-0.5" />
                                                            <div>
                                                                <p className="text-sm font-medium">
                                                                    AI
                                                                    Explanation
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {
                                                                        result.explanation
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(result.context.before
                                                        .length > 0 ||
                                                        result.context.after
                                                            .length > 0) && (
                                                        <div className="mt-3">
                                                            <p className="text-sm font-medium mb-1">
                                                                Conversation
                                                                Context
                                                            </p>
                                                            {result.context.before.map(
                                                                (
                                                                    msg,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={`before-${index}`}
                                                                        className="text-xs text-muted-foreground mb-1 pl-2 border-l-2 border-muted"
                                                                    >
                                                                        {msg}
                                                                    </div>
                                                                )
                                                            )}
                                                            <div className="text-xs bg-primary/10 p-1 rounded my-1">
                                                                {
                                                                    result
                                                                        .message
                                                                        .content
                                                                }
                                                            </div>
                                                            {result.context.after.map(
                                                                (
                                                                    msg,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={`after-${index}`}
                                                                        className="text-xs text-muted-foreground mt-1 pl-2 border-l-2 border-muted"
                                                                    >
                                                                        {msg}
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                    <Search className="h-8 w-8 text-muted-foreground mb-2" />
                                    <h3 className="font-medium">
                                        No results found
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Try a different search term or filter
                                    </p>
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
