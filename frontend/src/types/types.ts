export interface File {
	id: string;
	name: string;
	type: 'file';
	path: string;
	fileUrl?: string;
	mimeType?: string;
	size: string;
	createdAt: string;
	updatedAt: string;
}

export interface Folder {
	id: string;
	name: string;
	type: 'folder';
	path: string;
	createdAt: string;
	updatedAt: string;
}

export interface FileListResponse {
	folders: Folder[];
	files: File[];
}

export type ViewMode = 'grid' | 'list';
