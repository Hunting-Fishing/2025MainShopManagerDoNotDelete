
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
  details?: {
    sectorsProcessed: number;
    categoriesProcessed: number;
    subcategoriesProcessed: number;
    jobsProcessed: number;
    totalSectors: number;
    totalCategories: number;
    totalSubcategories: number;
    totalJobs: number;
  };
}

interface ImportMode {
  value: 'skip' | 'update';
  label: string;
  description: string;
}

const importModes: ImportMode[] = [
  {
    value: 'skip',
    label: 'Skip Duplicates',
    description: 'Skip items that already exist in the database'
  },
  {
    value: 'update',
    label: 'Update Existing',
    description: 'Update existing items with new data from Excel'
  }
];

export function FreshServiceImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [importMode, setImportMode] = useState<'skip' | 'update'>('skip');
  const [progress, setProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  const { toast } = useToast();

  const updateProgress = useCallback((update: Partial<ImportProgress>) => {
    setProgress(prev => ({ ...prev, ...update }));
  }, []);

  const processExcelFile = useCallback(async (file: File) => {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          console.log('Available sheets:', workbook.SheetNames);
          
          const processedData: any = {};
          
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length > 0) {
              processedData[sheetName] = jsonData;
            }
          });
          
          resolve(processedData);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const importSectorWithMode = async (sectorName: string, sectorData: any) => {
    if (importMode === 'skip') {
      // Check if sector exists first
      const { data: existingSector } = await supabase
        .from('service_sectors')
        .select('id')
        .eq('name', sectorName)
        .single();

      if (existingSector) {
        console.log(`Skipping existing sector: ${sectorName}`);
        return existingSector;
      }
    }

    // Use UPSERT with the new unique constraint
    const { data: sector, error } = await supabase
      .from('service_sectors')
      .upsert({
        name: sectorName,
        description: `${sectorName} services`,
        position: 0
      }, {
        onConflict: 'name',
        ignoreDuplicates: importMode === 'skip'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to import sector ${sectorName}: ${error.message}`);
    }

    return sector;
  };

  const importCategoryWithMode = async (categoryName: string, sectorId: string) => {
    if (importMode === 'skip') {
      const { data: existingCategory } = await supabase
        .from('service_categories')
        .select('id')
        .eq('name', categoryName)
        .eq('sector_id', sectorId)
        .single();

      if (existingCategory) {
        console.log(`Skipping existing category: ${categoryName}`);
        return existingCategory;
      }
    }

    const { data: category, error } = await supabase
      .from('service_categories')
      .upsert({
        name: categoryName,
        sector_id: sectorId,
        description: `${categoryName} category`,
        position: 0
      }, {
        onConflict: 'name,sector_id',
        ignoreDuplicates: importMode === 'skip'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to import category ${categoryName}: ${error.message}`);
    }

    return category;
  };

  const importSubcategoryWithMode = async (subcategoryName: string, categoryId: string) => {
    if (importMode === 'skip') {
      const { data: existingSubcategory } = await supabase
        .from('service_subcategories')
        .select('id')
        .eq('name', subcategoryName)
        .eq('category_id', categoryId)
        .single();

      if (existingSubcategory) {
        console.log(`Skipping existing subcategory: ${subcategoryName}`);
        return existingSubcategory;
      }
    }

    const { data: subcategory, error } = await supabase
      .from('service_subcategories')
      .upsert({
        name: subcategoryName,
        category_id: categoryId,
        description: `${subcategoryName} services`
      }, {
        onConflict: 'name,category_id',
        ignoreDuplicates: importMode === 'skip'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to import subcategory ${subcategoryName}: ${error.message}`);
    }

    return subcategory;
  };

  const importJobWithMode = async (jobData: any, subcategoryId: string) => {
    if (importMode === 'skip') {
      const { data: existingJob } = await supabase
        .from('service_jobs')
        .select('id')
        .eq('name', jobData.name)
        .eq('subcategory_id', subcategoryId)
        .single();

      if (existingJob) {
        console.log(`Skipping existing job: ${jobData.name}`);
        return existingJob;
      }
    }

    const { data: job, error } = await supabase
      .from('service_jobs')
      .upsert({
        name: jobData.name,
        subcategory_id: subcategoryId,
        description: jobData.description || '',
        estimated_time: jobData.estimatedTime || null,
        price: jobData.price || null
      }, {
        onConflict: 'name,subcategory_id',
        ignoreDuplicates: importMode === 'skip'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to import job ${jobData.name}: ${error.message}`);
    }

    return job;
  };

  const processImport = useCallback(async (processedData: any) => {
    let totalSectors = 0;
    let totalCategories = 0;
    let totalSubcategories = 0;
    let totalJobs = 0;
    let sectorsProcessed = 0;
    let categoriesProcessed = 0;
    let subcategoriesProcessed = 0;
    let jobsProcessed = 0;

    // Count totals first
    Object.keys(processedData).forEach(sheetName => {
      totalSectors++;
      const sheetData = processedData[sheetName];
      if (sheetData.length > 0) {
        const headers = sheetData[0];
        const dataRows = sheetData.slice(1);
        
        const categorySet = new Set();
        const subcategorySet = new Set();
        
        dataRows.forEach((row: any[]) => {
          if (row.length >= 3 && row[1] && row[2]) {
            categorySet.add(row[1]);
            subcategorySet.add(`${row[1]}-${row[2]}`);
            totalJobs++;
          }
        });
        
        totalCategories += categorySet.size;
        totalSubcategories += subcategorySet.size;
      }
    });

    updateProgress({
      stage: 'starting',
      message: `Starting import of ${totalSectors} sectors, ${totalCategories} categories, ${totalSubcategories} subcategories, and ${totalJobs} jobs`,
      progress: 0,
      details: {
        sectorsProcessed: 0,
        categoriesProcessed: 0,
        subcategoriesProcessed: 0,
        jobsProcessed: 0,
        totalSectors,
        totalCategories,
        totalSubcategories,
        totalJobs
      }
    });

    for (const sheetName of Object.keys(processedData)) {
      try {
        updateProgress({
          stage: 'processing_sector',
          message: `Processing sector: ${sheetName}`,
          progress: (sectorsProcessed / totalSectors) * 100
        });

        const sector = await importSectorWithMode(sheetName, processedData[sheetName]);
        sectorsProcessed++;

        const sheetData = processedData[sheetName];
        if (sheetData.length === 0) continue;

        const headers = sheetData[0];
        const dataRows = sheetData.slice(1);

        const categoryMap = new Map();
        const subcategoryMap = new Map();

        // Process categories and subcategories
        for (const row of dataRows) {
          if (row.length >= 3 && row[1] && row[2]) {
            const categoryName = row[1].toString().trim();
            const subcategoryName = row[2].toString().trim();

            // Import category if not already processed
            if (!categoryMap.has(categoryName)) {
              updateProgress({
                stage: 'processing_category',
                message: `Processing category: ${categoryName}`,
                progress: (categoriesProcessed / totalCategories) * 100
              });

              const category = await importCategoryWithMode(categoryName, sector.id);
              categoryMap.set(categoryName, category);
              categoriesProcessed++;
            }

            // Import subcategory if not already processed
            const subcategoryKey = `${categoryName}-${subcategoryName}`;
            if (!subcategoryMap.has(subcategoryKey)) {
              updateProgress({
                stage: 'processing_subcategory',
                message: `Processing subcategory: ${subcategoryName}`,
                progress: (subcategoriesProcessed / totalSubcategories) * 100
              });

              const category = categoryMap.get(categoryName);
              const subcategory = await importSubcategoryWithMode(subcategoryName, category.id);
              subcategoryMap.set(subcategoryKey, subcategory);
              subcategoriesProcessed++;
            }
          }
        }

        // Process jobs
        for (const row of dataRows) {
          if (row.length >= 3 && row[0] && row[1] && row[2]) {
            updateProgress({
              stage: 'processing_job',
              message: `Processing job: ${row[0]}`,
              progress: (jobsProcessed / totalJobs) * 100
            });

            const categoryName = row[1].toString().trim();
            const subcategoryName = row[2].toString().trim();
            const subcategoryKey = `${categoryName}-${subcategoryName}`;
            const subcategory = subcategoryMap.get(subcategoryKey);

            if (subcategory) {
              const jobData = {
                name: row[0].toString().trim(),
                description: row[3] ? row[3].toString().trim() : '',
                estimatedTime: row[4] ? parseFloat(row[4]) : null,
                price: row[5] ? parseFloat(row[5]) : null
              };

              await importJobWithMode(jobData, subcategory.id);
              jobsProcessed++;
            }
          }
        }
      } catch (error) {
        console.error(`Error importing sector ${sheetName}:`, error);
        throw error;
      }
    }

    updateProgress({
      stage: 'complete',
      message: `Import completed successfully! Imported ${sectorsProcessed} sectors, ${categoriesProcessed} categories, ${subcategoriesProcessed} subcategories, and ${jobsProcessed} jobs.`,
      progress: 100,
      completed: true,
      details: {
        sectorsProcessed,
        categoriesProcessed,
        subcategoriesProcessed,
        jobsProcessed,
        totalSectors,
        totalCategories,
        totalSubcategories,
        totalJobs
      }
    });
  }, [importMode, updateProgress]);

  const handleFilesDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsImporting(true);
    
    try {
      updateProgress({
        stage: 'reading',
        message: 'Reading Excel file...',
        progress: 10,
        completed: false,
        error: null
      });

      const processedData = await processExcelFile(file);
      
      updateProgress({
        stage: 'validating',
        message: 'Validating data structure...',
        progress: 20,
        completed: false,
        error: null
      });

      await processImport(processedData);

      toast({
        title: "Import Successful",
        description: `Services imported successfully in ${importMode} mode`,
        variant: "default",
      });

    } catch (error: any) {
      console.error('Import failed:', error);
      updateProgress({
        stage: 'error',
        message: error.message || 'Import failed',
        progress: 0,
        completed: false,
        error: error.message || 'Unknown error occurred'
      });

      toast({
        title: "Import Failed",
        description: error.message || 'Failed to import services',
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  }, [processExcelFile, processImport, importMode, updateProgress, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFilesDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    disabled: isImporting
  });

  const getProgressIcon = () => {
    if (progress.error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (progress.completed) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-blue-500" />;
  };

  const getProgressVariant = () => {
    if (progress.error) return 'destructive' as const;
    if (progress.completed) return 'default' as const;
    return 'default' as const;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Fresh Service Import
          </CardTitle>
          <CardDescription>
            Import service hierarchy from Excel files with improved conflict handling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Import Mode Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Import Mode</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {importModes.map((mode) => (
                  <div key={mode.value} className="relative">
                    <input
                      type="radio"
                      id={mode.value}
                      name="importMode"
                      value={mode.value}
                      checked={importMode === mode.value}
                      onChange={(e) => setImportMode(e.target.value as 'skip' | 'update')}
                      className="sr-only"
                      disabled={isImporting}
                    />
                    <label
                      htmlFor={mode.value}
                      className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                        importMode === mode.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="font-medium">{mode.label}</div>
                      <div className="text-sm text-gray-600">{mode.description}</div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* File Drop Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : isImporting
                  ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <input {...getInputProps()} disabled={isImporting} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">
                {isDragActive ? 'Drop the Excel file here' : 'Drop Excel file or click to browse'}
              </p>
              <p className="text-sm text-gray-500">
                Supports .xlsx and .xls files with service hierarchy data
              </p>
            </div>

            {/* Progress Section */}
            {(isImporting || progress.completed || progress.error) && (
              <Alert variant={getProgressVariant()}>
                <div className="flex items-center gap-2">
                  {getProgressIcon()}
                  <AlertDescription className="flex-1">
                    <div className="font-medium">
                      {progress.stage.charAt(0).toUpperCase() + progress.stage.slice(1).replace('_', ' ')} - {progress.message}
                    </div>
                    {progress.details && (
                      <div className="text-xs mt-1 text-gray-600">
                        Sectors: {progress.details.sectorsProcessed}/{progress.details.totalSectors} | 
                        Categories: {progress.details.categoriesProcessed}/{progress.details.totalCategories} | 
                        Subcategories: {progress.details.subcategoriesProcessed}/{progress.details.totalSubcategories} | 
                        Jobs: {progress.details.jobsProcessed}/{progress.details.totalJobs}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {(isImporting || progress.completed) && (
              <div className="space-y-2">
                <Progress value={progress.progress} className="w-full" />
                <div className="text-xs text-gray-500 text-right">
                  {progress.progress.toFixed(1)}% complete
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
