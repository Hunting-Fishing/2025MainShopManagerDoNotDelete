
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

interface FreshServiceImportProps {
  onImportComplete?: () => Promise<void>;
}

interface ImportProgress {
  stage: string;
  message: string;
  progress: number;
  completed: boolean;
  error: string | null;
}

export function FreshServiceImport({ onImportComplete }: FreshServiceImportProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [importing, setImporting] = useState(false);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setSelectedFiles(files);
    setProgress({
      stage: '',
      message: '',
      progress: 0,
      completed: false,
      error: null
    });
  };

  const processExcelFile = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Use filename (without extension) as category name
          const categoryName = file.name.replace(/\.[^/.]+$/, '');
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          if (!worksheet) {
            reject(new Error(`No worksheet found in ${file.name}`));
            return;
          }

          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
          const subcategories: string[] = [];
          const subcategoryJobs: { [key: string]: string[] } = {};
          
          // Read subcategory names from Row 1 (starting from column B)
          for (let col = range.s.c + 1; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            const cell = worksheet[cellAddress];
            
            if (cell && cell.v) {
              const subcategoryName = String(cell.v).trim();
              if (subcategoryName) {
                subcategories.push(subcategoryName);
                subcategoryJobs[subcategoryName] = [];
              }
            }
          }

          // Read jobs from Row 2 onwards for each subcategory column
          for (let row = 1; row <= range.e.r; row++) {
            for (let col = range.s.c + 1; col <= range.e.c; col++) {
              const subcategoryIndex = col - range.s.c - 1;
              if (subcategoryIndex < subcategories.length) {
                const subcategoryName = subcategories[subcategoryIndex];
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                const cell = worksheet[cellAddress];
                
                if (cell && cell.v) {
                  const jobName = String(cell.v).trim();
                  if (jobName && !subcategoryJobs[subcategoryName].includes(jobName)) {
                    subcategoryJobs[subcategoryName].push(jobName);
                  }
                }
              }
            }
          }

          resolve({
            categoryName,
            subcategories: subcategories.map(name => ({
              name,
              jobs: subcategoryJobs[name] || []
            }))
          });
        } catch (error) {
          reject(new Error(`Failed to process ${file.name}: ${error}`));
        }
      };
      
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsArrayBuffer(file);
    });
  };

  const importToDatabase = async (processedData: any[]) => {
    updateProgress({
      stage: 'database',
      message: 'Importing to database...',
      progress: 80
    });

    try {
      // First, create or get the sector (we'll use a default sector for now)
      const { data: existingSector, error: sectorError } = await supabase
        .from('service_sectors')
        .select('id')
        .eq('name', 'General Services')
        .single();

      let sectorId;
      if (existingSector) {
        sectorId = existingSector.id;
      } else {
        const { data: newSector, error: createSectorError } = await supabase
          .from('service_sectors')
          .insert({
            name: 'General Services',
            description: 'General service categories',
            position: 1,
            is_active: true
          })
          .select('id')
          .single();

        if (createSectorError) {
          throw new Error(`Failed to create sector: ${createSectorError.message}`);
        }
        sectorId = newSector.id;
      }

      // Process each file's data
      for (const fileData of processedData) {
        // Create or update category
        const { data: existingCategory, error: categorySelectError } = await supabase
          .from('service_categories')
          .select('id')
          .eq('name', fileData.categoryName)
          .eq('sector_id', sectorId)
          .single();

        let categoryId;
        if (existingCategory) {
          categoryId = existingCategory.id;
        } else {
          const { data: newCategory, error: createCategoryError } = await supabase
            .from('service_categories')
            .insert({
              name: fileData.categoryName,
              description: `${fileData.categoryName} services`,
              sector_id: sectorId,
              position: 1
            })
            .select('id')
            .single();

          if (createCategoryError) {
            throw new Error(`Failed to create category: ${createCategoryError.message}`);
          }
          categoryId = newCategory.id;
        }

        // Process subcategories and jobs
        for (const subcategoryData of fileData.subcategories) {
          // Create or update subcategory
          const { data: existingSubcategory, error: subcategorySelectError } = await supabase
            .from('service_subcategories')
            .select('id')
            .eq('name', subcategoryData.name)
            .eq('category_id', categoryId)
            .single();

          let subcategoryId;
          if (existingSubcategory) {
            subcategoryId = existingSubcategory.id;
          } else {
            const { data: newSubcategory, error: createSubcategoryError } = await supabase
              .from('service_subcategories')
              .insert({
                name: subcategoryData.name,
                description: `${subcategoryData.name} services`,
                category_id: categoryId
              })
              .select('id')
              .single();

            if (createSubcategoryError) {
              throw new Error(`Failed to create subcategory: ${createSubcategoryError.message}`);
            }
            subcategoryId = newSubcategory.id;
          }

          // Create jobs
          for (const jobName of subcategoryData.jobs) {
            // Check if job already exists
            const { data: existingJob } = await supabase
              .from('service_jobs')
              .select('id')
              .eq('name', jobName)
              .eq('subcategory_id', subcategoryId)
              .single();

            if (!existingJob) {
              const { error: createJobError } = await supabase
                .from('service_jobs')
                .insert({
                  name: jobName,
                  description: `${jobName} service`,
                  subcategory_id: subcategoryId,
                  estimated_time: 60, // Default 1 hour
                  price: 100 // Default price
                });

              if (createJobError) {
                console.warn(`Failed to create job ${jobName}:`, createJobError.message);
              }
            }
          }
        }
      }

      updateProgress({
        stage: 'complete',
        message: 'Import completed successfully!',
        progress: 100,
        completed: true
      });

      toast({
        title: "Import Successful",
        description: `Successfully imported ${processedData.length} categories`,
      });

      // Trigger refresh if callback provided
      if (onImportComplete) {
        await onImportComplete();
      }

    } catch (error) {
      console.error('Database import error:', error);
      updateProgress({
        stage: 'error',
        message: `Database error: ${error}`,
        progress: 0,
        error: String(error),
        completed: false
      });

      toast({
        title: "Import Failed",
        description: `Database error: ${error}`,
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select Excel files to import",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    
    try {
      updateProgress({
        stage: 'processing',
        message: 'Processing Excel files...',
        progress: 10
      });

      const processedData = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        updateProgress({
          stage: 'processing',
          message: `Processing ${file.name}...`,
          progress: 20 + (i * 40 / selectedFiles.length)
        });

        const data = await processExcelFile(file);
        processedData.push(data);
      }

      await importToDatabase(processedData);

    } catch (error) {
      console.error('Import error:', error);
      updateProgress({
        stage: 'error',
        message: `Import failed: ${error}`,
        progress: 0,
        error: String(error),
        completed: false
      });

      toast({
        title: "Import Failed",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedFiles(null);
    setProgress({
      stage: '',
      message: '',
      progress: 0,
      completed: false,
      error: null
    });
    // Reset file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Fresh Service Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <FileSpreadsheet className="h-4 w-4" />
          <AlertDescription>
            <strong>Excel Format Requirements:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              <li>File name = Category name (e.g., "Automotive.xlsx")</li>
              <li>Row 1 = Subcategory names across columns</li>
              <li>Row 2+ = Jobs listed vertically under each subcategory</li>
              <li>Empty cells will be skipped automatically</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="file-input">Select Excel Files</Label>
            <Input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              multiple
              onChange={handleFileSelect}
              disabled={importing}
              className="mt-1"
            />
          </div>

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({selectedFiles.length}):</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {Array.from(selectedFiles).map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    <span>{file.name}</span>
                    <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {progress.stage && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {progress.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : progress.error ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                )}
                <span className="text-sm font-medium">{progress.message}</span>
              </div>
              <Progress value={progress.progress} className="w-full" />
              {progress.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{progress.error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={!selectedFiles || selectedFiles.length === 0 || importing}
              className="flex-1"
            >
              {importing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Files
                </>
              )}
            </Button>
            
            {(selectedFiles || progress.stage) && (
              <Button variant="outline" onClick={resetImport} disabled={importing}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
