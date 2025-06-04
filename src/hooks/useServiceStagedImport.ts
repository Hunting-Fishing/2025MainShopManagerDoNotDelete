
import { useState } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export interface ImportPreviewData {
  categories: ServiceMainCategory[];
  duplicates: any[];
  stats: {
    totalCategories: number;
    totalSubcategories: number;
    totalJobs: number;
  };
}

export interface StagedImportState {
  step: 'upload' | 'preview' | 'resolve' | 'processing' | 'complete';
  previewData: ImportPreviewData | null;
  selectedDuplicateActions: Record<string, string>;
  progress: number;
  error: string | null;
}

export const useServiceStagedImport = (
  existingCategories: ServiceMainCategory[],
  onImportComplete: (data: any) => Promise<void>
) => {
  const [state, setState] = useState<StagedImportState>({
    step: 'upload',
    previewData: null,
    selectedDuplicateActions: {},
    progress: 0,
    error: null
  });

  const handleFileUpload = async (file: File) => {
    try {
      console.log('📤 Starting file upload:', file.name, file.size, 'bytes');
      setState(prev => ({ ...prev, error: null, step: 'preview' }));

      // Mock file processing for now - in real implementation this would parse Excel
      console.log('📋 Processing Excel file...');
      
      // Simulate file parsing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock preview data
      const mockPreviewData: ImportPreviewData = {
        categories: [],
        duplicates: [],
        stats: {
          totalCategories: 0,
          totalSubcategories: 0,
          totalJobs: 0
        }
      };

      console.log('✅ File processing complete:', mockPreviewData);
      setState(prev => ({ 
        ...prev, 
        previewData: mockPreviewData,
        step: 'preview'
      }));

    } catch (error) {
      console.error('❌ File upload error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Upload failed',
        step: 'upload'
      }));
    }
  };

  const handleDuplicateAction = (itemId: string, action: string) => {
    setState(prev => ({
      ...prev,
      selectedDuplicateActions: {
        ...prev.selectedDuplicateActions,
        [itemId]: action
      }
    }));
  };

  const startImport = async () => {
    try {
      console.log('🚀 Starting import process...');
      setState(prev => ({ ...prev, step: 'processing', progress: 0 }));

      // Simulate import progress
      for (let i = 0; i <= 100; i += 20) {
        setState(prev => ({ ...prev, progress: i }));
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Call the completion handler
      await onImportComplete(state.previewData);
      
      console.log('✅ Import process complete');
      setState(prev => ({ ...prev, step: 'complete', progress: 100 }));

    } catch (error) {
      console.error('❌ Import error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Import failed',
        step: 'preview'
      }));
    }
  };

  const reset = () => {
    console.log('🔄 Resetting import state');
    setState({
      step: 'upload',
      previewData: null,
      selectedDuplicateActions: {},
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
};
