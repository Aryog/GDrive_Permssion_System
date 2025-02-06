import { useState } from "react";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";

interface FileUploadProps {
    onUploadComplete: (file: {
        id: string;
        name: string;
        type: string;
        size: string;
        path: string;
        blobName: string;
    }) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);

            // Get upload URL from backend
            const urlResponse = await fetch(`${backendUrl}/api/files/upload-url`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type,
                }),
            });

            if (!urlResponse.ok) {
                throw new Error(`Failed to get upload URL: ${urlResponse.statusText}`);
            }

            const { url, blobName, fileId } = await urlResponse.json();
            console.log("Upload details:", { url, blobName, fileId });

            // Upload file to Azure Blob Storage
            const uploadResponse = await fetch(url, {
                method: "PUT",
                headers: {
                    "x-ms-blob-type": "BlockBlob",
                    "Content-Type": file.type,
                },
                body: file,
            });

            if (!uploadResponse.ok) {
                throw new Error(`Failed to upload to Azure: ${uploadResponse.statusText}`);
            }

            // Create file record in database
            const fileResponse = await fetch(`${backendUrl}/api/files`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: fileId,
                    name: file.name,
                    type: "file",
                    mimeType: file.type,
                    size: file.size.toString(),
                    path: `/${file.name}`,
                    blobName: blobName,
                }),
            });

            if (!fileResponse.ok) {
                throw new Error(`Failed to create file record: ${fileResponse.statusText}`);
            }

            const newFile = await fileResponse.json();
            if (newFile.error) {
                throw new Error(newFile.error);
            }

            onUploadComplete(newFile);
        } catch (error) {
            console.error("Upload failed:", error);
            // You might want to add some UI feedback here
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <Button
                variant="outline"
                disabled={isUploading}
                onClick={() => document.getElementById("file-upload")?.click()}
            >
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload File"}
            </Button>
            <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
            />
        </div>
    );
} 