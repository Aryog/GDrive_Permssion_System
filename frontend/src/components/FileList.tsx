import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Folder, FileText, Image, ChevronRight, Grid, List } from 'lucide-react';

interface File {
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

interface Folder {
    id: string;
    name: string;
    type: 'folder';
    path: string;
    createdAt: string;
    updatedAt: string;
}

interface FileListResponse {
    folders: Folder[];
    files: File[];
}

const formatTimestamp = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'just now';
        }

        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        }

        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        }

        if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (error) {
        return 'Invalid date';
    }
};

const formatFileSize = (sizeInBytes: string): string => {
    const size = parseInt(sizeInBytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const FileList = () => {
    const [items, setItems] = React.useState<FileListResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
    const navigate = useNavigate();
    const { folderId = 'root' } = useParams();
    const [currentPath, setCurrentPath] = React.useState<string[]>([]);

    React.useEffect(() => {
        const fetchFiles = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/files/folder/${folderId}`);
                if (!response.ok) throw new Error('Failed to fetch files');
                const data = await response.json();
                setItems(data);

                if (folderId !== 'root') {
                    const pathSegments = folderId.split('/');
                    setCurrentPath(pathSegments);
                } else {
                    setCurrentPath([]);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error fetching files');
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [folderId]);

    const handleFolderClick = (folder: Folder) => {
        navigate(`/folder/${folder.id}`);
    };

    const handleFileClick = (file: File) => {
        if (file.fileUrl) {
            window.open(file.fileUrl, '_blank');
        }
    };

    const navigateToBreadcrumb = (index: number) => {
        if (index === -1) {
            navigate('/folder/root');
        } else {
            const path = currentPath.slice(0, index + 1).join('/');
            navigate(`/folder/${path}`);
        }
    };

    const renderGridView = (title: string, items: Folder[] | File[]) => (
        <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => item.type === 'folder' ? handleFolderClick(item as Folder) : handleFileClick(item as File)}
                        className="group flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
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
                                {formatTimestamp(item.updatedAt)}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderListView = (title: string, items: Folder[] | File[]) => (
        <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
            <div className="flex flex-col space-y-2">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => item.type === 'folder' ? handleFolderClick(item as Folder) : handleFileClick(item as File)}
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
                                {formatTimestamp(item.updatedAt)}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-red-500 bg-red-50 rounded-lg">
                <p className="font-medium">Error: {error}</p>
            </div>
        );
    }

    if (!items) {
        return (
            <div className="p-4 text-gray-500 text-center">
                <p>No items found</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm">
                    <button
                        onClick={() => navigateToBreadcrumb(-1)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                        My Drive
                    </button>
                    {currentPath.map((segment, index) => (
                        <React.Fragment key={index}>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <button
                                onClick={() => navigateToBreadcrumb(index)}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                                {segment}
                            </button>
                        </React.Fragment>
                    ))}
                </nav>

                {/* View Toggle */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors duration-200 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <Grid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors duration-200 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {items.folders.length > 0 && (
                    viewMode === 'grid'
                        ? renderGridView('Folders', items.folders)
                        : renderListView('Folders', items.folders)
                )}

                {items.files.length > 0 && (
                    viewMode === 'grid'
                        ? renderGridView('Files', items.files)
                        : renderListView('Files', items.files)
                )}

                {items.files.length === 0 && items.folders.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">This folder is empty</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileList;