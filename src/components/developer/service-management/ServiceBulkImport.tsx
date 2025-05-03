
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { read, utils } from 'xlsx';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { parseExcelToServiceHierarchy, bulkImportServiceCategories } from '@/lib/serviceHierarchy';
import { toast } from '@/hooks/use-toast';
import { handleApiError } from '@/utils/errorHandling';
import { getFormattedDate } from '@/utils/export/utils';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface ServiceBulkImportProps {
  onImportComplete?: () => void;
}

export function ServiceBulkImport({ onImportComplete }: ServiceBulkImportProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Clear any existing errors when starting new operations
  const clearErrors = () => {
    setParseError(null);
    setDebugInfo(null);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    clearErrors();
    
    if (acceptedFiles.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to import.",
        variant: "destructive",
      });
      return;
    }

    const file = acceptedFiles[0];
    setUploadedFileName(file.name);
    setIsUploading(true);
    setProgress(5);
    
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          setProgress(30);
          const data = e.target?.result;
          if (!data) throw new Error("Failed to read file data");
          
          // Parse the Excel file
          const workbook = read(data, { type: 'binary', cellDates: true });
          setProgress(50);
          
          // Debug info
          const sheetNames = workbook.SheetNames;
          const firstSheet = workbook.Sheets[sheetNames[0]];
          const debugSheet = utils.sheet_to_json(firstSheet);
          setDebugInfo({
            sheetNames,
            firstSheetSample: debugSheet.slice(0, 3)
          });
          
          // Convert to JSON
          const excelData: Record<string, any[]> = {};
          
          for (const sheetName of sheetNames) {
            if (!sheetName.startsWith('!')) {
              const sheet = workbook.Sheets[sheetName];
              excelData[sheetName] = utils.sheet_to_json(sheet);
              console.log(`Sheet ${sheetName} has ${excelData[sheetName].length} rows`);
            }
          }
          
          if (Object.keys(excelData).length === 0) {
            throw new Error("No valid sheets found in the Excel file");
          }
          
          if (Object.values(excelData).every(sheet => sheet.length === 0)) {
            throw new Error("All sheets in the Excel file are empty");
          }
          
          // Parse the data
          console.log('Excel data before parsing:', excelData);
          setProgress(75);
          const parsedCategories = parseExcelToServiceHierarchy(excelData);
          
          if (!parsedCategories || parsedCategories.length === 0) {
            throw new Error("No valid data found in the Excel file. Please check the template format.");
          }
          
          setParsedData(parsedCategories);
          setProgress(100);
          
          toast({
            title: "Excel file processed successfully",
            description: `Found ${parsedCategories.length} service categories with ${parsedCategories.reduce((sum, cat) => sum + cat.subcategories.length, 0)} subcategories.`,
            variant: "default",
          });
          
        } catch (error: any) {
          console.error("Excel processing error:", error);
          setParseError(error.message || "Failed to parse Excel file");
          toast({
            title: "Import failed",
            description: error.message || "Failed to parse Excel file",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        setParseError("Failed to read Excel file");
        setIsUploading(false);
        toast({
          title: "Import failed",
          description: "Failed to read Excel file",
          variant: "destructive",
        });
      };
      
      // Read the file as binary
      reader.readAsBinaryString(file);
      
    } catch (error: any) {
      setParseError(error.message || "An unexpected error occurred");
      setIsUploading(false);
      handleApiError(error, "Failed to process Excel file");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    disabled: isUploading || isImporting,
  });

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) {
      toast({
        title: "No data to import",
        description: "Please upload a valid Excel file first.",
        variant: "destructive",
      });
      return;
    }
    
    setIsImporting(true);
    setProgress(0);
    
    try {
      await bulkImportServiceCategories(parsedData, (progress) => {
        setProgress(progress * 100);
      });
      
      toast({
        title: "Import completed successfully",
        description: `Imported ${parsedData.length} service categories.`,
        variant: "default",
      });
      
      // Reset the state
      setParsedData(null);
      setUploadedFileName(null);
      setProgress(100);
      
      // Notify parent
      if (onImportComplete) {
        onImportComplete();
      }
      
    } catch (error) {
      handleApiError(error, "Failed to import service categories");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadSampleJson = () => {
    const sample = [
      {
        "id": "sample-id-1",
        "name": "Engine Services",
        "description": "All engine related services",
        "position": 0,
        "subcategories": [
          {
            "id": "sub-1",
            "name": "Engine Repair",
            "description": "Engine repair services",
            "jobs": [
              {
                "id": "job-1",
                "name": "Oil Change",
                "description": "Standard oil change service",
                "estimatedTime": 30,
                "price": 49.99
              },
              {
                "id": "job-2",
                "name": "Engine Flush",
                "description": "Complete engine flush service",
                "estimatedTime": 60,
                "price": 89.99
              }
            ]
          }
        ]
      }
    ];
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sample, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `service_categories_sample.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadTemplate = () => {
    // Create a workbook with sample data
    const wb = utils.book_new();
    
    // Engine Services sheet
    const engineData = [
      { A: 'Oil Change Services', B: 'Engine Repair', C: 'Diagnostics' },
      { A: 'Standard Oil Change', B: 'Timing Belt Replacement', C: 'Check Engine Light' },
      { A: 'Synthetic Oil Change', B: 'Head Gasket Replacement', C: 'Computer Diagnostic' },
      { A: 'Oil Filter Replacement', B: 'Engine Rebuild', C: 'Electrical System Check' }
    ];
    const engineWs = utils.json_to_sheet(engineData);
    utils.book_append_sheet(wb, engineWs, "Engine Services");
    
    // Transmission sheet
    const transmissionData = [
      { A: 'Transmission Fluid Services', B: 'Transmission Repair' },
      { A: 'Transmission Fluid Change', B: 'Transmission Rebuild' },
      { A: 'Transmission Flush', B: 'Clutch Replacement' }
    ];
    const transmissionWs = utils.json_to_sheet(transmissionData);
    utils.book_append_sheet(wb, transmissionWs, "Transmission");
    
    // Instructions sheet
    const instructionsData = [
      { A: 'Instructions for Service Hierarchy Import Template:' },
      { A: '' },
      { A: '1. Each sheet represents a main service category.' },
      { A: '2. The first row in each sheet defines the subcategories.' },
      { A: '3. Rows below the first row contain service jobs for each subcategory.' },
      { A: '4. Empty cells will be ignored.' }
    ];
    const instructionsWs = utils.json_to_sheet(instructionsData);
    utils.book_append_sheet(wb, instructionsWs, "Instructions");
    
    // Generate and download
    const wbout = utils.write(wb, { bookType: 'xlsx', type: 'binary' });
    
    // Convert to blob
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i=0; i<wbout.length; i++) {
      view[i] = wbout.charCodeAt(i) & 0xFF;
    }
    
    // Download
    const blob = new Blob([buf], {type: 'application/octet-stream'});
    const url = URL.createObjectURL(blob);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", `service_hierarchy_template_${getFormattedDate()}.xlsx`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Bulk Import Service Categories</CardTitle>
        <CardDescription>
          Import service categories, subcategories, and jobs from an Excel file.
          Each sheet represents a category, the first row contains subcategories, and rows below contain services.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Download templates section */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Download Excel Template
          </Button>
          <Button onClick={downloadSampleJson} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> View Sample JSON Structure
          </Button>
        </div>
        
        {/* File drop zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
          } ${(isUploading || isImporting) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
          
          {uploadedFileName ? (
            <p className="mt-4 font-medium">Selected: {uploadedFileName}</p>
          ) : (
            <div>
              <p className="mt-4 text-lg font-medium">Drag & drop an Excel file here, or click to select</p>
              <p className="mt-2 text-sm text-gray-500">Supports .xlsx and .xls files</p>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        {(isUploading || isImporting || progress > 0) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{isUploading ? "Processing file" : isImporting ? "Importing data" : "Complete"}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {/* Errors */}
        {parseError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Import Error</AlertTitle>
            <AlertDescription>
              {parseError}
              {debugInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Debug Information</summary>
                  <pre className="mt-2 p-2 bg-gray-800 text-white rounded text-xs overflow-auto max-h-48">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Success preview */}
        {parsedData && !parseError && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>File Processed Successfully</AlertTitle>
            <AlertDescription>
              Found {parsedData.length} categories with {parsedData.reduce((sum: number, cat: any) => sum + cat.subcategories.length, 0)} subcategories and
              {parsedData.reduce((sum: number, cat: any) => sum + cat.subcategories.reduce((sum2: number, sub: any) => sum2 + sub.jobs.length, 0), 0)} jobs.
              Click Import to save these to the database.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleImport} 
          disabled={!parsedData || isImporting}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isImporting ? "Importing..." : "Import Categories"}
        </Button>
      </CardFooter>
    </Card>
  );
}
