import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChatSelectorProps {
    selectedChatId: string | null;
    onChatSelected: (chatId: string) => void;
    onCreateNewChat?: (chatName: string) => void;
}

interface Chat {
    id: string;
    name: string;
    uploadDate: string;
    messageCount: number;
}
export function ChatSelector({
    selectedChatId,
    onChatSelected,
    onCreateNewChat,
}: ChatSelectorProps) {
    const [newChatName, setNewChatName] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch chats from localStorage when component mounts
    useEffect(() => {
        fetchChatsFromLocalStorage();
    }, []);

    const fetchChatsFromLocalStorage = () => {
        setIsLoading(true);
        try {
            const chatNames = localStorage.getItem("chat_names");
            if (chatNames) {
                const parsedChatNames = JSON.parse(chatNames);
                const loadedChats: Chat[] = [];

                for (const chatName of parsedChatNames) {
                    const messages = JSON.parse(
                        localStorage.getItem(chatName) || "[]"
                    );
                    loadedChats.push({
                        id: chatName, // Using chatName as ID for simplicity
                        name: chatName,
                        uploadDate: new Date().toISOString(), // Default date since we don't store this
                        messageCount: messages.length,
                    });
                }

                setChats(loadedChats);
            } else {
                setChats([]);
            }
        } catch (error) {
            console.error("Error fetching chats from localStorage:", error);
            setChats([]);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteChat = (chatId: string) => {
        try {
            // Get current chat names from localStorage
            const chatNames = JSON.parse(
                localStorage.getItem("chat_names") || "[]"
            );
            // Filter out the chat to delete
            const updatedChatNames = chatNames.filter(
                (name: string) => name !== chatId
            );
            // Save back to localStorage
            localStorage.setItem(
                "chat_names",
                JSON.stringify(updatedChatNames)
            );
            // Remove the chat data
            localStorage.removeItem(chatId);
            // Update state
            fetchChatsFromLocalStorage();

            // If the deleted chat was selected, deselect it
            if (selectedChatId === chatId) {
                onChatSelected("");
            }
        } catch (error) {
            console.error("Error deleting chat from localStorage:", error);
        }
    };

    const handleChatSelect = (chatId: string) => {
        // Get the chat data from localStorage
        const messages = localStorage.getItem(chatId);
        if (!messages) return;

        // Store the selected chat ID
        localStorage.setItem("selectedChatId", chatId);
        onChatSelected(chatId);
    };

    // Load selected chat on mount
    useEffect(() => {
        const storedSelectedChatId = localStorage.getItem("selectedChatId");
        if (storedSelectedChatId) {
            onChatSelected(storedSelectedChatId);
        } else {
            // If no chat is selected but chats exist, select the first one
            const chatNames = JSON.parse(
                localStorage.getItem("chat_names") || "[]"
            );
            if (chatNames.length > 0) {
                onChatSelected(chatNames[0]);
            }
        }
    }, [onChatSelected]);
    const handleDeleteChat = (chatId: string) => {
        setChatToDelete(chatId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (chatToDelete) {
            deleteChat(chatToDelete);
            setIsDeleteDialogOpen(false);
            setChatToDelete(null);
        }
    };

    return (
        <Card className="h-full border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                <div>
                    <CardTitle className="text-2xl font-bold">
                        Your Chats
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                        Select a chat to view its contents
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            size="sm"
                            className="h-9 px-4 gap-2 bg-primary hover:bg-primary/90"
                        >
                            <Plus className="h-4 w-4" />
                            New Chat
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Chat</DialogTitle>
                            <DialogDescription>
                                Enter a name for your new chat
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label
                                    htmlFor="name"
                                    className="text-sm font-medium"
                                >
                                    Chat Name
                                </label>
                                <input
                                    id="name"
                                    value={newChatName}
                                    onChange={(e) =>
                                        setNewChatName(e.target.value)
                                    }
                                    className="w-full p-2 border rounded-md bg-background"
                                    placeholder="Enter chat name"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => {
                                    setIsDialogOpen(false);
                                    if (onCreateNewChat && newChatName.trim()) {
                                        onCreateNewChat(newChatName);
                                    }
                                    // The actual chat creation happens in the ChatUploader
                                }}
                                disabled={!newChatName.trim()}
                            >
                                Proceed to Upload
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="p-4">
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : chats.length === 0 ? (
                    <Alert className="bg-muted/50 border-2">
                        <AlertTitle className="text-lg font-semibold">
                            No chats found
                        </AlertTitle>
                        <AlertDescription className="text-muted-foreground mt-1">
                            Start by creating a new chat using the button above.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {chats.map((chat) => (
                            <button
                                key={chat.id}
                                className={`w-full text-left transition-all duration-200 ${
                                    selectedChatId === chat.id
                                        ? "bg-primary/10 border-2 border-primary shadow-sm"
                                        : "hover:bg-muted/50 border-2 border-transparent hover:border-muted"
                                } rounded-lg p-4 group relative`}
                                onClick={() => handleChatSelect(chat.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="font-semibold text-lg">
                                            {chat.name}
                                        </span>
                                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                                            {new Date(
                                                chat.uploadDate
                                            ).toLocaleDateString()}
                                            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground"></span>
                                            {chat.messageCount} messages
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {selectedChatId === chat.id && (
                                            <span className="text-primary text-sm font-medium">
                                                Selected
                                            </span>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteChat(chat.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the chat and all its data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
