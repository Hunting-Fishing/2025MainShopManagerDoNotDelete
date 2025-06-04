
import { useState } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { parseExcelFile, ParsedExcelData } from '@/lib/services/excelParser';
import { importServiceData, checkForDuplicates } from '@/lib/services/serviceImporter';

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
  importResult?: {
    categoriesCreated: number;
    subcategoriesCreated: number;
    jobsCreated: number;
    errors: string[];
  };
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
      console.log('📤 Starting file upload:', file.name, file.size, 'bytes', file.type);
      setState(prev => ({ ...prev, error: null, step: 'preview', progress: 10 }));

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
        throw new Error('Please upload an Excel file (.xlsx or .xls)');
      }

      // Parse Excel file
      console.log('📋 Processing Excel file...');
      setState(prev => ({ ...prev, progress: 30 }));
      
      const parsedData = await parseExcelFile(file);
      console.log('📊 Parsed data result:', parsedData);
      
      setState(prev => ({ ...prev, progress: 60 }));
      
      // Validate parsed data
      if (!parsedData.categories || parsedData.categories.length === 0) {
        throw new Error('No service categories found in the Excel file. Please check the file format and column headers.');
      }
      
      // Check for duplicates
      console.log('🔍 Checking for duplicates...');
      const duplicates = await checkForDuplicates(parsedData.categories);
      setState(prev => ({ ...prev, progress: 80 }));
      
      const previewData: ImportPreviewData = {
        categories: parsedData.categories,
        duplicates,
        stats: parsedData.stats
      };

      console.log('✅ File processing complete:', previewData);
      setState(prev => ({ 
        ...prev, 
        previewData,
        step: duplicates.length > 0 ? 'resolve' : 'preview',
        progress: 100
      }));

    } catch (error) {
      console.error('❌ File upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage,
        step: 'upload',
        progress: 0
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
    if (!state.previewData) {
      setState(prev => ({ ...prev, error: 'No data to import' }));
      return;
    }

    try {
      console.log('🚀 Starting import process...');
      setState(prev => ({ ...prev, step: 'processing', progress: 0, error: null }));

      // Filter out categories based on duplicate resolution
      let categoriesToImport = state.previewData.categories;
      
      if (state.previewData.duplicates.length > 0) {
        categoriesToImport = state.previewData.categories.filter(category => {
          const duplicate = state.previewData?.duplicates.find(d => d.name === category.name);
          if (duplicate) {
            const action = state.selectedDuplicateActions[duplicate.id] || 'skip';
            return action !== 'skip';
          }
          return true;
        });
      }

      console.log('📊 Categories to import:', categoriesToImport.length);
      setState(prev => ({ ...prev, progress: 20 }));

      // Import the data
      console.log('💾 Importing to database...');
      const importResult = await importServiceData(categoriesToImport, true);
      
      setState(prev => ({ ...prev, progress: 80 }));

      if (!importResult.success && importResult.errors.length > 0) {
        throw new Error(`Import failed: ${importResult.errors.join(', ')}`);
      }

      // Call the completion handler
      await onImportComplete(state.previewData);
      setState(prev => ({ ...prev, progress: 90 }));
      
      console.log('✅ Import process complete');
      setState(prev => ({ 
        ...prev, 
        step: 'complete', 
        progress: 100,
        importResult
      }));

    } catch (error) {
      console.error('❌ Import error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Import failed',
        step: 'preview',
        progress: 0
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
