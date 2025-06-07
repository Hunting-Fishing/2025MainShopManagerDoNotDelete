
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { mapExcelToServiceHierarchy } from '@/lib/services/excelProcessor';
import type { ImportProgress, ServiceSector } from '@/types/service';

export function useFileBasedServiceImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  
  const { refetch } = useServiceSectors();
  const { toast } = useToast();

  const processExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  };

  const uploadFileToStorage = async (file: File, sectorName: string): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${sectorName}/${fileName}`;
    
    console.log(`Uploading file to storage: ${filePath}`);
    
    const { error } = await supabase.storage
      .from('service-data')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return fileName;
  };

  const saveServiceHierarchy = async (mappedData: any, sectorName: string): Promise<void> => {
    console.log(`Saving service hierarchy for sector: ${sectorName}`, mappedData);

    // Create or get sector
    const { data: existingSector } = await supabase
      .from('service_sectors')
      .select('id')
      .eq('name', sectorName)
      .single();

    let sectorId: string;
    if (existingSector) {
      sectorId = existingSector.id;
    } else {
      const { data: newSector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({ name: sectorName, description: `Services for ${sectorName}` })
        .select('id')
        .single();

      if (sectorError) throw sectorError;
      sectorId = newSector.id;
    }

    // Process categories
    for (const category of mappedData.categories) {
      console.log(`Processing category: ${category.name}`);
      
      const { data: existingCategory } = await supabase
        .from('service_categories')
        .select('id')
        .eq('name', category.name)
        .eq('sector_id', sectorId)
        .single();

      let categoryId: string;
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const { data: newCategory, error: categoryError } = await supabase
          .from('service_categories')
          .insert({ 
            name: category.name, 
            description: `Category for ${category.name}`,
            sector_id: sectorId 
          })
          .select('id')
          .single();

        if (categoryError) throw categoryError;
        categoryId = newCategory.id;
      }

      // Process subcategories
      for (const subcategory of category.subcategories) {
        console.log(`Processing subcategory: ${subcategory.name} with ${subcategory.services.length} services`);
        
        const { data: existingSubcategory } = await supabase
          .from('service_subcategories')
          .select('id')
          .eq('name', subcategory.name)
          .eq('category_id', categoryId)
          .single();

        let subcategoryId: string;
        if (existingSubcategory) {
          subcategoryId = existingSubcategory.id;
          // Clear existing services for this subcategory
          await supabase
            .from('service_jobs')
            .delete()
            .eq('subcategory_id', subcategoryId);
        } else {
          const { data: newSubcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({ 
              name: subcategory.name, 
              description: `Subcategory for ${subcategory.name}`,
              category_id: categoryId 
            })
            .select('id')
            .single();

          if (subcategoryError) throw subcategoryError;
          subcategoryId = newSubcategory.id;
        }

        // Process services/jobs
        if (subcategory.services && subcategory.services.length > 0) {
          const jobsToInsert = subcategory.services.map(service => ({
            name: service.name,
            description: service.description || service.name,
            estimated_time: service.estimatedTime || 60,
            price: service.price || 0,
            subcategory_id: subcategoryId
          }));

          const { error: jobsError } = await supabase
            .from('service_jobs')
            .insert(jobsToInsert);

          if (jobsError) {
            console.error('Error inserting jobs:', jobsError);
            throw jobsError;
          }

          console.log(`Inserted ${jobsToInsert.length} jobs for subcategory: ${subcategory.name}`);
        }
      }
    }
  };

  const importSelectedFiles = async (files: File[]): Promise<void> => {
    if (!files || files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select Excel files to import.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress({
      stage: 'starting',
      message: 'Starting file-based service import...',
      progress: 0,
      completed: false,
      error: null
    });

    try {
      // Ensure storage bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'service-data');
      
      if (!bucketExists) {
        setImportProgress({
          stage: 'creating-bucket',
          message: 'Creating storage bucket...',
          progress: 5,
          completed: false,
          error: null
        });

        const { error: bucketError } = await supabase.storage.createBucket('service-data', {
          public: false,
          allowedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
        });

        if (bucketError && !bucketError.message.includes('already exists')) {
          throw new Error(`Failed to create storage bucket: ${bucketError.message}`);
        }
      }

      let processedFiles = 0;
      const totalFiles = files.length;

      for (const file of files) {
        processedFiles++;
        const fileName = file.name.replace(/\.xlsx?$/i, '');
        const sectorName = 'automotive'; // Default sector for file-based imports
        
        setImportProgress({
          stage: 'processing',
          message: `Processing file ${processedFiles}/${totalFiles}: ${file.name}...`,
          progress: (processedFiles / totalFiles) * 80,
          completed: false,
          error: null
        });

        try {
          // Process Excel file
          console.log(`Processing Excel file: ${file.name}`);
          const excelData = await processExcelFile(file);
          
          // Map Excel data to service hierarchy
          const mappedData = mapExcelToServiceHierarchy(fileName, excelData);
          console.log(`Mapped data for ${fileName}:`, mappedData);

          // Upload file to storage
          await uploadFileToStorage(file, sectorName);
          
          // Save to database
          await saveServiceHierarchy(mappedData, sectorName);

          console.log(`Successfully processed file: ${file.name}`);
          
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          throw new Error(`Failed to process ${file.name}: ${fileError.message}`);
        }
      }

      setImportProgress({
        stage: 'complete',
        message: `Successfully imported ${totalFiles} file(s)!`,
        progress: 100,
        completed: true,
        error: null
      });

      toast({
        title: "Import Completed",
        description: `Successfully imported ${totalFiles} Excel file(s) with service data.`,
        variant: "default",
      });

      // Refresh data
      setTimeout(async () => {
        await refetch();
      }, 1000);

    } catch (error) {
      console.error('File import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      
      setImportProgress({
        stage: 'error',
        message: errorMessage,
        progress: 0,
        completed: false,
        error: errorMessage
      });

      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setIsImporting(false);
    setImportProgress({
      stage: 'cancelled',
      message: 'Import cancelled by user',
      progress: 0,
      completed: false,
      error: null
    });
    
    toast({
      title: "Import Cancelled",
      description: "File import was cancelled",
      variant: "destructive",
    });
  };

  return {
    isImporting,
    importProgress,
    importSelectedFiles,
    handleCancel
  };
}
