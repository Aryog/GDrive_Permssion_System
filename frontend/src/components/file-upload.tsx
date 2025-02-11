import { useState } from "react";
import { Button } from "./ui/button";
import { Upload, Folder } from "lucide-react";

declare module "react" {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

interface FileUploadProps {
  onUploadComplete: (file: {
    id: string;
    name: string;
    type: string;
    size: string;
    path: string;
    blobName?: string;
  }) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      setIsUploading(true);

      // Handle folder structure
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = file.webkitRelativePath || file.name;
        const pathParts = relativePath.split("/");
        pathParts.pop(); // Remove filename
        const folderPath = pathParts.join("/");

        // Create folders if needed
        let currentPath = "";
        for (const folder of pathParts) {
          currentPath = currentPath ? `${currentPath}/${folder}` : folder;
          await createFolder(folder, currentPath);
        }

        // Upload file if it's not a directory
        if (file.size > 0) {
          await uploadFile(file, folderPath);
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const createFolder = async (name: string, path: string) => {
    const response = await fetch(`${backendUrl}/api/files`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        type: "folder",
        path: `/${path}`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.details?.includes("duplicate")) {
        // Folder already exists, that's fine
        return;
      }
      throw new Error(`Failed to create folder: ${response.statusText}`);
    }

    const folder = await response.json();
    onUploadComplete(folder);
  };

  const uploadFile = async (file: File, folderPath: string) => {
    // Get upload URL
    const urlResponse = await fetch(`${backendUrl}/api/files/upload-url`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        path: folderPath,
      }),
    });

    if (!urlResponse.ok) {
      throw new Error(`Failed to get upload URL: ${urlResponse.statusText}`);
    }

    const { url, blobName } = await urlResponse.json();

    // Upload to Azure
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

    // Create file record
    const fileResponse = await fetch(`${backendUrl}/api/files`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        type: "file",
        mimeType: file.type,
        size: file.size.toString(),
        path: folderPath ? `/${folderPath}/${file.name}` : `/${file.name}`,
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
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        disabled={isUploading}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Uploading..." : "Upload File"}
      </Button>
      <Button
        variant="outline"
        disabled={isUploading}
        onClick={() => document.getElementById("folder-upload")?.click()}
      >
        <Folder className="h-4 w-4 mr-2" />
        {isUploading ? "Uploading..." : "Upload Folder"}
      </Button>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
        multiple
      />
      <input
        id="folder-upload"
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
        webkitdirectory="true"
        directory="true"
        multiple
      />
    </div>
  );
}
