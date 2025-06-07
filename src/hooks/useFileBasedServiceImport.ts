
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { ImportProgress } from '@/types/service';

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

  const importSelectedFiles = async (files: File[]) => {
    if (!files || files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select Excel files to import",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress({
      stage: 'starting',
      message: 'Starting file-based import...',
      progress: 0,
      completed: false,
      error: null
    });

    try {
      // Clear existing data first
      setImportProgress({
        stage: 'clearing',
        message: 'Clearing existing service data...',
        progress: 10,
        completed: false,
        error: null
      });

      // Clear all service data
      await supabase.from('service_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('service_subcategories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('service_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('service_sectors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      let totalSectors = 0;
      let totalCategories = 0;
      let totalSubcategories = 0;
      let totalServices = 0;

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name.replace('.xlsx', '').replace('.xls', '');
        
        setImportProgress({
          stage: 'processing',
          message: `Processing file ${i + 1}/${files.length}: ${fileName}...`,
          progress: 20 + (i / files.length) * 60,
          completed: false,
          error: null
        });

        // Read the Excel file
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });

        // Create or get sector (use a default sector name for file-based import)
        const sectorName = 'Automotive'; // Default sector for file-based imports
        const { data: existingSector } = await supabase
          .from('service_sectors')
          .select('id')
          .eq('name', sectorName)
          .single();

        let sectorId = existingSector?.id;
        if (!sectorId) {
          const { data: newSector, error: sectorError } = await supabase
            .from('service_sectors')
            .insert({
              name: sectorName,
              description: 'Automotive services sector'
            })
            .select('id')
            .single();

          if (sectorError) throw sectorError;
          sectorId = newSector.id;
          totalSectors++;
        }

        // Create category (use filename as category name)
        const { data: newCategory, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: fileName,
            description: `Services from ${fileName}`,
            sector_id: sectorId
          })
          .select('id')
          .single();

        if (categoryError) throw categoryError;
        const categoryId = newCategory.id;
        totalCategories++;

        // Process each sheet in the workbook
        for (const sheetName of workbook.SheetNames) {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length < 2) continue; // Skip empty sheets

          // Group services by subcategory (first column)
          const subcategoryGroups: { [key: string]: any[] } = {};
          
          for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
            const row = jsonData[rowIndex] as any[];
            if (!row || row.length < 2) continue;

            const subcategoryName = String(row[0] || '').trim();
            const serviceName = String(row[1] || '').trim();
            
            if (!subcategoryName || !serviceName) continue;

            if (!subcategoryGroups[subcategoryName]) {
              subcategoryGroups[subcategoryName] = [];
            }

            subcategoryGroups[subcategoryName].push({
              name: serviceName,
              description: String(row[2] || '').trim(),
              estimatedTime: parseInt(String(row[3] || '0')) || 0,
              price: parseFloat(String(row[4] || '0')) || 0
            });
          }

          // Create subcategories and services
          for (const [subcategoryName, services] of Object.entries(subcategoryGroups)) {
            // Create subcategory
            const { data: newSubcategory, error: subcategoryError } = await supabase
              .from('service_subcategories')
              .insert({
                name: subcategoryName,
                description: `${subcategoryName} services`,
                category_id: categoryId
              })
              .select('id')
              .single();

            if (subcategoryError) throw subcategoryError;
            const subcategoryId = newSubcategory.id;
            totalSubcategories++;

            // Create services
            for (const service of services) {
              const { error: serviceError } = await supabase
                .from('service_jobs')
                .insert({
                  name: service.name,
                  description: service.description,
                  estimated_time: service.estimatedTime,
                  price: service.price,
                  subcategory_id: subcategoryId
                });

              if (serviceError) throw serviceError;
              totalServices++;
            }
          }
        }
      }

      setImportProgress({
        stage: 'complete',
        message: `Successfully imported ${totalServices} services across ${totalSubcategories} subcategories, ${totalCategories} categories, and ${totalSectors} sectors`,
        progress: 100,
        completed: true,
        error: null
      });

      toast({
        title: "Import Completed Successfully",
        description: `Imported ${totalServices} services from ${files.length} files`,
        variant: "default",
      });

    } catch (error: any) {
      console.error('File import failed:', error);
      const errorMessage = error.message || 'Import failed';
      
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
