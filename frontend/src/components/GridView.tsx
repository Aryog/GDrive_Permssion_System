import React from 'react';
import { Folder, FileText, Image } from 'lucide-react';
import type { File, Folder as FolderType } from '@/types/types';
import { formatFileSize, formatTimestamp } from '../utils/formatters';
import { FileActions } from './FileActions';

interface GridViewProps {
    title: string;
    items: (File | FolderType)[];
    onFolderClick: (folder: FolderType) => void;
    onFileClick: (file: File) => void;
    onShare?: (item: File | FolderType) => void;
    onRename?: (item: File | FolderType) => void;
    onDelete?: (item: File | FolderType) => void;
}

export const GridView: React.FC<GridViewProps> = ({ title, items, onFolderClick, onFileClick, onShare, onRename, onDelete }) => (
    <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map(item => (
                <div
                    key={item.id}
                    className="group relative flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileActions
                            onShare={() => onShare?.(item)}
                            onRename={() => onRename?.(item)}
                            onDelete={() => onDelete?.(item)}
                        />
                    </div>
                    <button
                        onClick={() => item.type === 'folder' ? onFolderClick(item as FolderType) : onFileClick(item as File)}
                        className="flex flex-col items-center w-full"
                    >
                        {item.type === 'folder' ? (
                            <Folder className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                        ) : (
                            (item as File).mimeType?.startsWith('image/') ? (
                                <Image className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                            ) : (
                                <FileText className="w-12 h-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                            )
                        )}
                        <span className="mt-2 text-sm text-gray-700 text-center truncate w-full">
                            {item.name}
                        </span>
                        <div className="mt-1 flex flex-col items-center">
                            {item.type === 'file' && (
                                <span className="text-xs text-gray-500">
                                    {formatFileSize((item as File).size)}
                                </span>
                            )}
                            <span className="text-xs text-gray-500">
                                {item.type === 'file' && formatTimestamp(item.updatedAt)}
                            </span>
                        </div>
                    </button>
                </div>
            ))}
        </div>
    </div>
);
