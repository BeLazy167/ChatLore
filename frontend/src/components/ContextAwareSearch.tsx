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
    MessageSquare,
    SlidersHorizontal,
    Tag,
    Globe,
} from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
    useSearchSemanticStateless,
    useSearchSimilarStateless,
} from "@/lib/queries";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const ContextAwareSearch = () => {
    const [query, setQuery] = useState("");
    const [minSimilarity, setMinSimilarity] = useState(0.3);
    const [resultLimit, setResultLimit] = useState(10);
    const [withExplanation, setWithExplanation] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [expandedResults, setExpandedResults] = useState<
        Record<string, boolean>
    >({});
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [searchMode, setSearchMode] = useState<"semantic" | "similar">(
        "semantic"
    );
    const [selectedMessage, setSelectedMessage] = useState("");

    // Semantic search
    const {
        mutate: searchSemantic,
        data: semanticData,
        isPending: isSemanticPending,
        isError: isSemanticError,
        error: semanticError,
    } = useSearchSemanticStateless(
        query,
        minSimilarity,
        resultLimit,
        withExplanation
    );

    // Similar search
    const {
        mutate: searchSimilar,
        data: similarData,
        isPending: isSimilarPending,
        isError: isSimilarError,
        error: similarError,
    } = useSearchSimilarStateless(
        selectedMessage,
        withExplanation,
        minSimilarity,
        resultLimit
    );

    const handleSearch = () => {
        if (searchMode === "semantic") {
            if (!query.trim()) return;
            searchSemantic();
        } else {
            if (!selectedMessage.trim()) return;
            searchSimilar();
        }
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

    const getMessageTypeIcon = (messageType: string) => {
        switch (messageType) {
            case "text":
                return null;
            case "image":
                return <Tag className="h-3 w-3 text-blue-500" />;
            case "video":
                return <Tag className="h-3 w-3 text-red-500" />;
            case "audio":
                return <Tag className="h-3 w-3 text-green-500" />;
            default:
                return <Tag className="h-3 w-3" />;
        }
    };

    const data = searchMode === "semantic" ? semanticData : similarData;
    const isPending =
        searchMode === "semantic" ? isSemanticPending : isSimilarPending;
    const isError =
        searchMode === "semantic" ? isSemanticError : isSimilarError;
    const error = searchMode === "semantic" ? semanticError : similarError;

    // Filter results based on selected filter
    const filteredData = data
        ? data.filter((result) => {
              if (selectedFilter === "all") return true;
              if (selectedFilter === "text")
                  return result.message.message_type === "text";
              if (selectedFilter === "media")
                  return ["image", "video", "audio"].includes(
                      result.message.message_type
                  );
              if (selectedFilter === "links")
                  return result.message.url !== null;
              return true;
          })
        : [];

    return (
        <Card className="w-full shadow-lg border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                    <Search className="h-5 w-5 text-primary" />
                    Context-Aware Search
                </CardTitle>
                <CardDescription className="text-slate-600">
                    Search your chat with AI-powered understanding
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Tabs
                    defaultValue="semantic"
                    onValueChange={(value) =>
                        setSearchMode(value as "semantic" | "similar")
                    }
                    className="mb-6"
                >
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="semantic" className="text-sm">
                            <Search className="h-4 w-4 mr-2" />
                            Semantic Search
                        </TabsTrigger>
                        <TabsTrigger value="similar" className="text-sm">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Similar Messages
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="semantic">
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
                            <Button
                                onClick={handleSearch}
                                disabled={isPending}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                                <span className="ml-2">Search</span>
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="similar">
                        <div className="flex gap-2 mb-4">
                            <Input
                                placeholder="Enter a message to find similar ones..."
                                value={selectedMessage}
                                onChange={(e) =>
                                    setSelectedMessage(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSearch();
                                }}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSearch}
                                disabled={isPending}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <MessageSquare className="h-4 w-4" />
                                )}
                                <span className="ml-2">Find</span>
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="mb-6">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1 text-slate-600 border-slate-300 hover:bg-slate-100"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        {showAdvanced ? "Hide" : "Show"} Advanced Options
                        {showAdvanced ? (
                            <ChevronUp className="h-4 w-4 ml-1" />
                        ) : (
                            <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                    </Button>

                    {showAdvanced && (
                        <div className="mt-4 p-5 border rounded-lg bg-slate-50 space-y-5">
                            <div className="flex gap-6">
                                <div className="flex flex-col gap-2 flex-1">
                                    <label className="text-sm font-medium text-slate-700">
                                        Minimum Similarity: {minSimilarity}
                                    </label>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="0.9"
                                        step="0.1"
                                        value={minSimilarity}
                                        onChange={(e) =>
                                            setMinSimilarity(
                                                parseFloat(e.target.value)
                                            )
                                        }
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Less strict</span>
                                        <span>More strict</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 w-[140px]">
                                    <label className="text-sm font-medium text-slate-700">
                                        Result Limit
                                    </label>
                                    <Select
                                        value={resultLimit.toString()}
                                        onValueChange={(value) =>
                                            setResultLimit(parseInt(value))
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Limit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">
                                                5 results
                                            </SelectItem>
                                            <SelectItem value="10">
                                                10 results
                                            </SelectItem>
                                            <SelectItem value="20">
                                                20 results
                                            </SelectItem>
                                            <SelectItem value="50">
                                                50 results
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={withExplanation}
                                        onChange={(e) =>
                                            setWithExplanation(e.target.checked)
                                        }
                                        className="rounded text-primary focus:ring-primary"
                                    />
                                    Include AI Explanations
                                </label>
                                <div className="text-xs text-slate-500">
                                    (Provides context about why results match)
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-2">
                                    Filter by Message Type
                                </label>
                                <Select
                                    value={selectedFilter}
                                    onValueChange={setSelectedFilter}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Filter by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Messages
                                        </SelectItem>
                                        <SelectItem value="text">
                                            Text Only
                                        </SelectItem>
                                        <SelectItem value="media">
                                            Media Only
                                        </SelectItem>
                                        <SelectItem value="links">
                                            Links Only
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                </div>

                {isError && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertTitle className="flex items-center gap-2">
                            <Info className="h-4 w-4" /> Error
                        </AlertTitle>
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
                            <div className="text-sm font-medium text-slate-700">
                                {filteredData.length} results found
                                {selectedFilter !== "all" && (
                                    <span className="text-slate-500 ml-1">
                                        (filtered by {selectedFilter})
                                    </span>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="h-[550px] rounded-lg border p-4">
                            {filteredData && filteredData.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredData.map((result, index) => (
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
                                            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                                        >
                                            <div className="bg-white p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-slate-500" />
                                                            <span className="font-medium text-slate-800">
                                                                {
                                                                    result
                                                                        .message
                                                                        .sender
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 mt-1">
                                                            <div className="flex items-center">
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                <span>
                                                                    {formatDate(
                                                                        result
                                                                            .message
                                                                            .timestamp
                                                                    )}
                                                                </span>
                                                            </div>

                                                            {result.message
                                                                .message_type && (
                                                                <div className="flex items-center">
                                                                    {getMessageTypeIcon(
                                                                        result
                                                                            .message
                                                                            .message_type
                                                                    )}
                                                                    <span className="ml-1 capitalize">
                                                                        {
                                                                            result
                                                                                .message
                                                                                .message_type
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {result.message
                                                                .language && (
                                                                <div className="flex items-center">
                                                                    <Globe className="h-3 w-3 mr-1" />
                                                                    <span className="uppercase">
                                                                        {
                                                                            result
                                                                                .message
                                                                                .language
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <Badge
                                                                variant="outline"
                                                                className="ml-auto bg-primary/10 text-primary border-primary/20"
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
                                                            className="h-8 w-8 p-0 rounded-full hover:bg-slate-100"
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
                                                                <ChevronUp className="h-4 w-4 text-slate-600" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4 text-slate-600" />
                                                            )}
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                </div>
                                                <div className="mt-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-md whitespace-normal break-words">
                                                    {result.message.content}
                                                </div>
                                            </div>
                                            <CollapsibleContent>
                                                <div className="p-4 bg-slate-50 border-t">
                                                    {result.explanation && (
                                                        <div className="flex items-start gap-3 mb-4 p-3 bg-primary/5 rounded-md">
                                                            <Info className="h-4 w-4 text-primary mt-0.5" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-800">
                                                                    AI
                                                                    Explanation
                                                                </p>
                                                                <p className="text-sm text-slate-600 mt-1">
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
                                                            <p className="text-sm font-medium text-slate-800 mb-2">
                                                                Conversation
                                                                Context
                                                            </p>
                                                            <div className="space-y-2 mb-3">
                                                                {result.context.before.map(
                                                                    (
                                                                        msg,
                                                                        idx
                                                                    ) => (
                                                                        <div
                                                                            key={`before-${idx}`}
                                                                            className="text-xs text-slate-600 pl-3 py-2 border-l-2 border-slate-300 whitespace-normal break-words"
                                                                        >
                                                                            {
                                                                                msg
                                                                            }
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                            <div className="text-xs bg-primary/10 p-3 rounded my-3 text-slate-800 font-medium border-l-2 border-primary whitespace-normal break-words">
                                                                {
                                                                    result
                                                                        .message
                                                                        .content
                                                                }
                                                            </div>
                                                            <div className="space-y-2 mt-3">
                                                                {result.context.after.map(
                                                                    (
                                                                        msg,
                                                                        idx
                                                                    ) => (
                                                                        <div
                                                                            key={`after-${idx}`}
                                                                            className="text-xs text-slate-600 pl-3 py-2 border-l-2 border-slate-300 whitespace-normal break-words"
                                                                        >
                                                                            {
                                                                                msg
                                                                            }
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                    <Search className="h-10 w-10 text-slate-300 mb-3" />
                                    <h3 className="font-medium text-slate-700">
                                        No results found
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 max-w-md">
                                        Try a different search term, adjust the
                                        similarity threshold, or change the
                                        filter settings
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
