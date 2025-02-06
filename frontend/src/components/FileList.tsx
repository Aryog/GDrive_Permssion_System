import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Folder, FileText, Image, ChevronRight } from 'lucide-react';

interface File {
    id: string;
    name: string;
    type: 'file';
    path: string;
    fileUrl?: string;
    mimeType?: string;
}

interface Folder {
    id: string;
    name: string;
    type: 'folder';
    path: string;
}

interface FileListResponse {
    folders: Folder[];
    files: File[];
}

const FileList = () => {
    const [items, setItems] = React.useState<FileListResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
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

                // Update current path based on folderId
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
        // Navigate to the folder using its ID
        navigate(`/folder/${folder.id}`);
    };

    const handleFileClick = (file: File) => {
        if (file.fileUrl) {
            window.open(file.fileUrl, '_blank');
        }
    };

    const navigateToBreadcrumb = (index: number) => {
        if (index === -1) {
            // Navigate to root
            navigate('/folder/root');
        } else {
            // Navigate to specific folder in breadcrumb
            const path = currentPath.slice(0, index + 1).join('/');
            navigate(`/folder/${path}`);
        }
    };

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
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 mb-6 text-sm">
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

            {/* Grid Layout */}
            <div className="space-y-6">
                {/* Folders Section */}
                {items.folders.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-gray-700">Folders</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.folders.map(folder => (
                                <button
                                    key={folder.id}
                                    onClick={() => handleFolderClick(folder)}
                                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <Folder className="w-5 h-5 text-gray-400 mr-3" />
                                    <span className="text-gray-700 truncate">{folder.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Files Section */}
                {items.files.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-gray-700">Files</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.files.map(file => (
                                <button
                                    key={file.id}
                                    onClick={() => handleFileClick(file)}
                                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    {file.mimeType?.startsWith('image/') ? (
                                        <Image className="w-5 h-5 text-gray-400 mr-3" />
                                    ) : (
                                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                    )}
                                    <span className="text-gray-700 truncate">{file.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
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