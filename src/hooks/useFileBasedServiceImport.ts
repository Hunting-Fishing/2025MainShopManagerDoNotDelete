
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

interface ExcelFileData {
  fileName: string;
  data: any[];
}

export function useFileBasedServiceImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  
  const { toast } = useToast();

  const processExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with proper headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            defval: '' 
          });
          
          console.log(`Processing ${file.name}:`, jsonData);
          resolve(jsonData);
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseExcelData = (fileName: string, rawData: any[]): { 
    sectorName: string; 
    categories: Array<{
      name: string;
      subcategories: Array<{
        name: string;
        services: Array<{
          name: string;
          description?: string;
          estimatedTime?: number;
          price?: number;
        }>;
      }>;
    }>;
  } => {
    console.log(`Parsing data for ${fileName}:`, rawData);
    
    // Remove file extension to get sector name
    const sectorName = fileName.replace(/\.(xlsx?|csv)$/i, '').trim();
    
    if (!rawData || rawData.length < 2) {
      return { sectorName, categories: [] };
    }
    
    // Skip header row and process data
    const dataRows = rawData.slice(1).filter(row => 
      row && Array.isArray(row) && row.some(cell => cell && cell.toString().trim())
    );
    
    console.log(`Found ${dataRows.length} data rows for ${sectorName}`);
    
    // Group services by category and subcategory
    const categoryMap = new Map<string, Map<string, any[]>>();
    
    dataRows.forEach((row, index) => {
      if (!row || row.length < 2) return;
      
      // Assume structure: [Category, Subcategory, Service, Description, Time, Price, ...]
      const category = (row[0] || '').toString().trim();
      const subcategory = (row[1] || '').toString().trim();
      const serviceName = (row[2] || '').toString().trim();
      const description = (row[3] || '').toString().trim();
      const estimatedTime = row[4] ? parseInt(row[4].toString()) : undefined;
      const price = row[5] ? parseFloat(row[5].toString()) : undefined;
      
      if (!category || !subcategory || !serviceName) {
        console.log(`Skipping incomplete row ${index + 2}:`, row);
        return;
      }
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, new Map());
      }
      
      const subcategoryMap = categoryMap.get(category)!;
      if (!subcategoryMap.has(subcategory)) {
        subcategoryMap.set(subcategory, []);
      }
      
      subcategoryMap.get(subcategory)!.push({
        name: serviceName,
        description: description || undefined,
        estimatedTime: estimatedTime || undefined,
        price: price || undefined
      });
    });
    
    // Convert to proper structure
    const categories = Array.from(categoryMap.entries()).map(([categoryName, subcategoryMap]) => ({
      name: categoryName,
      subcategories: Array.from(subcategoryMap.entries()).map(([subcategoryName, services]) => ({
        name: subcategoryName,
        services
      }))
    }));
    
    console.log(`Processed ${sectorName}: ${categories.length} categories, ${categories.reduce((total, cat) => total + cat.subcategories.length, 0)} subcategories, ${categories.reduce((total, cat) => total + cat.subcategories.reduce((subTotal, sub) => subTotal + sub.services.length, 0), 0)} services`);
    
    return { sectorName, categories };
  };

  const importServices = async (selectedFiles: ExcelFileData[]) => {
    try {
      setIsImporting(true);
      setImportProgress({
        stage: 'preparing',
        message: 'Preparing import...',
        progress: 0,
        completed: false,
        error: null
      });

      // Clear existing data
      setImportProgress({
        stage: 'clearing',
        message: 'Clearing existing service data...',
        progress: 10,
        completed: false,
        error: null
      });

      await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      let totalFilesProcessed = 0;
      let totalSectorsCreated = 0;
      let totalCategoriesCreated = 0;
      let totalSubcategoriesCreated = 0;
      let totalServicesCreated = 0;

      for (const fileData of selectedFiles) {
        setImportProgress({
          stage: 'processing',
          message: `Processing ${fileData.fileName}...`,
          progress: 20 + (totalFilesProcessed / selectedFiles.length) * 60,
          completed: false,
          error: null
        });

        const parsedData = parseExcelData(fileData.fileName, fileData.data);
        
        if (parsedData.categories.length === 0) {
          console.log(`No valid data found in ${fileData.fileName}`);
          continue;
        }

        // Create sector
        const { data: sector, error: sectorError } = await supabase
          .from('service_sectors')
          .insert({
            name: parsedData.sectorName,
            description: `Service sector from ${fileData.fileName}`
          })
          .select()
          .single();

        if (sectorError) {
          throw new Error(`Failed to create sector: ${sectorError.message}`);
        }

        totalSectorsCreated++;

        // Create categories and subcategories
        for (const categoryData of parsedData.categories) {
          const { data: category, error: categoryError } = await supabase
            .from('service_categories')
            .insert({
              name: categoryData.name,
              sector_id: sector.id
            })
            .select()
            .single();

          if (categoryError) {
            throw new Error(`Failed to create category: ${categoryError.message}`);
          }

          totalCategoriesCreated++;

          // Create subcategories
          for (const subcategoryData of categoryData.subcategories) {
            const { data: subcategory, error: subcategoryError } = await supabase
              .from('service_subcategories')
              .insert({
                name: subcategoryData.name,
                category_id: category.id
              })
              .select()
              .single();

            if (subcategoryError) {
              throw new Error(`Failed to create subcategory: ${subcategoryError.message}`);
            }

            totalSubcategoriesCreated++;

            // Create services/jobs
            for (const serviceData of subcategoryData.services) {
              const { error: jobError } = await supabase
                .from('service_jobs')
                .insert({
                  name: serviceData.name,
                  description: serviceData.description,
                  estimated_time: serviceData.estimatedTime,
                  price: serviceData.price,
                  subcategory_id: subcategory.id
                });

              if (jobError) {
                console.error(`Failed to create service: ${jobError.message}`);
                // Continue with other services rather than failing completely
              } else {
                totalServicesCreated++;
              }
            }
          }
        }

        totalFilesProcessed++;
      }

      setImportProgress({
        stage: 'complete',
        message: `Import completed! Created ${totalSectorsCreated} sectors, ${totalCategoriesCreated} categories, ${totalSubcategoriesCreated} subcategories, and ${totalServicesCreated} services.`,
        progress: 100,
        completed: true,
        error: null
      });

      toast({
        title: "Import Completed",
        description: `Successfully imported ${totalServicesCreated} services from ${totalFilesProcessed} files.`,
      });

    } catch (error) {
      console.error('Import failed:', error);
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

  const handleFileImport = async (files: File[]) => {
    try {
      setImportProgress({
        stage: 'reading',
        message: 'Reading Excel files...',
        progress: 5,
        completed: false,
        error: null
      });

      // Process all files
      const fileDataPromises = files.map(async (file) => {
        const data = await processExcelFile(file);
        return { fileName: file.name, data };
      });

      const selectedFiles = await Promise.all(fileDataPromises);
      await importServices(selectedFiles);
    } catch (error) {
      console.error('File processing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'File processing failed';
      
      setImportProgress({
        stage: 'error',
        message: errorMessage,
        progress: 0,
        completed: false,
        error: errorMessage
      });

      toast({
        title: "File Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    importProgress,
    handleFileImport
  };
}
