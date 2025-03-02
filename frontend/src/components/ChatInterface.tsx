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
import { Send, Bot, User, Paperclip, Trash2, Link } from "lucide-react";
import { Badge } from "./ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

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
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

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
        setIsTyping(true);

        // Simulate response
        setTimeout(() => {
            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content:
                    "I found some relevant information in your chat history. Let me analyze that for you...",
                sender: "ChatLore",
                timestamp: new Date(),
                isUser: false,
                confidence: 0.85,
                relevantMessages: [
                    {
                        sender: "Alice",
                        content:
                            "Let's meet tomorrow at 2pm at the coffee shop.",
                        timestamp: "2023-05-15T14:30:00Z",
                    },
                    {
                        sender: "Bob",
                        content:
                            "Sounds good, I'll bring the project documents.",
                        timestamp: "2023-05-15T14:32:00Z",
                    },
                ],
            };

            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
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
                                            {message.confidence !==
                                                undefined && (
                                                <Badge
                                                    variant="outline"
                                                    className={`text-xs ${getConfidenceColor(
                                                        message.confidence
                                                    )}`}
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
                                                    : "bg-muted"
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">
                                                {message.content}
                                            </p>
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
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[80%]">
                                    <Avatar className="bg-secondary">
                                        <AvatarFallback>
                                            <Bot className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-lg p-3">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                                            <div
                                                className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "0.2s",
                                                }}
                                            ></div>
                                            <div
                                                className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
                                                style={{
                                                    animationDelay: "0.4s",
                                                }}
                                            ></div>
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
                        disabled={!inputValue.trim() || isTyping}
                        className="shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};

export { ChatInterface };
