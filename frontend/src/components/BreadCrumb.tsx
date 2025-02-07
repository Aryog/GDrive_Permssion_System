import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbProps {
    currentPath: string[];
    onNavigate: (index: number) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPath, onNavigate }) => (
    <nav className="flex items-center space-x-2 text-sm">
        <button
            onClick={() => onNavigate(-1)}
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
            My Drive
        </button>
        {currentPath.map((segment, index) => (
            <React.Fragment key={index}>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button
                    onClick={() => onNavigate(index)}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                    {segment}
                </button>
            </React.Fragment>
        ))}
    </nav>
);