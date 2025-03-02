import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Upload, X, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUploadChat } from "@/lib/queries";

interface ChatUploaderProps {
    initialChatName?: string;
}

export function ChatUploader({ initialChatName }: ChatUploaderProps) {
    const [chatName, setChatName] = useState(initialChatName || "");
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { mutate: uploadChat, isSuccess } = useUploadChat(chatName);

    const handleFileUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUploadAndAnalyze = async () => {
        if (!selectedFile) {
            setUploadError("Please select a file to upload");
            return;
        }

        if (!chatName.trim()) {
            setUploadError("Please enter a chat name");
            return;
        }

        try {
            const fileText = await selectedFile.text();
            uploadChat(fileText);
            setUploadError(null);
        } catch (error) {
            setUploadError("Error reading file. Please try again.");
            console.error("Error reading file:", error);
        }
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold">
                    Upload WhatsApp Chat
                </CardTitle>
                <CardDescription className="text-base mt-2">
                    Export your WhatsApp chat and upload the .txt file to
                    analyze
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="chatName" className="text-sm font-medium">
                        Chat Name
                    </Label>
                    <Input
                        id="chatName"
                        value={chatName}
                        onChange={(e) => setChatName(e.target.value)}
                        placeholder="Enter a name for this chat"
                        className="h-11"
                    />
                </div>

                {!selectedFile ? (
                    <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-4 hover:border-primary/50 transition-colors">
                        <div className="flex flex-col items-center gap-3">
                            <Upload className="h-10 w-10 text-muted-foreground" />
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">
                                    Drop your chat file here
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    or click to browse from your computer
                                </p>
                            </div>
                        </div>
                        <Input
                            type="file"
                            accept=".txt"
                            className="hidden"
                            id="file-upload"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() =>
                                document.getElementById("file-upload")?.click()
                            }
                        >
                            Select File
                        </Button>
                    </div>
                ) : (
                    <div className="border-2 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-primary" />
                                <div className="space-y-1">
                                    <h3 className="font-medium">
                                        {selectedFile.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {(selectedFile.size / 1024).toFixed(2)}{" "}
                                        KB
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveFile}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                )}

                <Button
                    className="w-full h-11 text-base font-medium"
                    size="lg"
                    onClick={handleUploadAndAnalyze}
                    disabled={!selectedFile}
                >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload and Analyze
                </Button>
                {isSuccess && (
                    <div className="text-green-500 text-sm">
                        Chat uploaded successfully
                    </div>
                )}

                <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-lg">
                        How to Export Your Chat
                    </h3>
                    <ol className="space-y-3">
                        <li className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                1
                            </span>
                            <p className="text-sm">
                                Open WhatsApp and go to the chat you want to
                                analyze
                            </p>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                2
                            </span>
                            <p className="text-sm">
                                Tap the three dots ⋮ and select "More" → "Export
                                chat"
                            </p>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium">
                                3
                            </span>
                            <p className="text-sm">
                                Choose "Without media" and save the .txt file
                            </p>
                        </li>
                    </ol>
                </div>

                {uploadError && (
                    <div className="text-red-500 text-sm">{uploadError}</div>
                )}
            </CardContent>
        </Card>
    );
}
