import React from 'react';
import { Grid, List } from 'lucide-react';
import type { ViewMode } from '@/types/types';

interface ViewToggleProps {
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => (
    <div className="flex items-center space-x-2">
        <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg transition-colors duration-200 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
        >
            <Grid className="w-5 h-5" />
        </button>
        <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-lg transition-colors duration-200 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'
                }`}
        >
            <List className="w-5 h-5" />
        </button>
    </div>
);
