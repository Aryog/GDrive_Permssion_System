import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { FileListResponse, File, Folder } from '@/types/types';
import { useViewMode } from '@/hooks/useViewModel';
import { GridView } from './GridView';
import { ListView } from './ListView';
import { Breadcrumb } from './BreadCrumb';
import { ViewToggle } from './ViewToggle';

const FileList: React.FC = () => {
    const [items, setItems] = React.useState<FileListResponse | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [viewMode, setViewMode] = useViewMode();
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
                <Breadcrumb
                    currentPath={currentPath}
                    onNavigate={navigateToBreadcrumb}
                />
                <ViewToggle
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            </div>

            <div className="space-y-6">
                {items.folders.length > 0 && (
                    viewMode === 'grid' ? (
                        <GridView
                            title="Folders"
                            items={items.folders}
                            onFolderClick={handleFolderClick}
                            onFileClick={handleFileClick}
                        />
                    ) : (
                        <ListView
                            title="Folders"
                            items={items.folders}
                            onFolderClick={handleFolderClick}
                            onFileClick={handleFileClick}
                        />
                    )
                )}

                {items.files.length > 0 && (
                    viewMode === 'grid' ? (
                        <GridView
                            title="Files"
                            items={items.files}
                            onFolderClick={handleFolderClick}
                            onFileClick={handleFileClick}
                        />
                    ) : (
                        <ListView
                            title="Files"
                            items={items.files}
                            onFolderClick={handleFolderClick}
                            onFileClick={handleFileClick}
                        />
                    )
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
