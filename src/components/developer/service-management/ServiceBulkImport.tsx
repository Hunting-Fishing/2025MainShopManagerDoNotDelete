
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { parseExcelToServiceHierarchy, bulkImportServiceCategories } from '@/lib/serviceHierarchy';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { toast } from '@/hooks/use-toast';
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ServiceBulkImportProps {
  onImportComplete: () => void;
}

export function ServiceBulkImport({ onImportComplete }: ServiceBulkImportProps) {
  const [previewData, setPreviewData] = useState<ServiceMainCategory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStage, setImportStage] = useState<string>('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        processExcelFile(acceptedFiles[0]);
      }
    }
  });

  const processExcelFile = async (file: File) => {
    setError(null);
    setPreviewData(null);
    setIsProcessing(true);
    setImportStage('Reading Excel file...');
    setImportProgress(10);

    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          setImportStage('Parsing data...');
          setImportProgress(30);
          
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          setImportStage('Converting to service categories...');
          setImportProgress(60);
          
          const jsonData: any = {};
          workbook.SheetNames.forEach(sheetName => {
            jsonData[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          });

          setImportStage('Generating preview...');
          setImportProgress(90);
          
          const serviceCategories = parseExcelToServiceHierarchy(jsonData);
          
          setPreviewData(serviceCategories);
          setImportProgress(100);
          setImportStage('Preview ready');
          
          setTimeout(() => {
            setIsProcessing(false);
            setImportProgress(0);
          }, 500);
        } catch (err: any) {
          setError(`Error processing file: ${err.message || 'Unknown error'}`);
          setIsProcessing(false);
          setImportProgress(0);
        }
      };
      
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      setError(`Error reading file: ${err.message || 'Unknown error'}`);
      setIsProcessing(false);
      setImportProgress(0);
    }
  };

  const handleBulkImport = async () => {
    if (!previewData) return;
    
    try {
      setIsImporting(true);
      setImportStage('Importing to database...');
      setImportProgress(50);
      
      await bulkImportServiceCategories(previewData);
      
      toast({
        title: "Import successful",
        description: `${previewData.length} categories imported with their subcategories and jobs.`,
        variant: "success",
      });
      
      setImportProgress(100);
      setImportStage('Import complete');
      
      setTimeout(() => {
        setIsImporting(false);
        setPreviewData(null);
        onImportComplete();
      }, 1000);
    } catch (err: any) {
      setError(`Error importing data: ${err.message || 'Unknown error'}`);
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const downloadTemplateFile = () => {
    // Create a simple Excel template
    const template = {
      "Maintenance": [
        { "Oil Change": "Oil Change - Standard", "Brakes": "Brake Pad Replacement", "Filters": "Air Filter Replacement" },
        { "Oil Change": "Oil Change - Synthetic", "Brakes": "Brake Rotor Replacement", "Filters": "Cabin Filter Replacement" }
      ],
      "Repair": [
        { "Engine": "Engine Diagnostic", "Electrical": "Battery Replacement", "Transmission": "Transmission Fluid Change" }
      ]
    };
    
    const wb = XLSX.utils.book_new();
    
    // Create sheets for each category
    Object.keys(template).forEach((categoryName) => {
      const records = template[categoryName as keyof typeof template];
      const ws = XLSX.utils.json_to_sheet(records);
      XLSX.utils.book_append_sheet(wb, ws, categoryName);
    });
    
    // Generate the Excel file
    XLSX.writeFile(wb, 'service-categories-template.xlsx');
    
    toast({
      title: "Template downloaded",
      description: "You can now fill in your service categories and import them back.",
    });
  };

  const downloadSampleJSON = () => {
    const sampleData = [
      {
        "id": "cat-001",
        "name": "Maintenance",
        "description": "Regular vehicle maintenance services",
        "position": 0,
        "subcategories": [
          {
            "id": "subcat-001",
            "name": "Oil Change",
            "description": "Maintenance - Oil Change",
            "jobs": [
              {
                "id": "job-001",
                "name": "Standard Oil Change",
                "description": "Standard oil change service",
                "estimatedTime": 30,
                "price": 39.99
              },
              {
                "id": "job-002",
                "name": "Synthetic Oil Change",
                "description": "Synthetic oil change service",
                "estimatedTime": 30,
                "price": 59.99
              }
            ]
          },
          {
            "id": "subcat-002",
            "name": "Brakes",
            "description": "Maintenance - Brakes",
            "jobs": [
              {
                "id": "job-003",
                "name": "Brake Inspection",
                "description": "Complete brake system inspection",
                "estimatedTime": 45,
                "price": 19.99
              }
            ]
          }
        ]
      }
    ];
    
    const jsonString = JSON.stringify(sampleData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-service-categories.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Sample JSON downloaded",
      description: "You can use this as a reference for the data structure.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Category Bulk Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button variant="outline" onClick={downloadTemplateFile} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Download Template
            </Button>
            <Button variant="outline" onClick={downloadSampleJSON} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Download Sample JSON
            </Button>
          </div>

          {(isProcessing || isImporting) && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{importStage}</span>
                <span className="text-sm text-muted-foreground">{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2 w-full" />
            </div>
          )}
          
          {!previewData && !isProcessing && !isImporting && (
            <div 
              {...getRootProps()} 
              className="border-2 border-dashed rounded-md p-10 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-4 text-lg font-medium">Drop your Excel file here, or click to select</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload an Excel file with service categories. Each sheet should be a main category,
                column headers are subcategories, and rows below are jobs.
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {previewData && !isImporting && (
            <div className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-semibold mb-3">Preview: {previewData.length} categories to import</h3>
                <ul className="space-y-2">
                  {previewData.map((category) => (
                    <li key={category.id} className="ml-2">
                      <span className="font-medium">{category.name}</span> - {category.subcategories.length} subcategories, {
                        category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)
                      } jobs
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setPreviewData(null)}
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkImport} 
                  disabled={isImporting}
                  className="flex items-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <LoadingSpinner size="sm" /> Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" /> Import Categories
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
