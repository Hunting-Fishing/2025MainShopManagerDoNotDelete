
import { useState, useCallback } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { parseExcelFile } from '@/lib/services/excelParser';

export interface ImportPreviewData {
  categories: ServiceMainCategory[];
  duplicateCategories: string[];
  duplicateSubcategories: string[];
  duplicateJobs: string[];
  totalNewItems: {
    categories: number;
    subcategories: number;
    jobs: number;
  };
}

export interface ImportBatch {
  id: string;
  name: string;
  categories: ServiceMainCategory[];
  status: 'pending' | 'importing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

export interface DuplicateResolution {
  type: 'category' | 'subcategory' | 'job';
  id: string;
  name: string;
  action: 'skip' | 'replace' | 'rename';
  newName?: string;
}

export function useServiceStagedImport(existingCategories: ServiceMainCategory[]) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null);
  const [duplicateResolutions, setDuplicateResolutions] = useState<DuplicateResolution[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'resolve' | 'batch' | 'import' | 'complete'>('upload');

  const detectDuplicates = useCallback((newCategories: ServiceMainCategory[]) => {
    const duplicateCategories: string[] = [];
    const duplicateSubcategories: string[] = [];
    const duplicateJobs: string[] = [];

    const existingCategoryNames = new Set(existingCategories.map(c => c.name.toLowerCase()));
    const existingSubcategoryNames = new Set(
      existingCategories.flatMap(c => c.subcategories.map(s => s.name.toLowerCase()))
    );
    const existingJobNames = new Set(
      existingCategories.flatMap(c => 
        c.subcategories.flatMap(s => s.jobs.map(j => j.name.toLowerCase()))
      )
    );

    newCategories.forEach(category => {
      if (existingCategoryNames.has(category.name.toLowerCase())) {
        duplicateCategories.push(category.name);
      }

      category.subcategories.forEach(subcategory => {
        if (existingSubcategoryNames.has(subcategory.name.toLowerCase())) {
          duplicateSubcategories.push(subcategory.name);
        }

        subcategory.jobs.forEach(job => {
          if (existingJobNames.has(job.name.toLowerCase())) {
            duplicateJobs.push(job.name);
          }
        });
      });
    });

    return { duplicateCategories, duplicateSubcategories, duplicateJobs };
  }, [existingCategories]);

  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      console.log('Processing Excel file for staged import...');
      const parsedCategories = await parseExcelFile(file);
      
      const duplicates = detectDuplicates(parsedCategories);
      
      const totalNewItems = {
        categories: parsedCategories.length - duplicates.duplicateCategories.length,
        subcategories: parsedCategories.reduce((total, cat) => 
          total + cat.subcategories.filter(sub => 
            !duplicates.duplicateSubcategories.includes(sub.name)
          ).length, 0
        ),
        jobs: parsedCategories.reduce((total, cat) => 
          total + cat.subcategories.reduce((subTotal, sub) => 
            subTotal + sub.jobs.filter(job => 
              !duplicates.duplicateJobs.includes(job.name)
            ).length, 0
          ), 0
        )
      };

      const preview: ImportPreviewData = {
        categories: parsedCategories,
        ...duplicates,
        totalNewItems
      };

      setPreviewData(preview);
      setCurrentStep('preview');
      
      console.log('Preview data generated:', preview);
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [detectDuplicates]);

  const createBatches = useCallback((batchSize: number = 5) => {
    if (!previewData) return;

    const batches: ImportBatch[] = [];
    const categories = previewData.categories;
    
    for (let i = 0; i < categories.length; i += batchSize) {
      const batchCategories = categories.slice(i, i + batchSize);
      batches.push({
        id: crypto.randomUUID(),
        name: `Batch ${Math.floor(i / batchSize) + 1}`,
        categories: batchCategories,
        status: 'pending',
        progress: 0
      });
    }

    setImportBatches(batches);
    setCurrentStep('batch');
  }, [previewData]);

  const importBatch = useCallback(async (batchId: string, onProgress?: (progress: number) => void) => {
    const batch = importBatches.find(b => b.id === batchId);
    if (!batch) return;

    try {
      setImportBatches(prev => prev.map(b => 
        b.id === batchId ? { ...b, status: 'importing', progress: 0 } : b
      ));

      // Simulate batch import with progress updates
      for (let i = 0; i < batch.categories.length; i++) {
        // Here you would actually import each category
        await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call
        
        const progress = Math.round(((i + 1) / batch.categories.length) * 100);
        
        setImportBatches(prev => prev.map(b => 
          b.id === batchId ? { ...b, progress } : b
        ));
        
        onProgress?.(progress);
      }

      setImportBatches(prev => prev.map(b => 
        b.id === batchId ? { ...b, status: 'completed', progress: 100 } : b
      ));

    } catch (error) {
      console.error('Error importing batch:', error);
      setImportBatches(prev => prev.map(b => 
        b.id === batchId ? { 
          ...b, 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        } : b
      ));
    }
  }, [importBatches]);

  const reset = useCallback(() => {
    setPreviewData(null);
    setDuplicateResolutions([]);
    setImportBatches([]);
    setCurrentStep('upload');
  }, []);

  return {
    isLoading,
    previewData,
    duplicateResolutions,
    setDuplicateResolutions,
    importBatches,
    currentStep,
    setCurrentStep,
    processFile,
    createBatches,
    importBatch,
    reset
  };
}
