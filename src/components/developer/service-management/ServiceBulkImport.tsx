
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, FileSpreadsheet, Download, Upload, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { parseExcelToServiceHierarchy, bulkImportServiceCategories } from '@/lib/serviceHierarchy';
import { getFormattedDate } from '@/utils/export/utils';

interface ServiceBulkImportProps {
  onImportComplete: () => void;
}

export function ServiceBulkImport({ onImportComplete }: ServiceBulkImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [processedData, setProcessedData] = useState<ServiceMainCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importStage, setImportStage] = useState<'ready' | 'processing' | 'uploading' | 'complete' | 'error'>('ready');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setIsLoading(true);
    setImportStage('processing');
    setImportProgress(10);
    setError(null);
    
    try {
      // Read the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          if (!e.target?.result) throw new Error("Failed to read file");
          
          setImportProgress(25);
          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          setImportProgress(40);
          
          // Process the Excel data
          const processed = parseExcelToServiceHierarchy(workbook.Sheets);
          
          if (!processed || processed.length === 0) {
            throw new Error("No valid data found in the Excel file. Please check the template format.");
          }
          
          setImportProgress(60);
          setProcessedData(processed);
          setImportStage('uploading');
          
          // Batch import the data
          await bulkImportServiceCategories(processed, (progress) => {
            setImportProgress(60 + Math.floor(progress * 40)); // Scale from 60% to 100%
          });
          
          setImportProgress(100);
          setImportStage('complete');
          
          toast({
            title: "Import successful",
            description: `Successfully imported ${processed.length} service categories`,
            variant: "success",
          });
          
          // Notify parent component
          onImportComplete();
        } catch (err) {
          console.error("Excel processing error:", err);
          setImportStage('error');
          setError(err instanceof Error ? err.message : "Unknown error processing Excel file");
          toast({
            title: "Import failed",
            description: err instanceof Error ? err.message : "Failed to process Excel file",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setImportStage('error');
        setError("Error reading file");
        setIsLoading(false);
        toast({
          title: "Import failed",
          description: "Error reading file",
          variant: "destructive",
        });
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (err) {
      console.error("Drop error:", err);
      setImportStage('error');
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
      toast({
        title: "Import failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }, [onImportComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    disabled: isLoading || importStage === 'uploading',
    maxFiles: 1
  });
  
  // Generate and download a template Excel file
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Subcategory 1', 'Subcategory 2', 'Subcategory 3'],
      ['Job 1-1', 'Job 2-1', 'Job 3-1'],
      ['Job 1-2', 'Job 2-2', 'Job 3-2'],
      ['Job 1-3', '', 'Job 3-3'],
    ]);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Category 1");
    
    // Add a second example sheet
    const ws2 = XLSX.utils.aoa_to_sheet([
      ['Brakes', 'Engine', 'Suspension'],
      ['Brake Pad Replacement', 'Oil Change', 'Shock Replacement'],
      ['Brake Fluid Flush', 'Timing Belt', 'Spring Replacement'],
      ['Rotor Replacement', 'Spark Plugs', 'Alignment']
    ]);
    XLSX.utils.book_append_sheet(wb, ws2, "Automotive Services");
    
    // Add instructions sheet
    const instructionsData = [
      ['Service Hierarchy Import Template Instructions'],
      [''],
      ['1. Each sheet represents a main category (e.g., "Automotive Services")'],
      ['2. The first row in each sheet contains subcategory names (e.g., "Brakes", "Engine")'],
      ['3. Rows below the first row contain service jobs for each subcategory'],
      ['4. Leave cells empty if a subcategory has fewer jobs than others']
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");
    
    XLSX.writeFile(wb, `service_hierarchy_template_${getFormattedDate()}.xlsx`);
  };
  
  // Download sample JSON
  const downloadSampleJson = () => {
    const sampleData: ServiceMainCategory[] = [
      {
        id: "sample-id-1",
        name: "Automotive Services",
        description: "Services for automotive vehicles",
        position: 0,
        subcategories: [
          {
            id: "sample-sub-id-1",
            name: "Brakes",
            description: "Brake-related services",
            jobs: [
              { id: "sample-job-id-1", name: "Brake Pad Replacement", description: "Replace worn brake pads", estimatedTime: 60, price: 120 },
              { id: "sample-job-id-2", name: "Brake Fluid Flush", description: "Flush and replace brake fluid", estimatedTime: 45, price: 89 }
            ]
          },
          {
            id: "sample-sub-id-2",
            name: "Engine",
            description: "Engine-related services",
            jobs: [
              { id: "sample-job-id-3", name: "Oil Change", description: "Change engine oil and filter", estimatedTime: 30, price: 49 },
              { id: "sample-job-id-4", name: "Timing Belt", description: "Replace timing belt", estimatedTime: 120, price: 350 }
            ]
          }
        ]
      }
    ];
    
    const dataStr = JSON.stringify(sampleData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `service_hierarchy_sample_${getFormattedDate()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetImport = () => {
    setImportStage('ready');
    setProcessedData(null);
    setImportProgress(0);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Service Categories</CardTitle>
          <CardDescription>
            Upload an Excel file containing your service hierarchy data.
            Each sheet represents a main category, and columns represent subcategories.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button variant="outline" onClick={downloadTemplate} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Download Template
            </Button>
            <Button variant="outline" onClick={downloadSampleJson} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Download Sample JSON
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {importStage !== 'complete' ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
              {isLoading ? (
                <div className="mt-4 flex flex-col items-center">
                  <LoadingSpinner size="md" />
                  <p className="mt-2 text-sm text-gray-500">
                    {importStage === 'processing' ? 'Processing Excel data...' : 'Uploading service categories...'}
                  </p>
                </div>
              ) : (
                <>
                  <p className="mt-2 text-sm font-medium">Drag & drop an Excel file, or click to browse</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Supports .xlsx and .xls formats
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center bg-green-50">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-2 text-lg font-medium text-green-800">Import Successful!</p>
              <p className="mt-1 text-sm text-green-600">
                {processedData?.length || 0} service categories have been imported.
              </p>
              <Button 
                className="mt-4"
                onClick={resetImport}
              >
                Import More
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{importStage === 'processing' ? 'Processing' : 'Uploading'}</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <p className="text-sm text-gray-500">
            The system will automatically organize your data into the service hierarchy structure.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
