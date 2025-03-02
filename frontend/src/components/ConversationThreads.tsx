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
    MessageSquare,
    Users,
    Calendar,
    AlertTriangle,
    MessageCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "./ui/collapsible";
import { ScrollArea } from "./ui/scroll-area";
import { useConversationThreads } from "@/lib/queries";
import { useState } from "react";
import { useChatContext } from "@/lib/ChatContext";

interface ConversationThread {
    id: string;
    title: string;
    messageIds: string[];
    startTime: string;
    endTime: string;
    participants: string[];
    topics: string[];
    sentiment: "positive" | "negative" | "neutral";
}

const ConversationThreads = () => {
    const { messages: contextMessages } = useChatContext();

    // Convert ChatContext Message type to API Message type
    const messages = contextMessages.map((msg) => ({
        id: msg.id,
        timestamp: msg.timestamp.toISOString(),
        sender: msg.sender,
        content: msg.content,
        message_type: msg.messageType || "text",
        is_system_message: msg.isSystemMessage || false,
    }));

    const { data, isPending, error } = useConversationThreads(messages);
    const [expandedThreads, setExpandedThreads] = useState<
        Record<string, boolean>
    >({});

    const toggleThread = (threadId: string) => {
        setExpandedThreads((prev) => ({
            ...prev,
            [threadId]: !prev[threadId],
        }));
    };

    const getSentimentColor = (sentiment: string) => {
        switch (sentiment.toLowerCase()) {
            case "positive":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            case "negative":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "neutral":
            default:
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
        }
    };

    const getSentimentIcon = (sentiment: string) => {
        switch (sentiment.toLowerCase()) {
            case "positive":
                return "😊";
            case "negative":
                return "😞";
            case "neutral":
            default:
                return "😐";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();
    };

    if (isPending) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Conversation Threads</CardTitle>
                    <CardDescription>
                        Loading conversation threads...
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
                    <CardTitle>Conversation Threads</CardTitle>
                    <CardDescription>
                        There was a problem loading conversation threads
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            {error instanceof Error
                                ? error.message
                                : "Failed to load conversation threads"}
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const { threads = [] } = data || {};

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <CardTitle>Conversation Threads</CardTitle>
                </div>
                <CardDescription>
                    AI-identified conversation threads from your chat
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="all">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All Threads</TabsTrigger>
                        <TabsTrigger value="positive">Positive</TabsTrigger>
                        <TabsTrigger value="negative">Negative</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="pt-4">
                        <ThreadList
                            threads={threads}
                            expandedThreads={expandedThreads}
                            toggleThread={toggleThread}
                            getSentimentColor={getSentimentColor}
                            getSentimentIcon={getSentimentIcon}
                            formatDate={formatDate}
                            getInitials={getInitials}
                        />
                    </TabsContent>

                    <TabsContent value="positive" className="pt-4">
                        <ThreadList
                            threads={threads.filter(
                                (t) => t.sentiment === "positive"
                            )}
                            expandedThreads={expandedThreads}
                            toggleThread={toggleThread}
                            getSentimentColor={getSentimentColor}
                            getSentimentIcon={getSentimentIcon}
                            formatDate={formatDate}
                            getInitials={getInitials}
                        />
                    </TabsContent>

                    <TabsContent value="negative" className="pt-4">
                        <ThreadList
                            threads={threads.filter(
                                (t) => t.sentiment === "negative"
                            )}
                            expandedThreads={expandedThreads}
                            toggleThread={toggleThread}
                            getSentimentColor={getSentimentColor}
                            getSentimentIcon={getSentimentIcon}
                            formatDate={formatDate}
                            getInitials={getInitials}
                        />
                    </TabsContent>

                    <TabsContent value="topics" className="space-y-4">
                        {data?.threads
                            .sort((a, b) => b.topics.length - a.topics.length)
                            .map((thread) => (
                                <Collapsible
                                    key={thread.id}
                                    open={expandedThreads[thread.id]}
                                    className="border rounded-lg overflow-hidden"
                                >
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium">
                                                    {thread.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {thread.topics.map(
                                                        (
                                                            topic: string,
                                                            i: number
                                                        ) => (
                                                            <Badge
                                                                key={i}
                                                                variant="outline"
                                                            >
                                                                {topic}
                                                            </Badge>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        toggleThread(thread.id)
                                                    }
                                                >
                                                    {expandedThreads[thread.id]
                                                        ? "Hide"
                                                        : "Show"}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </div>
                                    </div>
                                    <CollapsibleContent>
                                        <div className="p-4 pt-0">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <h4 className="text-sm font-medium mb-1">
                                                        Participants
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {thread.participants.map(
                                                            (
                                                                participant: string,
                                                                i: number
                                                            ) => (
                                                                <Badge
                                                                    key={i}
                                                                    variant="secondary"
                                                                >
                                                                    {
                                                                        participant
                                                                    }
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium mb-1">
                                                        Time Period
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDate(
                                                            thread.startTime
                                                        )}{" "}
                                                        -{" "}
                                                        {formatDate(
                                                            thread.endTime
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

interface ThreadListProps {
    threads: ConversationThread[];
    expandedThreads: Record<string, boolean>;
    toggleThread: (threadId: string) => void;
    getSentimentColor: (sentiment: string) => string;
    getSentimentIcon: (sentiment: string) => string;
    formatDate: (dateString: string) => string;
    getInitials: (name: string) => string;
}

const ThreadList = ({
    threads,
    expandedThreads,
    toggleThread,
    getSentimentColor,
    getSentimentIcon,
    formatDate,
    getInitials,
}: ThreadListProps) => {
    if (threads.length === 0) {
        return (
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Threads</AlertTitle>
                <AlertDescription>
                    No conversation threads found in this category.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <ScrollArea className="h-[400px]">
            <div className="space-y-4">
                {threads.map((thread) => (
                    <Collapsible
                        key={thread.id}
                        open={expandedThreads[thread.id]}
                        onOpenChange={() => toggleThread(thread.id)}
                        className="border rounded-lg"
                    >
                        <div className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium">
                                        {thread.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>
                                                {thread.messageIds.length}{" "}
                                                messages
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            <span>
                                                {thread.participants.length}{" "}
                                                participants
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                {new Date(
                                                    thread.startTime
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Badge
                                    className={getSentimentColor(
                                        thread.sentiment
                                    )}
                                >
                                    {getSentimentIcon(thread.sentiment)}{" "}
                                    {thread.sentiment}
                                </Badge>
                            </div>

                            <CollapsibleTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2"
                                >
                                    {expandedThreads[thread.id]
                                        ? "Show Less"
                                        : "Show More"}
                                </Button>
                            </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent>
                            <div className="px-4 pb-4 space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium mb-2">
                                        Participants
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {thread.participants.map(
                                            (participant: string) => (
                                                <div
                                                    key={participant}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarFallback>
                                                            {getInitials(
                                                                participant
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm">
                                                        {participant}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-2">
                                        Topics
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                        {thread.topics.map((topic: string) => (
                                            <Badge
                                                key={topic}
                                                variant="outline"
                                            >
                                                {topic}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium mb-2">
                                        Timeline
                                    </h4>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <div>
                                            <div className="font-medium">
                                                Started
                                            </div>
                                            <div>
                                                {formatDate(thread.startTime)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                Ended
                                            </div>
                                            <div>
                                                {formatDate(thread.endTime)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
        </ScrollArea>
    );
};

export { ConversationThreads };
