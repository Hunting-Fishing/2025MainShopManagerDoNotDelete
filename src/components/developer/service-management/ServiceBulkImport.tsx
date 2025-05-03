
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { write, utils } from 'xlsx'; // Update import to correctly import write
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, Download, FileSpreadsheet, AlertCircle, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { parseExcelToServiceHierarchy, bulkImportServiceCategories, fetchServiceCategories } from "@/lib/serviceHierarchy";
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { getFormattedDate } from "@/utils/export/utils";

export function ServiceBulkImport({ onImportComplete }: { onImportComplete: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importedData, setImportedData] = useState<ServiceMainCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'review' | 'importing' | 'complete'>('upload');

  // Clear any previous errors when starting a new operation
  const clearErrors = () => {
    setError(null);
  };

  // Handle file drop/selection
  const onDrop = async (acceptedFiles: File[]) => {
    clearErrors();
    
    if (acceptedFiles.length === 0) {
      setError("No file selected");
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Read the file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          console.log("Sheets in workbook:", workbook.SheetNames);
          
          // Extract the data from the workbook
          const excelData: Record<string, any[]> = {};
          
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            console.log(`Processing sheet: ${sheetName}`);
            
            try {
              // Convert sheet to JSON with header:1 to get array format
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1,
                defval: ""  // Default empty cells to empty string
              });
              
              // Skip empty sheets or sheets with only headers
              if (jsonData.length > 1) {
                console.log(`Sheet ${sheetName} has ${jsonData.length} rows`);
                // Convert to the format expected by parseExcelToServiceHierarchy
                const sheetData = XLSX.utils.sheet_to_json(worksheet);
                excelData[sheetName] = sheetData;
              } else {
                console.log(`Skipping sheet ${sheetName}: insufficient data`);
              }
            } catch (sheetError) {
              console.error(`Error processing sheet ${sheetName}:`, sheetError);
            }
          });
          
          console.log("Parsed Excel data:", excelData);
          
          if (Object.keys(excelData).length === 0) {
            throw new Error("No valid data found in the Excel file. Please check the file format and try again.");
          }
          
          // Parse the Excel data into service categories
          const parsedData = parseExcelToServiceHierarchy(excelData);
          
          console.log("Parsed service categories:", parsedData);
          
          setImportedData(parsedData);
          setCurrentStep('review');
        } catch (parseError: any) {
          console.error("Error parsing Excel:", parseError);
          setError(`Error parsing Excel file: ${parseError.message}`);
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        setError("Error reading the file");
        setIsUploading(false);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(`Upload error: ${err.message}`);
      setIsUploading(false);
    }
  };

  // Handle import confirmation
  const handleImport = async () => {
    if (!importedData) return;
    
    try {
      setIsImporting(true);
      setCurrentStep('importing');
      setProgress(0);
      
      await bulkImportServiceCategories(importedData, (progress) => {
        setProgress(Math.round(progress * 100));
      });
      
      setCurrentStep('complete');
      toast({
        title: "Import successful",
        description: `${importedData.length} service categories imported successfully.`,
        variant: "success",
      });
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err: any) {
      console.error("Import error:", err);
      setError(`Import error: ${err.message}`);
      setCurrentStep('review');
    } finally {
      setIsImporting(false);
    }
  };

  // Reset the import process
  const resetImport = () => {
    setImportedData(null);
    setError(null);
    setProgress(0);
    setCurrentStep('upload');
  };

  // Create a sample template for download
  const downloadTemplate = () => {
    try {
      const templateData = {
        "HVAC Services": [
          { "Cooling": "AC Tune-Up", "Heating": "Furnace Inspection", "Maintenance": "Duct Cleaning" },
          { "Cooling": "AC Repair", "Heating": "Furnace Repair", "Maintenance": "Filter Replacement" },
          { "Cooling": "AC Installation", "Heating": "Furnace Installation", "Maintenance": "Thermostat Programming" }
        ],
        "Plumbing Services": [
          { "Repairs": "Leak Repair", "Installation": "Faucet Installation", "Maintenance": "Drain Cleaning" },
          { "Repairs": "Pipe Repair", "Installation": "Toilet Installation", "Maintenance": "Water Heater Flush" },
          { "Repairs": "Fixture Repair", "Installation": "Shower Installation", "Maintenance": "Pipe Inspection" }
        ],
        "Instructions": [
          { "Column A": "Each sheet represents a main service category", "Column B": "", "Column C": "" },
          { "Column A": "The first row contains subcategory names", "Column B": "", "Column C": "" },
          { "Column A": "Each row below contains service jobs", "Column B": "", "Column C": "" }
        ]
      };
      
      // Create workbook
      const wb = utils.book_new();
      
      // Add each sheet
      Object.entries(templateData).forEach(([sheetName, sheetData]) => {
        const ws = utils.json_to_sheet(sheetData);
        utils.book_append_sheet(wb, ws, sheetName);
      });
      
      // Generate Excel file and trigger download
      const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `service_categories_template_${getFormattedDate()}.xlsx`;
      link.click();
      
      toast({
        title: "Template downloaded",
        description: "Service categories template has been downloaded.",
      });
    } catch (err: any) {
      console.error("Template download error:", err);
      toast({
        title: "Template download failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Bulk Import Service Categories</h3>
        <Button 
          variant="outline" 
          onClick={downloadTemplate} 
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Excel File</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              
              {isUploading ? (
                <div className="space-y-2">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                  <p className="text-sm text-gray-500">Reading Excel file...</p>
                </div>
              ) : (
                <>
                  <p className="text-base font-medium">
                    {isDragActive ? 'Drop the Excel file here' : 'Drag and drop an Excel file, or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload an Excel file with service categories, subcategories, and jobs
                  </p>
                  <p className="text-xs text-gray-400 mt-4">
                    Each sheet represents a main category.<br />
                    First row contains subcategory names.<br />
                    Rows below contain service jobs for each subcategory.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {currentStep === 'review' && importedData && (
        <Card>
          <CardHeader>
            <CardTitle>Review Import Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Categories:</span>
                  <span className="font-medium">{importedData.length}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Subcategories:</span>
                  <span className="font-medium">
                    {importedData.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Total Services:</span>
                  <span className="font-medium">
                    {importedData.reduce((sum, cat) => 
                      sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0)}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleImport} 
                  className="flex-1"
                  disabled={isImporting}
                >
                  Import Data
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetImport}
                  disabled={isImporting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {currentStep === 'importing' && (
        <Card>
          <CardHeader>
            <CardTitle>Importing Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="font-medium">Importing services...</div>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="text-sm text-gray-500 text-right">{progress}% complete</div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {currentStep === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle>Import Complete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-6 w-6" />
                <div className="font-medium">All services imported successfully!</div>
              </div>
              <Button onClick={resetImport}>Import Another File</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
