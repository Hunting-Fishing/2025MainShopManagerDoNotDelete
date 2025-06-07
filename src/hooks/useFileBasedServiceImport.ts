
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { mapExcelToServiceHierarchy } from '@/lib/services/excelProcessor';
import type { ImportProgress, MappedServiceData } from '@/types/service';

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

  const importSelectedFiles = async (files: File[]) => {
    setIsImporting(true);
    setImportProgress({
      stage: 'starting',
      message: 'Starting file import...',
      progress: 0,
      completed: false,
      error: null
    });

    try {
      console.log(`Starting import of ${files.length} files`);
      
      // Process each file
      const processedData: MappedServiceData[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progressPercent = (i / files.length) * 80; // 80% for processing, 20% for database
        
        setImportProgress({
          stage: 'processing',
          message: `Processing file ${i + 1} of ${files.length}: ${file.name}`,
          progress: progressPercent,
          completed: false,
          error: null
        });

        try {
          // Read Excel file
          const arrayBuffer = await file.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          
          // Get first worksheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header row
          const rawData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '', // Default value for empty cells
            raw: false // Get formatted text values
          });

          console.log(`File ${file.name}: ${rawData.length} rows found`);
          
          // Convert array of arrays to array of objects
          if (rawData.length < 2) {
            console.warn(`Skipping ${file.name}: insufficient data`);
            continue;
          }

          const headers = rawData[0] as string[];
          const dataRows = rawData.slice(1).map((row: any[]) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              if (header) {
                obj[header] = row[index] || '';
              }
            });
            return obj;
          });

          // Add the header row back as the first element for mapExcelToServiceHierarchy
          const processedFileData = [
            headers.reduce((obj: any, header, index) => {
              obj[index] = header;
              return obj;
            }, {}),
            ...dataRows
          ];

          console.log(`Processing ${file.name} with ${processedFileData.length} rows`);
          
          // Map to service hierarchy
          const mappedData = mapExcelToServiceHierarchy(file.name, processedFileData);
          processedData.push(mappedData);
          
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError);
          setImportProgress({
            stage: 'error',
            message: `Error processing file ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`,
            progress: 0,
            completed: false,
            error: `Error processing file ${file.name}`
          });
          return;
        }
      }

      // Import to database
      setImportProgress({
        stage: 'importing',
        message: 'Importing processed data to database...',
        progress: 80,
        completed: false,
        error: null
      });

      await importToDatabase(processedData);
      
      setImportProgress({
        stage: 'complete',
        message: `Successfully imported ${processedData.length} files with ${processedData.reduce((total, data) => 
          total + data.categories.reduce((catTotal, cat) => 
            catTotal + cat.subcategories.reduce((subTotal, sub) => 
              subTotal + sub.services.length, 0), 0), 0)} services`,
        progress: 100,
        completed: true,
        error: null
      });

      // Refresh data
      setTimeout(async () => {
        await refetch();
      }, 1000);

      toast({
        title: "Import Completed",
        description: `Successfully imported ${processedData.length} files`,
        variant: "default",
      });

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

  const importToDatabase = async (processedData: MappedServiceData[]) => {
    console.log('Starting database import...');
    
    // Clear existing data first
    await clearExistingData();
    
    for (const sectorData of processedData) {
      console.log(`Importing sector: ${sectorData.sectorName}`);
      
      // Create sector
      const { data: sector, error: sectorError } = await supabase
        .from('service_sectors')
        .insert({
          name: sectorData.sectorName,
          description: `Imported from Excel files`,
          is_active: true
        })
        .select()
        .single();

      if (sectorError || !sector) {
        throw new Error(`Failed to create sector: ${sectorError?.message}`);
      }

      // Import categories
      for (const categoryData of sectorData.categories) {
        console.log(`Importing category: ${categoryData.name}`);
        
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: categoryData.name,
            description: `Category from ${sectorData.sectorName}`,
            sector_id: sector.id
          })
          .select()
          .single();

        if (categoryError || !category) {
          throw new Error(`Failed to create category: ${categoryError?.message}`);
        }

        // Import subcategories and services
        for (const subcategoryData of categoryData.subcategories) {
          console.log(`Importing subcategory: ${subcategoryData.name} with ${subcategoryData.services.length} services`);
          
          const { data: subcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .insert({
              name: subcategoryData.name,
              description: `Subcategory from ${categoryData.name}`,
              category_id: category.id
            })
            .select()
            .single();

          if (subcategoryError || !subcategory) {
            throw new Error(`Failed to create subcategory: ${subcategoryError?.message}`);
          }

          // Import services in batches
          const batchSize = 100;
          for (let i = 0; i < subcategoryData.services.length; i += batchSize) {
            const batch = subcategoryData.services.slice(i, i + batchSize);
            const servicesToInsert = batch.map(service => ({
              name: service.name,
              description: service.description,
              estimated_time: service.estimatedTime,
              price: service.price,
              subcategory_id: subcategory.id
            }));

            const { error: servicesError } = await supabase
              .from('service_jobs')
              .insert(servicesToInsert);

            if (servicesError) {
              throw new Error(`Failed to create services: ${servicesError.message}`);
            }
          }
        }
      }
    }
    
    console.log('Database import completed successfully');
  };

  const clearExistingData = async () => {
    console.log('Clearing existing service data...');
    
    // Delete in proper order to respect foreign keys
    await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
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
