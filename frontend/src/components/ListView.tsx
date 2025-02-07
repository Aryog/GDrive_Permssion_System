import React from 'react';
import { Folder, FileText, Image } from 'lucide-react';
import type { File, Folder as FolderType } from '@/types/types';
import { formatFileSize, formatTimestamp } from '../utils/formatters';

interface ListViewProps {
    title: string;
    items: (File | FolderType)[];
    onFolderClick: (folder: FolderType) => void;
    onFileClick: (file: File) => void;
}

export const ListView: React.FC<ListViewProps> = ({ title, items, onFolderClick, onFileClick }) => (
    <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
        <div className="flex flex-col space-y-2">
            {items.map(item => (
                <button
                    key={item.id}
                    onClick={() => item.type === 'folder' ? onFolderClick(item as FolderType) : onFileClick(item as File)}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 w-full"
                >
                    <div className="flex items-center min-w-0 flex-1">
                        {item.type === 'folder' ? (
                            <Folder className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        ) : (
                            (item as File).mimeType?.startsWith('image/') ? (
                                <Image className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                            ) : (
                                <FileText className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                            )
                        )}
                        <span className="text-gray-700 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                        {item.type === 'file' && (
                            <span className="text-sm text-gray-500 w-20 text-right">
                                {formatFileSize((item as File).size)}
                            </span>
                        )}
                        <span className="text-sm text-gray-500 w-24 text-right">
                            {item.type === 'file' && formatTimestamp(item.updatedAt)}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    </div>
);
