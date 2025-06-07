
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

interface ImportStats {
  totalCategories: number;
  totalSubcategories: number;
  totalJobs: number;
  filesProcessed: number;
}

export function FreshServiceImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    stage: 'Ready',
    message: 'Ready to import Excel files',
    progress: 0,
    completed: false,
    error: null
  });
  const [importStats, setImportStats] = useState<ImportStats | null>(null);

  const updateProgress = useCallback((update: Partial<ImportProgress>) => {
    setProgress(prev => ({ ...prev, ...update }));
  }, []);

  const processExcelFile = useCallback(async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Get the filename without extension as category name
          const categoryName = file.name.replace(/\.[^/.]+$/, "");
          console.log('Processing category:', categoryName);
          
          const allData: any[] = [];
          
          // Process each sheet in the workbook
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            
            if (jsonData.length < 2) {
              console.log(`Sheet ${sheetName} has insufficient data, skipping`);
              return;
            }
            
            // Row 1 contains subcategory headers
            const subcategoryHeaders = jsonData[0] as string[];
            console.log('Subcategory headers:', subcategoryHeaders);
            
            // Process each column (subcategory)
            subcategoryHeaders.forEach((subcategoryName, colIndex) => {
              if (!subcategoryName || subcategoryName.trim() === '') return;
              
              const trimmedSubcategoryName = subcategoryName.trim();
              
              // Extract jobs from this column (starting from row 2)
              const jobs: string[] = [];
              for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
                const row = jsonData[rowIndex] as string[];
                const jobName = row[colIndex];
                
                if (jobName && jobName.trim() !== '') {
                  jobs.push(jobName.trim());
                }
              }
              
              if (jobs.length > 0) {
                allData.push({
                  categoryName: categoryName.trim(),
                  subcategoryName: trimmedSubcategoryName,
                  jobs: jobs
                });
                console.log(`Added ${jobs.length} jobs for ${trimmedSubcategoryName}`);
              }
            });
          });
          
          resolve(allData);
        } catch (error) {
          console.error('Error processing Excel file:', error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  }, []);

  const insertDataToDatabase = useCallback(async (processedData: any[]): Promise<ImportStats> => {
    const stats: ImportStats = {
      totalCategories: 0,
      totalSubcategories: 0,
      totalJobs: 0,
      filesProcessed: 1
    };

    // Group data by category
    const categoriesMap = new Map<string, Map<string, string[]>>();
    
    processedData.forEach(item => {
      if (!categoriesMap.has(item.categoryName)) {
        categoriesMap.set(item.categoryName, new Map());
      }
      categoriesMap.get(item.categoryName)!.set(item.subcategoryName, item.jobs);
    });

    updateProgress({
      stage: 'Database Import',
      message: `Importing ${categoriesMap.size} categories to database...`,
      progress: 20
    });

    for (const [categoryName, subcategories] of categoriesMap) {
      try {
        // Create sector (we'll use "Automotive" as default sector)
        const { data: sector, error: sectorError } = await supabase
          .from('service_sectors')
          .upsert({
            name: 'Automotive',
            description: 'Automotive services',
            position: 1
          }, {
            onConflict: 'name'
          })
          .select()
          .single();

        if (sectorError) throw sectorError;

        // Create category
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .upsert({
            sector_id: sector.id,
            name: categoryName,
            description: `${categoryName} services`
          }, {
            onConflict: 'name,sector_id'
          })
          .select()
          .single();

        if (categoryError) throw categoryError;
        stats.totalCategories++;

        // Create subcategories and jobs
        for (const [subcategoryName, jobs] of subcategories) {
          const { data: subcategory, error: subcategoryError } = await supabase
            .from('service_subcategories')
            .upsert({
              category_id: category.id,
              name: subcategoryName,
              description: `${subcategoryName} services`
            }, {
              onConflict: 'name,category_id'
            })
            .select()
            .single();

          if (subcategoryError) throw subcategoryError;
          stats.totalSubcategories++;

          // Insert jobs
          for (const jobName of jobs) {
            const { error: jobError } = await supabase
              .from('service_jobs')
              .upsert({
                subcategory_id: subcategory.id,
                name: jobName,
                description: `${jobName} service`
              }, {
                onConflict: 'name,subcategory_id'
              });

            if (jobError) throw jobError;
            stats.totalJobs++;
          }
        }

        updateProgress({
          progress: 20 + (stats.totalCategories / categoriesMap.size) * 60,
          message: `Processed category: ${categoryName}`
        });

      } catch (error) {
        console.error(`Error importing category ${categoryName}:`, error);
        throw error;
      }
    }

    return stats;
  }, [updateProgress]);

  const handleFileUpload = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsImporting(true);
    setImportStats(null);
    
    try {
      const file = acceptedFiles[0];
      
      updateProgress({
        stage: 'Processing',
        message: `Processing Excel file: ${file.name}`,
        progress: 10,
        completed: false,
        error: null
      });

      // Process the Excel file
      const processedData = await processExcelFile(file);
      
      if (processedData.length === 0) {
        throw new Error('No valid data found in Excel file');
      }

      // Import to database
      const stats = await insertDataToDatabase(processedData);
      
      updateProgress({
        stage: 'Complete',
        message: `Successfully imported ${stats.totalJobs} jobs across ${stats.totalSubcategories} subcategories in ${stats.totalCategories} categories`,
        progress: 100,
        completed: true,
        error: null
      });

      setImportStats(stats);

    } catch (error) {
      console.error('Import failed:', error);
      updateProgress({
        stage: 'Error',
        message: 'Import failed',
        progress: 0,
        completed: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsImporting(false);
    }
  }, [processExcelFile, insertDataToDatabase, updateProgress]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isImporting
  });

  const resetImport = useCallback(() => {
    setProgress({
      stage: 'Ready',
      message: 'Ready to import Excel files',
      progress: 0,
      completed: false,
      error: null
    });
    setImportStats(null);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Fresh Service Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Expected Excel Format:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>File/Sheet Name:</strong> Category name (e.g., "Engine Services")</li>
                <li><strong>Row 1:</strong> Subcategory names as column headers</li>
                <li><strong>Row 2+:</strong> Job names listed vertically under each subcategory</li>
                <li>Empty cells will be skipped automatically</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Upload Area */}
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
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the Excel file here...</p>
            ) : (
              <>
                <p className="text-gray-600 mb-2">
                  Drag & drop an Excel file here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports .xlsx and .xls files
                </p>
              </>
            )}
          </div>

          {/* Progress Display */}
          {(isImporting || progress.completed || progress.error) && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {progress.error ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : progress.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                <span className="font-medium">
                  {progress.stage}
                </span>
              </div>
              
              <p className="text-sm text-gray-600">{progress.message}</p>
              
              {(isImporting || progress.completed) && (
                <Progress value={progress.progress} className="w-full" />
              )}

              {progress.error && (
                <Alert variant="destructive">
                  <AlertDescription>{progress.error}</AlertDescription>
                </Alert>
              )}

              {importStats && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Import Summary:</strong>
                    <ul className="list-disc list-inside mt-1">
                      <li>{importStats.totalCategories} categories</li>
                      <li>{importStats.totalSubcategories} subcategories</li>
                      <li>{importStats.totalJobs} jobs</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {(progress.completed || progress.error) && (
                <Button onClick={resetImport} variant="outline">
                  Import Another File
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
