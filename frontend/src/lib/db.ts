import { createStore, Store } from "tinybase";

// Define types for our data
export interface Chat {
    id: string;
    name: string;
    uploadDate: number; // Store as timestamp
    messageCount: number;
}

export interface Message {
    id?: string;
    chatId: string;
    timestamp: number; // Store as timestamp
    sender: string;
    content: string;
    messageType: string;
    duration?: number;
    url?: string;
    language?: string;
    isSystemMessage: boolean;
}

export interface SensitiveDataItem {
    id: string;
    chatId: string;
    type: string;
    value: string;
    messageIds: string[];
}

export interface SecurityAnalysis {
    id: string;
    chatId: string;
    timestamp: number; // Store as timestamp
    securityScore: number;
    findings: unknown[]; // Store as array
    recommendations: unknown[]; // Store as array
}

export interface ContextData {
    id: string;
    chatId: string;
    type: string; // 'parser', 'embeddings', etc.
    data: unknown; // Store as unknown
    lastUpdated: number; // Store as timestamp
}

// Store configuration
const DB_NAME = "chatlore-db";

// Initialize the store
let store: Store | null = null;

export function getStore(): Store {
    if (!store) {
        store = createStore();

        // Set up tables
        store.setTable("chats", {});
        store.setTable("messages", {});
        store.setTable("sensitiveData", {});
        store.setTable("securityAnalysis", {});
        store.setTable("contextData", {});

        // Set up persistence with localStorage
        // Listen for changes to any table
        const storeInstance = store; // Create a non-null reference
        Object.keys(storeInstance.getTables()).forEach((tableName) => {
            storeInstance.addRowListener(tableName, null, () => {
                try {
                    localStorage.setItem(
                        DB_NAME,
                        JSON.stringify(storeInstance.getTables())
                    );
                } catch (error) {
                    console.error("Error saving to localStorage:", error);
                }
            });
        });

        // Load data from localStorage if available
        try {
            const savedData = localStorage.getItem(DB_NAME);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                store.setTables(parsedData);
            }
        } catch (error) {
            console.error("Error loading from localStorage:", error);
        }
    }

    return store;
}

// Initialize the database
export async function initDB(): Promise<Store> {
    return getStore();
}

// Chat operations
export async function saveChat(chat: Chat): Promise<void> {
    const store = getStore();
    const uploadDate =
        typeof chat.uploadDate === "number" ? chat.uploadDate : Date.now();

    store.setRow("chats", chat.id, {
        ...chat,
        uploadDate,
    });
}

export async function getChat(id: string): Promise<Chat | undefined> {
    const store = getStore();
    const chat = store.getRow("chats", id);
    if (!chat) return undefined;

    const chatData = chat as Record<string, unknown>;
    return {
        id,
        name: chatData.name as string,
        uploadDate: chatData.uploadDate as number,
        messageCount: chatData.messageCount as number,
    };
}

export async function getAllChats(): Promise<Chat[]> {
    const store = getStore();
    const chats: Chat[] = [];

    const chatTable = store.getTable("chats");
    Object.entries(chatTable).forEach(([id, chat]) => {
        const chatData = chat as Record<string, unknown>;
        chats.push({
            id,
            name: chatData.name as string,
            uploadDate: chatData.uploadDate as number,
            messageCount: chatData.messageCount as number,
        });
    });

    // Sort by date (using timestamps for comparison)
    return chats.sort((a, b) => b.uploadDate - a.uploadDate);
}

export async function deleteChat(id: string): Promise<void> {
    const store = getStore();

    // Delete all related data
    const messagesTable = store.getTable("messages");
    Object.entries(messagesTable).forEach(([messageId, message]) => {
        const messageData = message as Record<string, unknown>;
        if (messageData.chatId === id) {
            store.delRow("messages", messageId);
        }
    });

    const sensitiveDataTable = store.getTable("sensitiveData");
    Object.entries(sensitiveDataTable).forEach(([itemId, item]) => {
        const itemData = item as Record<string, unknown>;
        if (itemData.chatId === id) {
            store.delRow("sensitiveData", itemId);
        }
    });

    const securityAnalysisTable = store.getTable("securityAnalysis");
    Object.entries(securityAnalysisTable).forEach(([analysisId, analysis]) => {
        const analysisData = analysis as Record<string, unknown>;
        if (analysisData.chatId === id) {
            store.delRow("securityAnalysis", analysisId);
        }
    });

    const contextDataTable = store.getTable("contextData");
    Object.entries(contextDataTable).forEach(([contextId, context]) => {
        const contextData = context as Record<string, unknown>;
        if (contextData.chatId === id) {
            store.delRow("contextData", contextId);
        }
    });

    // Delete the chat
    store.delRow("chats", id);
}

// Message operations
export async function saveMessages(messages: Message[]): Promise<void> {
    const store = getStore();

    messages.forEach((message) => {
        const timestamp =
            typeof message.timestamp === "number"
                ? message.timestamp
                : Date.now();

        store.setRow("messages", message.id || crypto.randomUUID(), {
            ...message,
            timestamp,
        });
    });
}

export async function getMessages(chatId: string): Promise<Message[]> {
    const store = getStore();
    const messages: Message[] = [];

    const messagesTable = store.getTable("messages");
    Object.entries(messagesTable).forEach(([id, message]) => {
        const messageData = message as Record<string, unknown>;
        if (messageData.chatId === chatId) {
            messages.push({
                id,
                chatId: messageData.chatId as string,
                timestamp: messageData.timestamp as number,
                sender: messageData.sender as string,
                content: messageData.content as string,
                messageType: messageData.messageType as string,
                duration: messageData.duration as number | undefined,
                url: messageData.url as string | undefined,
                language: messageData.language as string | undefined,
                isSystemMessage: messageData.isSystemMessage as boolean,
            });
        }
    });

    // Sort by timestamp
    return messages.sort((a, b) => a.timestamp - b.timestamp);
}

// Context data operations
export async function saveContextData(contextData: ContextData): Promise<void> {
    const store = getStore();
    const lastUpdated =
        typeof contextData.lastUpdated === "number"
            ? contextData.lastUpdated
            : Date.now();

    store.setRow("contextData", contextData.id, {
        ...contextData,
        data:
            typeof contextData.data === "string"
                ? contextData.data
                : JSON.stringify(contextData.data),
        lastUpdated,
    });
}

export async function getContextData(
    chatId: string,
    type: string
): Promise<ContextData | undefined> {
    const store = getStore();
    let result: ContextData | undefined;

    const contextDataTable = store.getTable("contextData");
    Object.entries(contextDataTable).forEach(([id, context]) => {
        const contextData = context as Record<string, unknown>;
        if (contextData.chatId === chatId && contextData.type === type) {
            result = {
                id,
                chatId: contextData.chatId as string,
                type: contextData.type as string,
                data:
                    typeof contextData.data === "string"
                        ? JSON.parse(contextData.data as string)
                        : contextData.data,
                lastUpdated: contextData.lastUpdated as number,
            };
        }
    });

    return result;
}

// Security analysis operations
export async function saveSecurityAnalysis(
    analysis: SecurityAnalysis
): Promise<void> {
    const store = getStore();
    const timestamp =
        typeof analysis.timestamp === "number"
            ? analysis.timestamp
            : Date.now();

    store.setRow("securityAnalysis", analysis.id, {
        ...analysis,
        findings:
            typeof analysis.findings === "string"
                ? analysis.findings
                : JSON.stringify(analysis.findings),
        recommendations:
            typeof analysis.recommendations === "string"
                ? analysis.recommendations
                : JSON.stringify(analysis.recommendations),
        timestamp,
    });
}

export async function getSecurityAnalysis(
    chatId: string
): Promise<SecurityAnalysis | undefined> {
    const store = getStore();
    let result: SecurityAnalysis | undefined;

    const securityAnalysisTable = store.getTable("securityAnalysis");
    Object.entries(securityAnalysisTable).forEach(([id, analysis]) => {
        const analysisData = analysis as Record<string, unknown>;
        if (analysisData.chatId === chatId) {
            result = {
                id,
                chatId: analysisData.chatId as string,
                timestamp: analysisData.timestamp as number,
                securityScore: analysisData.securityScore as number,
                findings:
                    typeof analysisData.findings === "string"
                        ? JSON.parse(analysisData.findings as string)
                        : (analysisData.findings as unknown[]),
                recommendations:
                    typeof analysisData.recommendations === "string"
                        ? JSON.parse(analysisData.recommendations as string)
                        : (analysisData.recommendations as unknown[]),
            };
        }
    });

    return result;
}

// Sensitive data operations
export async function saveSensitiveData(
    items: SensitiveDataItem[]
): Promise<void> {
    const store = getStore();

    items.forEach((item) => {
        store.setRow("sensitiveData", item.id, {
            ...item,
            messageIds: Array.isArray(item.messageIds)
                ? JSON.stringify(item.messageIds)
                : item.messageIds,
        });
    });
}

export async function getSensitiveData(
    chatId: string
): Promise<SensitiveDataItem[]> {
    const store = getStore();
    const items: SensitiveDataItem[] = [];

    const sensitiveDataTable = store.getTable("sensitiveData");
    Object.entries(sensitiveDataTable).forEach(([id, item]) => {
        const itemData = item as Record<string, unknown>;
        if (itemData.chatId === chatId) {
            items.push({
                id,
                chatId: itemData.chatId as string,
                type: itemData.type as string,
                value: itemData.value as string,
                messageIds:
                    typeof itemData.messageIds === "string"
                        ? JSON.parse(itemData.messageIds as string)
                        : (itemData.messageIds as string[]),
            });
        }
    });

    return items;
}
