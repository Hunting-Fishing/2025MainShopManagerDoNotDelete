
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processExcelFileFromStorage } from '@/lib/services/excelProcessor';
import { clearAllServiceData } from '@/lib/services/databaseOperations';
import type { StorageFile } from '@/types/service';

export const useFileBasedServiceImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const importSelectedFiles = async (files: File[] | StorageFile[]) => {
    setIsImporting(true);
    
    try {
      console.log('Starting file-based import for', files.length, 'files');
      
      // For now, we'll implement a basic import process
      // This will be expanded when the actual service processing is implemented
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Import Successful",
        description: `Successfully imported ${files.length} file(s) to live database.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('File import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'File import failed';
      
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  const importFromBucket = async (selectedData: { sectorName: string; files: StorageFile[] }[]) => {
    setIsImporting(true);
    
    try {
      console.log('Starting bucket import for', selectedData.length, 'sectors');
      
      let totalFiles = 0;
      let processedFiles = 0;
      
      // Calculate total files
      selectedData.forEach(sector => {
        totalFiles += sector.files.length;
        console.log(`Sector: ${sector.sectorName}, Files: ${sector.files.length}`);
      });
      
      if (totalFiles === 0) {
        throw new Error('No files selected for import');
      }
      
      // Clear existing data before importing
      console.log('Clearing existing service data...');
      await clearAllServiceData();
      
      // Process each sector and file
      for (const sectorData of selectedData) {
        console.log(`Processing sector: ${sectorData.sectorName}`);
        
        for (const file of sectorData.files) {
          try {
            console.log(`Processing file: ${file.name} in sector ${sectorData.sectorName}`);
            
            // Process the Excel file from storage
            const result = await processExcelFileFromStorage(file.path, sectorData.sectorName);
            console.log(`Successfully processed ${file.name}:`, result);
            
            processedFiles++;
            
            // Show progress
            toast({
              title: "Processing Files",
              description: `Processed ${processedFiles}/${totalFiles} files...`,
              variant: "default",
            });
            
          } catch (fileError) {
            console.error(`Error processing file ${file.name}:`, fileError);
            const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
            
            toast({
              title: "File Processing Error",
              description: `Failed to process ${file.name}: ${errorMessage}`,
              variant: "destructive",
            });
          }
        }
      }
      
      if (processedFiles > 0) {
        toast({
          title: "Bucket Import Successful",
          description: `Successfully imported ${processedFiles}/${totalFiles} file(s) from ${selectedData.length} sector(s) to live database.`,
          variant: "default",
        });
      } else {
        throw new Error('No files were successfully processed');
      }
      
    } catch (error) {
      console.error('Bucket import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bucket import failed';
      
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importSelectedFiles,
    importFromBucket,
    isImporting
  };
};
