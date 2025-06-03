
import { useState } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export interface PreviewData {
  categories: ServiceMainCategory[];
  newCategories: ServiceMainCategory[];
  duplicates: Array<{
    existing: ServiceMainCategory;
    imported: ServiceMainCategory;
    conflicts: string[];
  }>;
  errors: Array<{
    row: number;
    message: string;
    data: any;
  }>;
  stats: {
    totalCategories: number;
    totalSubcategories: number;
    totalJobs: number;
    newItems: number;
    duplicateItems: number;
    errorItems: number;
  };
}

export interface StagedImportState {
  step: 'upload' | 'preview' | 'resolve' | 'processing' | 'complete';
  file: File | null;
  previewData: PreviewData | null;
  selectedDuplicateActions: Record<string, 'skip' | 'replace' | 'rename'>;
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

export function useServiceStagedImport(
  existingCategories: ServiceMainCategory[],
  onImportComplete: (data: any) => Promise<void>
) {
  const [state, setState] = useState<StagedImportState>({
    step: 'upload',
    file: null,
    previewData: null,
    selectedDuplicateActions: {},
    isProcessing: false,
    progress: 0,
    error: null
  });

  const handleFileUpload = async (file: File) => {
    setState(prev => ({ ...prev, file, step: 'preview', error: null }));
    
    try {
      // Mock preview data for now - in real implementation, parse the Excel file
      const mockPreviewData: PreviewData = {
        categories: existingCategories,
        newCategories: [],
        duplicates: [],
        errors: [],
        stats: {
          totalCategories: existingCategories.length,
          totalSubcategories: existingCategories.reduce((sum, cat) => sum + cat.subcategories.length, 0),
          totalJobs: existingCategories.reduce((sum, cat) => 
            sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0),
          newItems: 0,
          duplicateItems: 0,
          errorItems: 0
        }
      };

      setState(prev => ({ 
        ...prev, 
        previewData: mockPreviewData,
        step: 'preview' 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to parse file. Please check the format.',
        step: 'upload' 
      }));
    }
  };

  const handleDuplicateAction = (categoryId: string, action: 'skip' | 'replace' | 'rename') => {
    setState(prev => ({
      ...prev,
      selectedDuplicateActions: {
        ...prev.selectedDuplicateActions,
        [categoryId]: action
      }
    }));
  };

  const startImport = async () => {
    if (!state.previewData) return;

    setState(prev => ({ ...prev, isProcessing: true, step: 'processing', progress: 0 }));

    try {
      // Simulate batch processing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setState(prev => ({ ...prev, progress: i }));
      }

      await onImportComplete(state.previewData.categories);
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        step: 'complete',
        progress: 100 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: 'Import failed. Please try again.',
        step: 'preview' 
      }));
    }
  };

  const reset = () => {
    setState({
      step: 'upload',
      file: null,
      previewData: null,
      selectedDuplicateActions: {},
      isProcessing: false,
      progress: 0,
      error: null
    });
  };

  return {
    state,
    handleFileUpload,
    handleDuplicateAction,
    startImport,
    reset
  };
}
