
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
  error: string | null;
  completed: boolean;
}

interface ImportStats {
  totalSectors: number;
  totalCategories: number;
  totalSubcategories: number;
  totalJobs: number;
  filesProcessed: number;
}

export function FreshServiceImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    stage: '',
    progress: 0,
    message: '',
    error: null,
    completed: false
  });
  const [stats, setStats] = useState<ImportStats | null>(null);
  const { toast } = useToast();

  const processExcelFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const sheetNames = workbook.SheetNames;
      if (sheetNames.length === 0) {
        throw new Error('No sheets found in Excel file');
      }

      // Use the first sheet
      const worksheet = workbook.Sheets[sheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('Excel file must have at least a header row and one data row');
      }

      return jsonData;
    } catch (error) {
      console.error('Error processing Excel file:', error);
      throw error;
    }
  };

  const importDataToDatabase = async (data: any[], fileName: string) => {
    const sectorName = fileName.replace(/\.(xlsx|xls)$/i, '');
    
    // Create sector
    const { data: sector, error: sectorError } = await supabase
      .from('service_sectors')
      .insert({
        name: sectorName,
        description: `Imported from ${fileName}`,
        position: 1
      })
      .select()
      .single();

    if (sectorError) throw sectorError;

    let totalCategories = 0;
    let totalSubcategories = 0;
    let totalJobs = 0;

    // Process data rows (skip header)
    const dataRows = data.slice(1);
    const categoryMap = new Map();
    const subcategoryMap = new Map();

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!row || row.length < 3) continue;

      const categoryName = row[0]?.toString().trim();
      const subcategoryName = row[1]?.toString().trim();
      const jobName = row[2]?.toString().trim();
      const jobDescription = row[3]?.toString().trim() || '';
      const estimatedTime = parseInt(row[4]) || null;
      const price = parseFloat(row[5]) || null;

      if (!categoryName || !subcategoryName || !jobName) continue;

      // Create or get category
      let categoryId = categoryMap.get(categoryName);
      if (!categoryId) {
        const { data: category, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            sector_id: sector.id,
            name: categoryName,
            position: categoryMap.size + 1
          })
          .select()
          .single();

        if (categoryError) throw categoryError;
        categoryId = category.id;
        categoryMap.set(categoryName, categoryId);
        totalCategories++;
      }

      // Create or get subcategory
      const subcategoryKey = `${categoryName}-${subcategoryName}`;
      let subcategoryId = subcategoryMap.get(subcategoryKey);
      if (!subcategoryId) {
        const { data: subcategory, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .insert({
            category_id: categoryId,
            name: subcategoryName
          })
          .select()
          .single();

        if (subcategoryError) throw subcategoryError;
        subcategoryId = subcategory.id;
        subcategoryMap.set(subcategoryKey, subcategoryId);
        totalSubcategories++;
      }

      // Create job
      const { error: jobError } = await supabase
        .from('service_jobs')
        .insert({
          subcategory_id: subcategoryId,
          name: jobName,
          description: jobDescription,
          estimated_time: estimatedTime,
          price: price
        });

      if (jobError) throw jobError;
      totalJobs++;

      // Update progress
      const progressPercent = Math.round((i + 1) / dataRows.length * 100);
      setProgress(prev => ({
        ...prev,
        progress: progressPercent,
        message: `Processing row ${i + 1} of ${dataRows.length}: ${jobName}`
      }));
    }

    return {
      totalSectors: 1,
      totalCategories,
      totalSubcategories,
      totalJobs,
      filesProcessed: 1
    };
  };

  const handleFileUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    setIsImporting(true);
    setProgress({
      stage: 'starting',
      progress: 0,
      message: 'Starting import process...',
      error: null,
      completed: false
    });

    try {
      // Stage 1: Upload file
      setProgress(prev => ({
        ...prev,
        stage: 'uploading',
        progress: 10,
        message: `Uploading ${file.name}...`
      }));

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `imports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('service-imports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Stage 2: Process Excel file
      setProgress(prev => ({
        ...prev,
        stage: 'processing',
        progress: 30,
        message: 'Processing Excel file...'
      }));

      const excelData = await processExcelFile(file);

      // Stage 3: Import to database
      setProgress(prev => ({
        ...prev,
        stage: 'importing',
        progress: 50,
        message: 'Importing data to database...'
      }));

      const importStats = await importDataToDatabase(excelData, file.name);

      // Stage 4: Complete
      setProgress({
        stage: 'complete',
        progress: 100,
        message: 'Import completed successfully!',
        error: null,
        completed: true
      });

      setStats(importStats);

      toast({
        title: "Import Successful",
        description: `Imported ${importStats.totalJobs} services across ${importStats.totalCategories} categories`,
      });

      // Clean up uploaded file
      await supabase.storage
        .from('service-imports')
        .remove([filePath]);

    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Import failed';
      
      setProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage,
        error: errorMessage,
        completed: false
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    disabled: isImporting
  });

  const resetImport = () => {
    setProgress({
      stage: '',
      progress: 0,
      message: '',
      error: null,
      completed: false
    });
    setStats(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Fresh Service Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isImporting && !progress.completed && !progress.error && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop your Excel file here' : 'Drag & drop an Excel file here'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or click to select a file (.xlsx, .xls)
            </p>
            <Button variant="outline">Choose File</Button>
          </div>
        )}

        {(isImporting || progress.completed || progress.error) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {progress.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                {progress.error && <AlertCircle className="h-5 w-5 text-red-600" />}
                {isImporting && <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />}
                <span className="font-medium">
                  {progress.stage === 'uploading' && 'Uploading...'}
                  {progress.stage === 'processing' && 'Processing...'}
                  {progress.stage === 'importing' && 'Importing...'}
                  {progress.stage === 'complete' && 'Complete'}
                  {progress.stage === 'error' && 'Error'}
                </span>
              </div>
              {(progress.completed || progress.error) && (
                <Button variant="outline" size="sm" onClick={resetImport}>
                  Import Another File
                </Button>
              )}
            </div>

            <Progress value={progress.progress} className="w-full" />
            
            <p className="text-sm text-gray-600">{progress.message}</p>

            {progress.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{progress.error}</p>
              </div>
            )}

            {stats && progress.completed && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{stats.totalSectors}</div>
                  <div className="text-xs text-green-600">Sectors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{stats.totalCategories}</div>
                  <div className="text-xs text-green-600">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{stats.totalSubcategories}</div>
                  <div className="text-xs text-green-600">Subcategories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{stats.totalJobs}</div>
                  <div className="text-xs text-green-600">Jobs</div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p className="font-medium mb-2">Expected Excel Format:</p>
          <p>• Column A: Category Name</p>
          <p>• Column B: Subcategory Name</p>
          <p>• Column C: Job Name</p>
          <p>• Column D: Job Description (optional)</p>
          <p>• Column E: Estimated Time in minutes (optional)</p>
          <p>• Column F: Price (optional)</p>
        </div>
      </CardContent>
    </Card>
  );
}
