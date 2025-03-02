import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageCircle, Shield, Upload, Search } from "lucide-react";
import { ChatUploader } from "@/components/ChatUploader";
import { SecurityDashboard } from "@/components/SecurityDashboard";

import { ContextAwareSearch } from "@/components/ContextAwareSearch";
import { ChatSelector } from "@/components/ChatSelector";
import "./App.css";
import { ModeToggle } from "./components/mode-toggle";
import { ChatInterface } from "./components/ChatInterface";

export default function App() {
    const [activeTab, setActiveTab] = useState("upload");
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [newChatName, setNewChatName] = useState<string>("");

    const handleChatSelected = (chatId: string) => {
        setSelectedChatId(chatId);
    };

    const handleCreateNewChat = (chatName: string) => {
        setNewChatName(chatName);
        setSelectedChatId(null);
    };

    return (
        <ThemeProvider defaultTheme="dark" storageKey="chatlore-theme">
            <div className="min-h-screen bg-background">
                <header className="border-b">
                    <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <Shield className="h-6 w-6 text-primary" />
                            <h1 className="text-xl font-bold">ChatLore</h1>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Beta
                            </span>
                        </div>
                        <div className="ml-auto flex items-center gap-4">
                            <ModeToggle />
                        </div>
                    </div>
                </header>

                <main className="container py-6 px-4 sm:px-6 lg:px-8">
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle className="text-3xl">ChatLore</CardTitle>
                            <p className="text-muted-foreground">
                                Privacy-first conversation intelligence for
                                WhatsApp chats and ZK-secured messaging - unlock
                                insights without compromising your digital
                                sovereignty
                            </p>
                        </CardHeader>
                    </Card>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="flex flex-wrap w-full overflow-x-auto">
                            <TabsTrigger
                                value="upload"
                                className="flex items-center gap-1 flex-1"
                            >
                                <Upload className="h-4 w-4" />
                                <span className="text-xs sm:text-sm">
                                    Upload
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="chat"
                                className="flex items-center gap-1 flex-1"
                            >
                                <Bot className="h-4 w-4" />
                                <span className="text-xs sm:text-sm">Chat</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="flex items-center gap-1 flex-1"
                            >
                                <Shield className="h-4 w-4" />
                                <span className="text-xs sm:text-sm">
                                    Security
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="search"
                                className="flex items-center gap-1 flex-1"
                            >
                                <Search className="h-4 w-4" />
                                <span className="text-xs sm:text-sm">
                                    Search
                                </span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="threads"
                                className="flex items-center gap-1 flex-1"
                                disabled
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span className="text-xs sm:text-sm">
                                    Threads
                                </span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <ChatSelector
                                        selectedChatId={selectedChatId}
                                        onChatSelected={handleChatSelected}
                                        onCreateNewChat={handleCreateNewChat}
                                    />
                                </div>
                                <div>
                                    <ChatUploader
                                        initialChatName={newChatName}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="security">
                            <SecurityDashboard />
                        </TabsContent>

                        <TabsContent value="threads">
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">
                                    Threads Feature Disabled
                                </h3>
                                <p className="text-muted-foreground max-w-md">
                                    The conversation threads feature is
                                    currently disabled. Please check back later
                                    when this feature becomes available.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="search">
                            <ContextAwareSearch />
                        </TabsContent>

                        <TabsContent value="chat" className="p-4">
                            <div className="flex flex-col items-center justify-center p-8 text-center">
                                {/* <Bot className="h-12 w-12 text-muted-foreground mb-4" /> */}
                                <ChatInterface />
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>

                <footer className="border-t py-6 md:py-0">
                    <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 sm:px-6 lg:px-8">
                        <p className="text-sm text-muted-foreground">
                            &copy; {new Date().getFullYear()} ChatLore. All
                            rights reserved.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Privacy-first conversation intelligence for WhatsApp
                        </p>
                    </div>
                </footer>
            </div>
        </ThemeProvider>
    );
}
