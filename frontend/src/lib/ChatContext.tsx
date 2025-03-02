import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useContext,
} from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import * as db from "./db";

// Define types for our context
interface Message {
    id?: string;
    chatId: string;
    timestamp: Date;
    sender: string;
    content: string;
    messageType: string;
    duration?: number;
    url?: string;
    language?: string;
    isSystemMessage: boolean;
}

interface Chat {
    id: string;
    name: string;
    uploadDate: Date;
    messageCount: number;
}

interface SecurityAnalysis {
    id: string;
    chatId: string;
    timestamp: Date;
    securityScore: number;
    findings: unknown[];
    recommendations: unknown[];
}

interface SensitiveDataItem {
    id: string;
    chatId: string;
    type: string;
    value: string;
    messageIds: string[];
}

interface ChatContextType {
    // Current state
    currentChatId: string | null;
    chats: Chat[];
    messages: Message[];
    securityAnalysis: SecurityAnalysis | null;
    sensitiveData: SensitiveDataItem[];
    isLoading: boolean;

    // Actions
    setCurrentChat: (chatId: string) => Promise<void>;
    uploadChat: (name: string, chatText: string) => Promise<string>;
    deleteChat: (chatId: string) => Promise<void>;
    getParserContext: () => Promise<unknown | null>;
    saveParserContext: (data: string, type: string) => Promise<void>;
    refreshSecurityAnalysis: () => Promise<void>;
}

// Create the context with a default value
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = "http://localhost:8000";

// Custom hook to use the chat context
export function useChatContext() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error("useChatContext must be used within a ChatProvider");
    }
    return context;
}

// Provider component
export const ChatProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [securityAnalysis, setSecurityAnalysis] =
        useState<SecurityAnalysis | null>(null);
    const [sensitiveData, setSensitiveData] = useState<SensitiveDataItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Load all chats on initial render
    useEffect(() => {
        const loadChats = async () => {
            try {
                const allChats = await db.getAllChats();
                setChats(
                    allChats.map((chat) => ({
                        ...chat,
                        uploadDate: new Date(chat.uploadDate),
                    }))
                );

                // If there are chats and no current chat is selected, select the most recent one
                if (allChats.length > 0 && !currentChatId) {
                    const mostRecentChat = allChats.sort(
                        (a, b) =>
                            new Date(b.uploadDate).getTime() -
                            new Date(a.uploadDate).getTime()
                    )[0];

                    await setCurrentChat(mostRecentChat.id);
                }
            } catch (error) {
                console.error("Failed to load chats:", error);
            }
        };

        loadChats();
    }, []);

    // Function to set the current chat and load its data
    const setCurrentChat = async (chatId: string) => {
        setIsLoading(true);
        try {
            // Load messages for this chat
            const chatMessages = await db.getMessages(chatId);
            setMessages(
                chatMessages.map((msg) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp),
                }))
            );

            // Load security analysis
            const analysis = await db.getSecurityAnalysis(chatId);
            if (analysis) {
                setSecurityAnalysis({
                    ...analysis,
                    timestamp: new Date(analysis.timestamp),
                });
            } else {
                setSecurityAnalysis(null);
            }

            // Load sensitive data
            const sensitive = await db.getSensitiveData(chatId);
            setSensitiveData(sensitive);

            // Update current chat ID
            setCurrentChatId(chatId);
        } catch (error) {
            console.error("Failed to load chat data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to upload a new chat
    const uploadChat = async (
        name: string,
        chatText: string
    ): Promise<string> => {
        setIsLoading(true);
        try {
            // Generate a unique ID for the chat
            const chatId = uuidv4();

            // Create a new chat object
            const newChat: Chat = {
                id: chatId,
                name,
                uploadDate: new Date(),
                messageCount: 0, // Will be updated after parsing
            };

            // Save the chat to IndexedDB
            await db.saveChat({
                ...newChat,
                uploadDate: newChat.uploadDate.getTime(),
            });

            // Send the chat text to the backend for processing using the stateless API
            const response = await axios.post(
                `${API_BASE_URL}/api/chat/process`,
                {
                    chat_text: chatText,
                }
            );

            if (!response.data) {
                throw new Error("Failed to process chat");
            }

            const data = response.data;

            // Convert the parsed messages to our format and save them
            const parsedMessages: Message[] = data.messages.map(
                (msg: {
                    timestamp: string | number;
                    sender: string;
                    content?: string;
                    message_type: string;
                    duration?: number;
                    url?: string;
                    language?: string;
                    is_system_message: boolean;
                }) => ({
                    id: uuidv4(),
                    chatId,
                    timestamp: new Date(msg.timestamp),
                    sender: msg.sender,
                    content: msg.content || "",
                    messageType: msg.message_type,
                    duration: msg.duration,
                    url: msg.url,
                    language: msg.language,
                    isSystemMessage: msg.is_system_message,
                })
            );

            // Save messages to IndexedDB
            await db.saveMessages(
                parsedMessages.map((msg) => ({
                    ...msg,
                    timestamp: msg.timestamp.getTime(),
                }))
            );

            // Update chat with correct message count
            newChat.messageCount = parsedMessages.length;
            await db.saveChat({
                ...newChat,
                uploadDate: newChat.uploadDate.getTime(),
            });

            // Update state
            setChats((prevChats) => [...prevChats, newChat]);

            // Set this as the current chat
            await setCurrentChat(chatId);

            return chatId;
        } catch (error) {
            console.error("Failed to upload chat:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Function to delete a chat
    const deleteChat = async (chatId: string) => {
        setIsLoading(true);
        try {
            await db.deleteChat(chatId);

            // Update state
            setChats((prevChats) =>
                prevChats.filter((chat) => chat.id !== chatId)
            );

            // If the deleted chat was the current one, select another chat or set to null
            if (currentChatId === chatId) {
                const remainingChats = chats.filter(
                    (chat) => chat.id !== chatId
                );
                if (remainingChats.length > 0) {
                    await setCurrentChat(remainingChats[0].id);
                } else {
                    setCurrentChatId(null);
                    setMessages([]);
                    setSecurityAnalysis(null);
                    setSensitiveData([]);
                }
            }
        } catch (error) {
            console.error("Failed to delete chat:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to get parser context
    const getParserContext = async () => {
        if (!currentChatId) return null;

        try {
            const contextData = await db.getContextData(
                currentChatId,
                "parser"
            );
            return contextData?.data || null;
        } catch (error) {
            console.error("Failed to get parser context:", error);
            return null;
        }
    };

    // Function to save parser context
    const saveParserContext = async (data: string, type: string) => {
        if (!currentChatId) return;

        try {
            const contextData = {
                id: uuidv4(),
                chatId: currentChatId,
                type,
                data,
                lastUpdated: new Date().getTime(),
            };

            await db.saveContextData(contextData);
        } catch (error) {
            console.error("Failed to save parser context:", error);
        }
    };

    // Function to refresh security analysis
    const refreshSecurityAnalysis = async () => {
        if (!currentChatId) return;

        setIsLoading(true);
        try {
            // Get the current messages for this chat
            const chatMessages = await db.getMessages(currentChatId);

            if (chatMessages.length === 0) {
                throw new Error("No messages available for analysis");
            }

            // Format messages for the API
            const formattedMessages = chatMessages.map((msg) => ({
                timestamp: msg.timestamp,
                sender: msg.sender,
                content: msg.content,
                message_type: msg.messageType,
                duration: msg.duration,
                url: msg.url,
                language: msg.language,
                is_system_message: msg.isSystemMessage,
            }));

            // Call the security analysis endpoint with the stateless API
            const response = await axios.post(
                `${API_BASE_URL}/api/security/analyze`,
                { messages: formattedMessages }
            );

            if (!response.data) {
                throw new Error("Failed to get security analysis");
            }

            const analysisData = response.data;

            // Create a security analysis object
            const analysis: SecurityAnalysis = {
                id: uuidv4(),
                chatId: currentChatId,
                timestamp: new Date(),
                securityScore: analysisData.security_score,
                findings: analysisData.findings,
                recommendations: analysisData.recommendations,
            };

            // Save to IndexedDB
            await db.saveSecurityAnalysis({
                ...analysis,
                timestamp: analysis.timestamp.getTime(),
            });

            // Update state
            setSecurityAnalysis(analysis);

            // Get sensitive data using the stateless API
            const sensitiveResponse = await axios.post(
                `${API_BASE_URL}/api/security/sensitive-data`,
                { messages: formattedMessages }
            );

            if (sensitiveResponse.data) {
                const sensitiveData = sensitiveResponse.data;

                // Convert to our format
                const sensitiveItems: SensitiveDataItem[] = Object.entries(
                    sensitiveData as Record<string, string[]>
                ).map(([type, values]) => ({
                    id: uuidv4(),
                    chatId: currentChatId,
                    type,
                    value: values.join(", "),
                    messageIds: [], // We would need to map these to actual message IDs
                }));

                // Save to IndexedDB
                await db.saveSensitiveData(sensitiveItems);

                // Update state
                setSensitiveData(sensitiveItems);
            }
        } catch (error) {
            console.error("Failed to refresh security analysis:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Create the context value object
    const contextValue: ChatContextType = {
        currentChatId,
        chats,
        messages,
        securityAnalysis,
        sensitiveData,
        isLoading,
        setCurrentChat,
        uploadChat,
        deleteChat,
        getParserContext,
        saveParserContext,
        refreshSecurityAnalysis,
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};
