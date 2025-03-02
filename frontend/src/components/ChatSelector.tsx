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
            const storedChats = localStorage.getItem("chats");
            if (storedChats) {
                setChats(JSON.parse(storedChats));
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
            // Get current chats from localStorage
            const storedChats = localStorage.getItem("chats");
            if (storedChats) {
                const parsedChats = JSON.parse(storedChats);
                // Filter out the chat to delete
                const updatedChats = parsedChats.filter(
                    (chat: Chat) => chat.id !== chatId
                );
                // Save back to localStorage
                localStorage.setItem("chats", JSON.stringify(updatedChats));
                // Update state
                setChats(updatedChats);
            }

            // If the deleted chat was selected, deselect it
            if (selectedChatId === chatId) {
                onChatSelected("");
            }
        } catch (error) {
            console.error("Error deleting chat from localStorage:", error);
        }
    };

    const handleChatSelect = (chatId: string) => {
        onChatSelected(chatId);
    };

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
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>Your Chats</CardTitle>
                    <CardDescription>
                        Select a chat to view or upload
                    </CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="h-8 gap-1">
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
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : chats.length === 0 ? (
                    <Alert>
                        <AlertTitle>No chats found</AlertTitle>
                        <AlertDescription>
                            You haven't uploaded any chats yet. Create a new
                            chat to get started.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                                    selectedChatId === chat.id
                                        ? "bg-primary/10 border border-primary/20"
                                        : "hover:bg-muted"
                                }`}
                                onClick={() => handleChatSelect(chat.id)}
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium">
                                        {chat.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(
                                            chat.uploadDate
                                        ).toLocaleDateString()}{" "}
                                        • {chat.messageCount} messages
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteChat(chat.id);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
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
