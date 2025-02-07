import React from 'react';
import { MoreHorizontal, Share2, Pencil, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileActionsProps {
    onShare?: () => void;
    onRename?: () => void;
    onDelete?: () => void;
}

export const FileActions: React.FC<FileActionsProps> = ({
    onShare,
    onRename,
    onDelete,
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="hover:bg-gray-100 p-1 rounded-full">
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {onShare && (
                    <DropdownMenuItem onClick={onShare}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </DropdownMenuItem>
                )}
                {onRename && (
                    <DropdownMenuItem onClick={onRename}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Rename  
                        {/* For Edit  */}
                    </DropdownMenuItem>
                )}
                {onDelete && (
                    <DropdownMenuItem 
                        onClick={onDelete}
                        className="text-red-600"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
