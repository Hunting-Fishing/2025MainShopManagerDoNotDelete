import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { clearServiceCache } from '@/lib/services/serviceApi';

export function FreshServiceImport() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setProgress({ stage: 'ready', message: 'Files ready for processing', progress: 0, completed: false, error: null });
  }, []);

  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false
  });

  const processExcelFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress({ stage: 'reading', message: 'Reading Excel file...', progress: 10, completed: false, error: null });
      
      console.log('Processing Excel file:', file.name);
      
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Use filename (without extension) as category name
      const categoryName = file.name.replace(/\.[^/.]+$/, "");
      console.log('Category name from filename:', categoryName);
      
      setProgress({ stage: 'parsing', message: 'Parsing Excel data...', progress: 30, completed: false, error: null });
      
      // Get the first worksheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!worksheet) {
        throw new Error('No worksheet found in Excel file');
      }
      
      // Convert to JSON array with header row included
      const rawData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false 
      }) as string[][];
      
      if (rawData.length < 2) {
        throw new Error('Excel file must have at least 2 rows (headers and data)');
      }
      
      console.log('Raw Excel data rows:', rawData.length);
      
      // Row 1 contains subcategory names (column headers)
      const subcategoryHeaders = rawData[0] as string[];
      console.log('Subcategory headers:', subcategoryHeaders);
      
      // Filter out empty headers
      const validSubcategories = subcategoryHeaders
        .map((header, index) => ({ name: header?.trim(), index }))
        .filter(sub => sub.name && sub.name.length > 0);
      
      if (validSubcategories.length === 0) {
        throw new Error('No valid subcategory headers found in row 1');
      }
      
      console.log('Valid subcategories:', validSubcategories);
      
      // Process job data from row 2 onwards
      const jobRows = rawData.slice(1);
      
      // Group jobs by subcategory column
      const subcategoriesWithJobs = validSubcategories.map(subcategory => {
        const jobs = jobRows
          .map(row => row[subcategory.index]?.toString().trim())
          .filter(job => job && job.length > 0)
          .map(jobName => ({
            name: jobName,
            description: null,
            estimated_time: null,
            price: null
          }));
          
        console.log(`Subcategory "${subcategory.name}" has ${jobs.length} jobs`);
        
        return {
          name: subcategory.name,
          jobs
        };
      }).filter(subcategory => subcategory.jobs.length > 0);
      
      if (subcategoriesWithJobs.length === 0) {
        throw new Error('No valid jobs found in any subcategory columns');
      }
      
      setProgress({ stage: 'importing', message: 'Importing to database...', progress: 60, completed: false, error: null });
      
      // Import to database
      const { data, error } = await supabase.functions.invoke('import-services', {
        body: {
          sector: {
            name: 'Imported Services',
            categories: [{
              name: categoryName,
              subcategories: subcategoriesWithJobs
            }]
          }
        }
      });
      
      if (error) {
        console.error('Import function error:', error);
        throw new Error(`Import failed: ${error.message}`);
      }
      
      console.log('Import successful:', data);
      
      // Clear the service cache to force refresh
      clearServiceCache();
      
      setProgress({ 
        stage: 'complete', 
        message: `Successfully imported ${categoryName} with ${subcategoriesWithJobs.length} subcategories and ${subcategoriesWithJobs.reduce((total, sub) => total + sub.jobs.length, 0)} jobs`, 
        progress: 100, 
        completed: true, 
        error: null 
      });
      
      // Notify parent components to refresh
      if (onImportComplete) {
        onImportComplete();
      }
      
      setFiles([]);
      
      toast({
        title: "Import Successful",
        description: `Imported category "${categoryName}" with ${subcategoriesWithJobs.length} subcategories`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Excel processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setProgress({ 
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
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to import.",
        variant: "destructive",
      });
      return;
    }

    await processExcelFile(files[0]);
  };

  const getIcon = () => {
    if (progress.error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (progress.completed) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-blue-500" />;
  };

  const getVariant = () => {
    if (progress.error) return 'destructive' as const;
    if (progress.completed) return 'default' as const;
    return 'default' as const;
  };

  const onImportComplete = () => {
    // Implementation for handling import completion
    console.log('Import completed!');
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Fresh Service Import</h3>
        <p className="text-sm text-blue-700 mb-4">
          Upload Excel files to import services. Each file will create a new category.
        </p>
        
        <div className="bg-white border border-blue-200 rounded p-3 mb-4">
          <h4 className="font-medium text-blue-800 mb-2">Expected Excel Format:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>File name</strong> = Category name (e.g., "Automotive Services.xlsx")</li>
            <li>• <strong>Row 1</strong> = Subcategory names across columns (e.g., "Engine", "Brakes", "AC")</li>
            <li>• <strong>Row 2+</strong> = Job names listed vertically under each subcategory</li>
            <li>• Empty cells are automatically skipped</li>
          </ul>
        </div>
      </div>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'dropzone--isActive' : ''} bg-gray-50 border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer`}>
        <input {...getInputProps()} />
        <UploadCloud className="h-6 w-6 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">
          {isDragActive ? "Drop the file here..." : "Click or drag an Excel file here to import"}
        </p>
      </div>

      {files.length > 0 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-3">
          <p className="text-sm text-gray-700">
            Selected file: {files[0].name}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFiles([])}
          >
            Remove
          </Button>
        </div>
      )}

      {progress.stage && (
        <Alert variant={getVariant()}>
          <div className="flex items-center gap-2">
            {getIcon()}
            <AlertDescription className="flex-1">
              <div className="font-medium">Service Import - {progress.stage}</div>
              <div className="text-sm mt-1">{progress.message}</div>
            </AlertDescription>
          </div>
        </Alert>
      )}

      {isProcessing && (
        <Progress value={progress.progress} className="w-full" />
      )}

      <Button 
        onClick={handleUpload} 
        disabled={isProcessing || files.length === 0}
      >
        {isProcessing ? 'Processing...' : 'Start Import'}
      </Button>
    </div>
  );
}
