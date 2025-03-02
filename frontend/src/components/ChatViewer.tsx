import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Message {
    sender: string;
    content: string;
    timestamp: string;
    message_type?: string;
    url?: string | null;
}

interface ChatViewerProps {
    selectedChatName: string | null;
}

export function ChatViewer({ selectedChatName }: ChatViewerProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const queryClient = useQueryClient();

    // Use TanStack Query for global state management of selected chat
    const { data: chatName } = useQuery({
        queryKey: ["selectedChat"],
        queryFn: () => {
            if (selectedChatName) {
                return selectedChatName;
            } else {
                const allChats = JSON.parse(
                    localStorage.getItem("chat_names") || "[]"
                );
                return allChats.length > 0 ? allChats[0] : "";
            }
        },
        staleTime: Infinity, // Keep the data fresh until explicitly invalidated
    });

    useEffect(() => {
        if (chatName) {
            // Update the query cache when selectedChatId changes
            queryClient.setQueryData(["selectedChat"], chatName);

            // Load messages for the selected chat
            const chatMessages = JSON.parse(
                localStorage.getItem(chatName) || "[]"
            );
            setMessages(chatMessages);
        } else {
            setMessages([]);
        }
    }, [chatName, queryClient, selectedChatName]);

    if (!chatName) {
        return (
            <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center text-muted-foreground">
                    Select a chat to view its contents
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
                <CardTitle className="text-xl font-semibold">
                    {chatName}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground">
                            No messages to display
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm">
                                        {message.sender}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(
                                            message.timestamp
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
