import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";
import { v4 as uuidv4 } from 'uuid';

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "files";

if (!accountName || !accountKey) {
    throw new Error("Azure Storage credentials not configured");
}

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCredential
);

export async function generateUploadUrl(userId: string, fileName: string, contentType: string, virtualPath: string = ''): Promise<{ url: string; blobName: string }> {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create a blob path that mirrors the virtual directory structure
    // Format: userId/virtualPath/timestamp-uuid-filename
    const timestamp = Date.now();
    const uniqueId = uuidv4();
    const sanitizedPath = virtualPath.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
    const blobPath = sanitizedPath
        ? `${userId}/${sanitizedPath}/${timestamp}-${uniqueId}-${fileName}`
        : `${userId}/${timestamp}-${uniqueId}-${fileName}`;

    const blobClient = containerClient.getBlobClient(blobPath);

    const startsOn = new Date();
    const expiresOn = new Date(startsOn);
    expiresOn.setMinutes(startsOn.getMinutes() + 10); // URL expires in 10 minutes

    const permissions = new BlobSASPermissions();
    permissions.write = true;
    permissions.create = true;

    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName: blobPath,
        permissions,
        startsOn,
        expiresOn,
        contentType,
    }, sharedKeyCredential).toString();

    return {
        url: `${blobClient.url}?${sasToken}`,
        blobName: blobPath,
    };
}

export async function generateReadUrl(blobName: string): Promise<string> {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const startsOn = new Date();
    const expiresOn = new Date(startsOn);
    expiresOn.setHours(startsOn.getHours() + 1); // URL expires in 1 hour

    const permissions = new BlobSASPermissions();
    permissions.read = true;

    const sasToken = generateBlobSASQueryParameters({
        containerName,
        blobName,
        permissions,
        startsOn,
        expiresOn,
    }, sharedKeyCredential).toString();

    return `${blobClient.url}?${sasToken}`;
} 