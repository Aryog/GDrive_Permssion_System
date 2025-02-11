import { useState, useEffect } from 'react';
import type { ViewMode } from '@/types/types';

const VIEW_MODE_KEY = 'fileExplorer_viewMode';

export const useViewMode = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem(VIEW_MODE_KEY);
    return (savedMode as ViewMode) || 'grid';
  });

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  return [viewMode, setViewMode] as const;
};
