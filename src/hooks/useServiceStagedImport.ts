
import { useState } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export interface ImportPreviewData {
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

export interface DuplicateResolution {
  categoryId: string;
  action: 'skip' | 'replace' | 'rename';
  newName?: string;
}

export interface ImportBatch {
  id: string;
  name: string;
  categories: ServiceMainCategory[];
  processed: boolean;
  errors: any[];
}

export interface StagedImportState {
  step: 'upload' | 'preview' | 'resolve' | 'processing' | 'complete';
  file: File | null;
  previewData: ImportPreviewData | null;
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

  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'resolve' | 'processing' | 'complete'>('upload');
  const [duplicateResolutions, setDuplicateResolutions] = useState<DuplicateResolution[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);

  const handleFileUpload = async (file: File) => {
    setState(prev => ({ ...prev, file, step: 'preview', error: null }));
    
    try {
      // Mock preview data for now - in real implementation, parse the Excel file
      const mockPreviewData: ImportPreviewData = {
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

  const processFile = async (file: File): Promise<ImportPreviewData> => {
    // Mock implementation
    return {
      categories: existingCategories,
      newCategories: [],
      duplicates: [],
      errors: [],
      stats: {
        totalCategories: 0,
        totalSubcategories: 0,
        totalJobs: 0,
        newItems: 0,
        duplicateItems: 0,
        errorItems: 0
      }
    };
  };

  const createBatches = (data: ImportPreviewData): ImportBatch[] => {
    // Mock implementation - create batches from categories
    return data.newCategories.map((category, index) => ({
      id: `batch-${index}`,
      name: `Batch ${index + 1}: ${category.name}`,
      categories: [category],
      processed: false,
      errors: []
    }));
  };

  const importBatch = async (batch: ImportBatch): Promise<void> => {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
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
    setCurrentStep('upload');
    setDuplicateResolutions([]);
    setImportBatches([]);
  };

  return {
    state,
    isLoading: state.isProcessing,
    previewData: state.previewData,
    duplicateResolutions,
    setDuplicateResolutions,
    importBatches,
    currentStep,
    setCurrentStep,
    processFile,
    createBatches,
    importBatch,
    handleFileUpload,
    handleDuplicateAction,
    startImport,
    reset
  };
}
