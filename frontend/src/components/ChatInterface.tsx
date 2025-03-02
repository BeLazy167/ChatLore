import { useState, useRef } from "react";
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
import { Send, Bot, User } from "lucide-react";

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

const ChatInterface = () => {
    // Dummy implementation for now
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            content:
                "This is a dummy chat interface. Functionality coming soon!",
            sender: "ChatLore",
            timestamp: new Date(),
            isUser: false,
        },
    ]);
    const [inputValue, setInputValue] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Dummy data for development

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

        // Add dummy response
        setTimeout(() => {
            const botMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content:
                    "This is a dummy response. Real functionality coming soon!",
                sender: "ChatLore",
                timestamp: new Date(),
                isUser: false,
                confidence: 0.85,
            };

            setMessages((prev) => [...prev, botMessage]);
        }, 1000);
    };

    // const getConfidenceColor = (confidence?: number) => {
    //     if (confidence === undefined) return "bg-gray-100 text-gray-800";
    //     if (confidence >= 0.8) return "bg-green-100 text-green-800";
    //     if (confidence >= 0.5) return "bg-yellow-100 text-yellow-800";
    //     return "bg-red-100 text-red-800";
    // };

    // const formatConfidence = (confidence?: number) => {
    //     if (confidence === undefined) return "N/A";
    //     return `${Math.round(confidence * 100)}%`;
    // };

    return (
        <Card className="w-full h-[600px] flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle>Chat with Your Data (Dummy)</CardTitle>
                </div>
                <CardDescription>
                    This is a placeholder interface. Real functionality coming
                    soon!
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
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
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Input
                        placeholder="Type a message (dummy interface)"
                        value={inputValue}
                        onChange={handleInputChange}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!inputValue.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
};

export { ChatInterface };
