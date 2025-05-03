
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { parseExcelToServiceHierarchy, bulkImportServiceCategories } from '@/lib/serviceHierarchy';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { getFormattedDate } from '@/utils/export/utils';
import { v4 as uuidv4 } from 'uuid';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';

interface ServiceBulkImportProps {
  onImportComplete: () => void;
}

export function ServiceBulkImport({ onImportComplete }: ServiceBulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [importMethod, setImportMethod] = useState<'excel' | 'json'>('excel');
  const [jsonText, setJsonText] = useState<string>('');

  // Use react-dropzone for file uploads
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    }
  });

  const parseExcelFile = async (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          const result: Record<string, any[]> = {};
          
          // Process each sheet
          workbook.SheetNames.forEach(sheetName => {
            // Convert sheet to JSON
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { 
              defval: null, // Use null for empty cells
              blankrows: false // Skip blank rows
            });
            
            if (sheetData.length > 0) {
              result[sheetName] = sheetData;
            }
          });
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const handleUpload = async () => {
    if (!file && importMethod === 'excel') {
      toast({
        title: 'File Required',
        description: 'Please select a file to import.',
        variant: 'destructive'
      });
      return;
    }

    if (!jsonText && importMethod === 'json') {
      toast({
        title: 'JSON Required',
        description: 'Please enter JSON data to import.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);

    try {
      let serviceCategories: ServiceMainCategory[];

      if (importMethod === 'excel' && file) {
        // Parse Excel file
        const excelData = await parseExcelFile(file);
        console.log('Parsed Excel data:', excelData);
        serviceCategories = parseExcelToServiceHierarchy(excelData);
      } else {
        // Parse JSON
        try {
          const jsonData = JSON.parse(jsonText);
          serviceCategories = Array.isArray(jsonData) ? jsonData : [jsonData];
        } catch (error) {
          throw new Error('Invalid JSON format. Please check your input.');
        }
      }

      console.log('Service categories to import:', serviceCategories);
      
      // Import data
      await bulkImportServiceCategories(serviceCategories);
      
      toast({
        title: 'Import Successful',
        description: `Successfully imported ${serviceCategories.length} service categories.`,
      });
      
      // Notify parent component that import is complete
      onImportComplete();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Import Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      console.error('Import error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      // Create workbook with sheet tabs for categories
      const wb = XLSX.utils.book_new();
      
      // Create sample categories with columns as subcategories
      const categories = [
        "Adjustments & Diagnosis", 
        "Engine Performance", 
        "Brakes & Wheels", 
        "Electrical & Lighting"
      ];
      
      categories.forEach(category => {
        // Create a worksheet for each category
        const data: Record<string, any>[] = [];
        
        // Add column headers (subcategories)
        const subcategories = {
          "Subcategory A": "Sample item 1",
          "Subcategory B": "Sample item 1",
          "Subcategory C": "Sample item 1",
        };
        
        // Add rows
        data.push(subcategories);
        data.push({
          "Subcategory A": "Sample item 2",
          "Subcategory B": "Sample item 2",
          "Subcategory C": "Sample item 2",
        });
        data.push({
          "Subcategory A": "Sample item 3",
          "Subcategory B": "Sample item 3",
          "Subcategory C": "Sample item 3",
        });
        
        const sheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, sheet, category);
      });
      
      // Export to Excel file
      const filename = `service-hierarchy-template-${getFormattedDate()}.xlsx`;
      XLSX.writeFile(wb, filename);
      
      toast({
        title: 'Template Downloaded',
        description: 'Template file has been downloaded successfully. Fill it out and import when ready.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download template file.',
        variant: 'destructive'
      });
      console.error('Template download error:', error);
    }
  };

  const handleDownloadSampleJson = () => {
    try {
      const sampleData: ServiceMainCategory[] = [
        {
          id: uuidv4(),
          name: "Engine Performance",
          description: "Engine-related services",
          position: 0,
          subcategories: [
            {
              id: uuidv4(),
              name: "Engine Diagnostics",
              description: "Engine diagnostic services",
              jobs: [
                {
                  id: uuidv4(),
                  name: "Engine Check",
                  description: "Complete engine diagnostic service",
                  estimatedTime: 60,
                  price: 99.99
                },
                {
                  id: uuidv4(),
                  name: "Engine Knocks",
                  description: "Diagnose engine knocking sound",
                  estimatedTime: 45,
                  price: 79.99
                }
              ]
            },
            {
              id: uuidv4(),
              name: "Engine Performance Issues",
              description: "Engine performance related services",
              jobs: [
                {
                  id: uuidv4(),
                  name: "Poor Fuel Mileage",
                  description: "Diagnose poor fuel efficiency",
                  estimatedTime: 30,
                  price: 69.99
                }
              ]
            }
          ]
        }
      ];
      
      const jsonString = JSON.stringify(sampleData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = href;
      link.download = `service-hierarchy-sample-${getFormattedDate()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Sample JSON Downloaded',
        description: 'Sample JSON file has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download sample JSON.',
        variant: 'destructive'
      });
      console.error('JSON download error:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Import Services</CardTitle>
        <CardDescription>
          Import services in bulk using Excel or JSON format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              variant={importMethod === 'excel' ? 'default' : 'outline'} 
              onClick={() => setImportMethod('excel')}
            >
              Excel Import
            </Button>
            <Button 
              variant={importMethod === 'json' ? 'default' : 'outline'} 
              onClick={() => setImportMethod('json')}
            >
              JSON Import
            </Button>
          </div>

          {importMethod === 'excel' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  Download Template
                </Button>
              </div>
              
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}>
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div className="flex flex-col space-y-1">
                    <p className="text-base font-medium">
                      {isDragActive 
                        ? 'Drop the Excel file here' 
                        : file 
                          ? `Selected file: ${file.name}` 
                          : 'Drop Excel file here or click to select'
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Upload an Excel file (.xlsx, .xls)
                    </p>
                  </div>
                </div>
                {file && (
                  <div className="mt-4 flex items-center gap-2 rounded-md border p-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button variant="outline" onClick={handleDownloadSampleJson}>
                Download Sample JSON
              </Button>
              <textarea
                className="w-full h-64 p-4 border rounded-md font-mono text-sm"
                placeholder='Paste your JSON here...'
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => onImportComplete()}>
          Cancel
        </Button>
        <Button onClick={handleUpload} disabled={isUploading}>
          {isUploading ? 'Importing...' : 'Import'}
        </Button>
      </CardFooter>
    </Card>
  );
}
