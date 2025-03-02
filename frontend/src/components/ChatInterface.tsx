import { useState, useRef, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import {
    Send,
    Bot,
    User,
    Paperclip,
    Trash2,
    Link,
    AlertCircle,
} from "lucide-react";
import { Badge } from "./ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import { useAnswerQuestionStateless } from "../lib/queries";
import { Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface ChatMessage {
    id: string;
    content: string;
    sender: string;
    timestamp: Date;
    isUser: boolean;
    status?: "success" | "error";
    error_type?: string;
    confidence?: number;
    relevantMessages?: Array<{
        sender: string;
        content: string;
        [key: string]: unknown;
    }>;
}

interface ChatInterfaceProps {
    chatId?: string;
    chatName?: string;
    onDeleteChat?: (chatId: string) => void;
}

const ChatInterface = ({
    chatId,
    chatName,
    onDeleteChat,
}: ChatInterfaceProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            content:
                "Welcome to ChatLore! I'm here to help you explore your chat data. Ask me anything about your conversations.",
            sender: "ChatLore",
            timestamp: new Date(),
            isUser: false,
        },
    ]);

    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { refetch, isError } = useAnswerQuestionStateless(currentQuestion);

    useEffect(() => {
        // Scroll to bottom whenever messages change
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        // Focus input when component mounts
        inputRef.current?.focus();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: uuidv4(),
            content: inputValue,
            sender: "You",
            timestamp: new Date(),
            isUser: true,
        };

        setMessages((prev) => [...prev, userMessage]);
        setCurrentQuestion(inputValue);
        setInputValue("");
        setIsLoading(true);

        try {
            const result = await refetch();

            if (isError || !result.data) {
                throw new Error("Failed to get answer");
            }

            const response = result.data as { answer?: string } | string;

            const responseContent =
                typeof response === "string"
                    ? response
                    : response?.answer ||
                      "Sorry, I couldn't process your request.";

            const botMessage: ChatMessage = {
                id: uuidv4(),
                content: responseContent,
                sender: "ChatLore",
                timestamp: new Date(),
                isUser: false,
                status: "success",
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: uuidv4(),
                content:
                    "Sorry, I couldn't process your request. Please try again later.",
                sender: "ChatLore",
                timestamp: new Date(),
                isUser: false,
                status: "error",
                error_type:
                    error instanceof Error ? error.message : "Unknown error",
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status?: string) => {
        if (status === "success") return "bg-green-100 text-green-800";
        if (status === "error") return "bg-red-100 text-red-800";
        return "bg-gray-100 text-gray-800";
    };

    const formatConfidence = (confidence?: number) => {
        if (confidence === undefined) return "N/A";
        return `${Math.round(confidence * 100)}%`;
    };

    return (
        <Card className="w-full h-[600px] flex flex-col shadow-md border-primary/10">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 bg-primary/20">
                            <AvatarFallback>
                                <Bot className="h-4 w-4 text-primary" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">
                                {chatName || "Chat with Your Data"}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {chatId
                                    ? `Chat ID: ${chatId.substring(0, 8)}...`
                                    : "New conversation"}
                            </CardDescription>
                        </div>
                    </div>
                    {chatId && onDeleteChat && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDeleteChat(chatId)}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Delete this chat</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 border-t">
                <ScrollArea className="h-[calc(600px-8rem)]">
                    <div className="space-y-4 p-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.isUser
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`flex gap-3 max-w-[80%] ${
                                        message.isUser
                                            ? "flex-row-reverse"
                                            : "flex-row"
                                    }`}
                                >
                                    <Avatar
                                        className={
                                            message.isUser
                                                ? "bg-primary"
                                                : "bg-secondary"
                                        }
                                    >
                                        <AvatarFallback>
                                            {message.isUser ? (
                                                <User className="h-4 w-4" />
                                            ) : (
                                                <Bot className="h-4 w-4" />
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">
                                                {message.sender}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {message.timestamp.toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    }
                                                )}
                                            </span>
                                            {message.status && (
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getStatusColor(
                                                        message.status
                                                    )}`}
                                                >
                                                    {message.status}
                                                </Badge>
                                            )}
                                            {message.confidence !==
                                                undefined && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs bg-blue-100 text-blue-800"
                                                >
                                                    {formatConfidence(
                                                        message.confidence
                                                    )}
                                                </Badge>
                                            )}
                                        </div>

                                        <div
                                            className={`rounded-lg p-3 ${
                                                message.isUser
                                                    ? "bg-primary text-primary-foreground"
                                                    : message.status === "error"
                                                    ? "bg-red-50 border border-red-200"
                                                    : "bg-muted"
                                            }`}
                                        >
                                            {message.status === "error" &&
                                                !message.isUser && (
                                                    <div className="flex items-center gap-2 mb-2 text-red-600">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span className="text-xs font-medium">
                                                            Error
                                                        </span>
                                                    </div>
                                                )}
                                            <p className="text-sm whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                            {message.error_type && (
                                                <p className="text-xs text-red-500 mt-2">
                                                    {message.error_type}
                                                </p>
                                            )}
                                        </div>

                                        {message.relevantMessages &&
                                            message.relevantMessages.length >
                                                0 && (
                                                <div className="pl-2 border-l-2 border-primary/30 mt-2">
                                                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                                        <Link className="h-3 w-3" />
                                                        Related messages:
                                                    </p>
                                                    <div className="space-y-2">
                                                        {message.relevantMessages.map(
                                                            (relMsg, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="bg-background border rounded-md p-2 text-xs"
                                                                >
                                                                    <div className="font-medium mb-1">
                                                                        {
                                                                            relMsg.sender
                                                                        }
                                                                    </div>
                                                                    <p className="text-muted-foreground">
                                                                        {
                                                                            relMsg.content
                                                                        }
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[80%]">
                                    <Avatar className="bg-secondary">
                                        <AvatarFallback>
                                            <Bot className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            <p className="text-sm text-muted-foreground">
                                                Thinking...
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-3">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0"
                                >
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Attach file (coming soon)</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Input
                        ref={inputRef}
                        placeholder="Ask about your chat history..."
                        value={inputValue}
                        onChange={handleInputChange}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        disabled={!inputValue.trim() || isLoading}
                        className="shrink-0"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};

export { ChatInterface };
