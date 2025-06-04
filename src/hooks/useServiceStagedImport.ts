
import { useState, useCallback } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { parseExcelFile } from '@/lib/services/excelParser';
import { importServiceData } from '@/services/serviceHierarchyService';
import { ParsedServiceData } from '@/lib/services/excelParser';

export interface ImportPreviewData {
  parsedData: ParsedServiceData;
  stats: {
    totalCategories: number;
    totalSubcategories: number;
    totalJobs: number;
  };
  duplicates: string[];
  validationErrors: string[];
}

export const useServiceStagedImport = (existingCategories: ServiceMainCategory[]) => {
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generatePreview = useCallback(async (file: File) => {
    setError(null);
    setIsGeneratingPreview(true);
    
    try {
      console.log('🔄 Starting Excel parse for preview...');
      const parsedData = await parseExcelFile(file);
      
      console.log(`✅ Parsed ${parsedData.categories.length} categories with ${parsedData.totalJobs} total jobs`);
      
      // Check for duplicates against existing data
      const duplicates: string[] = [];
      parsedData.categories.forEach(category => {
        const existingCategory = existingCategories.find(c => 
          c.name.toLowerCase() === category.name.toLowerCase()
        );
        if (existingCategory) {
          duplicates.push(`Category: ${category.name}`);
        }
        
        category.subcategories?.forEach(subcategory => {
          const existingSubcategory = existingCategory?.subcategories?.find(s =>
            s.name.toLowerCase() === subcategory.name.toLowerCase()
          );
          if (existingSubcategory) {
            duplicates.push(`Subcategory: ${category.name} > ${subcategory.name}`);
          }
        });
      });
      
      const preview: ImportPreviewData = {
        parsedData,
        stats: {
          totalCategories: parsedData.categories.length,
          totalSubcategories: parsedData.totalSubcategories,
          totalJobs: parsedData.totalJobs
        },
        duplicates: duplicates.slice(0, 50), // Limit duplicates shown
        validationErrors: []
      };
      
      setPreviewData(preview);
      
    } catch (error) {
      console.error('❌ Preview generation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [existingCategories]);

  const executeImport = useCallback(async () => {
    if (!previewData) {
      setError('No preview data available for import');
      return;
    }
    
    setError(null);
    setIsImporting(true);
    setImportProgress(0);
    
    try {
      console.log('🔄 Starting service import...');
      const totalOperations = previewData.stats.totalCategories + 
                             previewData.stats.totalSubcategories + 
                             previewData.stats.totalJobs;
      let completedOperations = 0;
      
      const updateProgress = () => {
        completedOperations++;
        const progress = Math.round((completedOperations / totalOperations) * 100);
        setImportProgress(progress);
        console.log(`📊 Import progress: ${progress}%`);
      };
      
      await importServiceData(previewData.parsedData, updateProgress);
      
      console.log('✅ Import completed successfully');
      setImportProgress(100);
      
      // Reset state after successful import
      setTimeout(() => {
        setPreviewData(null);
        setImportProgress(0);
        setIsImporting(false);
      }, 2000); // Show success for 2 seconds
      
    } catch (error) {
      console.error('❌ Import failed:', error);
      setError(error instanceof Error ? error.message : 'Import failed');
      setIsImporting(false);
      setImportProgress(0);
    }
  }, [previewData]);

  const reset = useCallback(() => {
    setPreviewData(null);
    setImportProgress(0);
    setIsImporting(false);
    setIsGeneratingPreview(false);
    setError(null);
  }, []);

  return {
    previewData,
    importProgress,
    isImporting,
    isGeneratingPreview,
    error,
    generatePreview,
    executeImport,
    reset
  };
};
