import { useEffect, useState } from "react";
import { Message } from "@/lib/api";

// Storage key for localStorage
const STORAGE_KEY = "chatlore_data";

// Hook to use localStorage for message storage
export function useTinyBase() {
    const [isReady, setIsReady] = useState(false);
    // Using lastUpdated as a trigger for re-renders when data changes
    const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

    // Initialize the store on component mount
    useEffect(() => {
        setIsReady(true);
        return () => {
            // No cleanup needed
        };
    }, []);

    // Function to add a message
    const addMessage = (message: Message) => {
        const messages = getMessages();
        const id = crypto.randomUUID();

        // Add ID to the message
        const messageWithId = {
            ...message,
            id,
        };

        // Add to messages array
        messages.push(messageWithId);

        // Update localStorage
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                messages,
                lastUpdated: Date.now(),
            })
        );

        // Update state to trigger re-render
        setLastUpdated(Date.now());
    };

    // Function to get all messages
    const getMessages = (): Message[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return [];

            const parsedData = JSON.parse(data);
            if (!parsedData.messages || !Array.isArray(parsedData.messages))
                return [];

            return parsedData.messages.map((msg: Record<string, unknown>) => {
                // Ensure timestamp is in ISO format
                if (typeof msg.timestamp === "string") {
                    msg.timestamp = new Date(msg.timestamp).toISOString();
                }

                // Ensure boolean properties
                msg.is_system_message = Boolean(msg.is_system_message);

                return msg as unknown as Message;
            });
        } catch (error) {
            console.error("Error loading messages from localStorage:", error);
            return [];
        }
    };

    // Function to clear all messages
    const clearMessages = () => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                messages: [],
                lastUpdated: Date.now(),
            })
        );
        setLastUpdated(Date.now());
    };

    return {
        store: null, // Keeping API compatible but not using store
        addMessage,
        getMessages,
        clearMessages,
        isReady,
        lastUpdated, // Exposing lastUpdated to allow components to react to changes
    };
}
