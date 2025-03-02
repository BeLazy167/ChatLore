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
import { Badge } from "./ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";
import {
    Send,
    Bot,
    User,
    Info,
    MessageSquare,
    AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useChatContext } from "@/lib/ChatContext";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface ChatMessage {
    id: string;
    content: string;
    sender: string;
    timestamp: Date;
    isUser: boolean;
    confidence?: number;
    relevantMessages?: Array<{
        sender: string;
        content: string;
        [key: string]: unknown;
    }>;
}

interface ChatInterfaceProps {
    selectedChatId: string | null;
}

const ChatInterface = ({ selectedChatId }: ChatInterfaceProps) => {
    const { chats } = useChatContext();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            content:
                "Hello! I can help you analyze your WhatsApp chat. Ask me anything about your conversations.",
            sender: "ChatLore",
            timestamp: new Date(),
            isUser: false,
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Get the selected chat name
    const selectedChat = selectedChatId
        ? chats.find((chat) => chat.id === selectedChatId)
        : null;

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Reset chat messages when selected chat changes
    useEffect(() => {
        if (selectedChatId) {
            setMessages([
                {
                    id: "welcome",
                    content: `I'm ready to answer questions about "${
                        selectedChat?.name || "your chat"
                    }". What would you like to know?`,
                    sender: "ChatLore",
                    timestamp: new Date(),
                    isUser: false,
                },
            ]);
        } else {
            setMessages([
                {
                    id: "welcome",
                    content: "Please select a chat to start asking questions.",
                    sender: "ChatLore",
                    timestamp: new Date(),
                    isUser: false,
                },
            ]);
        }
    }, [selectedChatId, selectedChat?.name]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputValue.trim() || !selectedChatId) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputValue,
            sender: "You",
            timestamp: new Date(),
            isUser: true,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            // Convert ChatMessage[] to Message[] for the API
            const apiMessages = messages.map((msg) => ({
                id: msg.id,
                timestamp: msg.timestamp.toISOString(),
                sender: msg.sender,
                content: msg.content,
                message_type: "text",
                is_system_message: !msg.isUser,
            }));

            // Send the question to the backend using our API client
            const data = await api.chat.chatQuestion(
                userMessage.content,
                selectedChatId,
                apiMessages
            );

            if (data.success) {
                // Add bot response
                const botMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    content: data.response.answer,
                    sender: "ChatLore",
                    timestamp: new Date(data.response.timestamp),
                    isUser: false,
                    confidence: data.response.confidence,
                    relevantMessages: data.response.relevantMessages,
                };

                setMessages((prev) => [...prev, botMessage]);
            } else {
                throw new Error("Failed to get a response");
            }
        } catch {
            // Add error message
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content:
                    "Sorry, I encountered an error while processing your question. Please try again later.",
                sender: "ChatLore",
                timestamp: new Date(),
                isUser: false,
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const getConfidenceColor = (confidence?: number) => {
        if (confidence === undefined) return "bg-gray-100 text-gray-800";
        if (confidence >= 0.8) return "bg-green-100 text-green-800";
        if (confidence >= 0.5) return "bg-yellow-100 text-yellow-800";
        return "bg-red-100 text-red-800";
    };

    const formatConfidence = (confidence?: number) => {
        if (confidence === undefined) return "N/A";
        return `${Math.round(confidence * 100)}%`;
    };

    return (
        <Card className="w-full h-[600px] flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle>Chat with Your Data</CardTitle>
                </div>
                <CardDescription>
                    {selectedChat
                        ? `Ask questions about "${selectedChat.name}" (${selectedChat.messageCount} messages)`
                        : "Select a chat to start asking questions"}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                {!selectedChatId ? (
                    <div className="h-full flex items-center justify-center p-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>No chat selected</AlertTitle>
                            <AlertDescription>
                                Please select a chat from the chat selector to
                                start asking questions.
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : (
                    <ScrollArea className="h-[calc(600px-8rem)] px-4">
                        <div className="space-y-4 pt-4 pb-4">
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
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium">
                                                    {message.sender}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {message.timestamp.toLocaleTimeString()}
                                                </span>

                                                {!message.isUser &&
                                                    message.confidence !==
                                                        undefined && (
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={getConfidenceColor(
                                                                            message.confidence
                                                                        )}
                                                                    >
                                                                        {formatConfidence(
                                                                            message.confidence
                                                                        )}
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>
                                                                        Confidence
                                                                        score
                                                                        for this
                                                                        answer
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    )}
                                            </div>

                                            <div
                                                className={`rounded-lg p-3 ${
                                                    message.isUser
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted"
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">
                                                    {message.content}
                                                </p>
                                            </div>

                                            {!message.isUser &&
                                                message.relevantMessages &&
                                                message.relevantMessages
                                                    .length > 0 && (
                                                    <div className="mt-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                                                                        <Info className="h-3 w-3" />
                                                                        <span>
                                                                            Based
                                                                            on{" "}
                                                                            {
                                                                                message
                                                                                    .relevantMessages
                                                                                    .length
                                                                            }{" "}
                                                                            messages
                                                                        </span>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="w-80">
                                                                    <p className="font-medium mb-1">
                                                                        Source
                                                                        Messages:
                                                                    </p>
                                                                    <ul className="text-xs space-y-1">
                                                                        {message.relevantMessages
                                                                            .slice(
                                                                                0,
                                                                                3
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    msg,
                                                                                    index
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        className="flex items-start gap-1"
                                                                                    >
                                                                                        <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                                                        <span>
                                                                                            <span className="font-medium">
                                                                                                {
                                                                                                    msg.sender
                                                                                                }

                                                                                                :
                                                                                            </span>{" "}
                                                                                            {msg.content.substring(
                                                                                                0,
                                                                                                60
                                                                                            )}
                                                                                            {msg
                                                                                                .content
                                                                                                .length >
                                                                                            60
                                                                                                ? "..."
                                                                                                : ""}
                                                                                        </span>
                                                                                    </li>
                                                                                )
                                                                            )}
                                                                        {message
                                                                            .relevantMessages
                                                                            .length >
                                                                            3 && (
                                                                            <li className="text-muted-foreground">
                                                                                +
                                                                                {message
                                                                                    .relevantMessages
                                                                                    .length -
                                                                                    3}{" "}
                                                                                more
                                                                                messages
                                                                            </li>
                                                                        )}
                                                                    </ul>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
            <CardFooter className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Input
                        placeholder={
                            selectedChatId
                                ? "Ask a question about your chat..."
                                : "Select a chat to start asking questions"
                        }
                        value={inputValue}
                        onChange={handleInputChange}
                        disabled={isLoading || !selectedChatId}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        disabled={
                            isLoading || !inputValue.trim() || !selectedChatId
                        }
                    >
                        {isLoading ? (
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
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
