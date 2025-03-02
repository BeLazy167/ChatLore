import React, { useState, useRef } from "react";
import { useUploadChat } from "../lib/queries";
import { Button } from "./ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Upload } from "lucide-react";

interface ChatUploaderProps {
    selectedChatId?: string | null;
    onChatUploaded?: (chatId: string) => void;
    initialChatName?: string;
}

// Define the response type based on the API response structure
interface ChatUploadResponse {
    message: string;
    total_messages: number;
    statistics: Record<string, unknown>;
    messages: Array<{
        timestamp: string;
        sender: string;
        content: string;
        message_type: string;
        duration: string;
        url: string;
        language: string;
        is_system_message: boolean;
    }>;
    id?: string; // Add this field to match what's being used in the code
}

export function ChatUploader({
    selectedChatId,
    onChatUploaded,
    initialChatName = "",
}: ChatUploaderProps) {
    const [fileName, setFileName] = useState<string>("");
    const [chatName, setChatName] = useState<string>(initialChatName);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Use the TanStack Query mutation
    const uploadChatMutation = useUploadChat();

    // Update chat name when initialChatName changes
    React.useEffect(() => {
        if (initialChatName) {
            setChatName(initialChatName);
        }
    }, [initialChatName]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFileName(file.name);

            // Auto-generate a chat name from the file name if no chat is selected
            if (!selectedChatId) {
                const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
                setChatName(nameWithoutExtension);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !fileInputRef.current?.files ||
            fileInputRef.current.files.length === 0
        ) {
            alert("Please select a file to upload");
            return;
        }

        const file = fileInputRef.current.files[0];

        try {
            // Read the file content
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (event.target?.result) {
                    const chatText = event.target.result as string;

                    // Use TanStack Query mutation to upload the file
                    const response = await uploadChatMutation.mutateAsync(
                        chatText
                    );

                    // Notify parent component about the new chat
                    if (onChatUploaded && response) {
                        // Handle the case where id might not exist directly
                        const chatId =
                            (response as ChatUploadResponse).id || "";
                        onChatUploaded(chatId);
                    }

                    // Reset form
                    setFileName("");
                    if (!selectedChatId) {
                        setChatName("");
                    }
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error("Error uploading chat:", error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload WhatsApp Chat</CardTitle>
                <CardDescription>
                    Export your WhatsApp chat and upload the .txt file here
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label
                                className="block text-sm font-medium mb-1"
                                htmlFor="chatName"
                            >
                                Chat Name
                            </label>
                            <input
                                type="text"
                                id="chatName"
                                className="w-full p-2 border rounded-md bg-background"
                                value={chatName}
                                onChange={(e) => setChatName(e.target.value)}
                                placeholder="Enter a name for this chat"
                                required
                                disabled={!!selectedChatId}
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                className="block text-sm font-medium mb-1"
                                htmlFor="chatFile"
                            >
                                Chat File
                            </label>
                            <div className="flex items-center gap-2">
                                <label className="flex-1">
                                    <div className="w-full p-2 border rounded-md bg-background flex items-center cursor-pointer">
                                        <span className="flex-1 truncate">
                                            {fileName || "Choose a file..."}
                                        </span>
                                        <span className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm">
                                            Browse
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        id="chatFile"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".txt"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {selectedChatId
                                    ? "Upload a new file to update this chat"
                                    : "Upload a WhatsApp chat export (.txt file)"}
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            disabled={uploadChatMutation.isPending}
                        >
                            {uploadChatMutation.isPending ? (
                                <span className="flex items-center justify-center">
                                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                                    Uploading...
                                </span>
                            ) : selectedChatId ? (
                                "Update Chat"
                            ) : (
                                "Upload Chat"
                            )}
                        </button>

                        {uploadChatMutation.isError && (
                            <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded-md text-sm">
                                Error:{" "}
                                {(uploadChatMutation.error as Error).message}
                            </div>
                        )}

                        {uploadChatMutation.isSuccess && (
                            <div className="mt-2 p-2 bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 rounded-md text-sm">
                                Chat uploaded successfully!
                            </div>
                        )}
                    </form>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    onClick={handleSubmit}
                    disabled={
                        !fileInputRef.current?.files?.length ||
                        uploadChatMutation.isPending
                    }
                    className="w-full"
                >
                    {uploadChatMutation.isPending ? (
                        <span className="flex items-center justify-center">
                            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                            Uploading...
                        </span>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            {selectedChatId
                                ? "Update and Analyze"
                                : "Upload and Analyze"}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
