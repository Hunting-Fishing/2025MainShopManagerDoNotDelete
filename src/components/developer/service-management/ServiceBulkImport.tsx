
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/shared/FileUploader';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import { parseExcelToServiceHierarchy, bulkImportServiceCategories } from '@/lib/serviceHierarchy';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { getFormattedDate } from '@/utils/export/utils';
import { v4 as uuidv4 } from 'uuid';

export function ServiceBulkImport({ onImportComplete }: { onImportComplete: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [importMethod, setImportMethod] = useState<'excel' | 'json'>('excel');
  const [jsonText, setJsonText] = useState<string>('');

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

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
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            result[sheetName] = sheetData;
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
      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();
      
      // Categories sheet
      const categoriesSheet = XLSX.utils.json_to_sheet([
        {
          id: uuidv4(),
          name: "Sample Category",
          description: "A sample service category",
          position: 0
        }
      ]);
      XLSX.utils.book_append_sheet(wb, categoriesSheet, 'Categories');
      
      // Subcategories sheet
      const subcategoriesSheet = XLSX.utils.json_to_sheet([
        {
          id: uuidv4(),
          categoryId: "PASTE_CATEGORY_ID_HERE", // Reference to category
          name: "Sample Subcategory",
          description: "A sample subcategory"
        }
      ]);
      XLSX.utils.book_append_sheet(wb, subcategoriesSheet, 'Subcategories');
      
      // Jobs sheet
      const jobsSheet = XLSX.utils.json_to_sheet([
        {
          id: uuidv4(),
          subcategoryId: "PASTE_SUBCATEGORY_ID_HERE", // Reference to subcategory
          name: "Sample Job",
          description: "A sample job service",
          estimatedTime: 60, // in minutes
          price: 99.99
        }
      ]);
      XLSX.utils.book_append_sheet(wb, jobsSheet, 'Jobs');
      
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
          name: "Sample Category",
          description: "A sample service category",
          position: 0,
          subcategories: [
            {
              id: uuidv4(),
              name: "Sample Subcategory",
              description: "A sample subcategory",
              jobs: [
                {
                  id: uuidv4(),
                  name: "Sample Job",
                  description: "A sample job service",
                  estimatedTime: 60,
                  price: 99.99
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
              <FileUploader 
                onFilesSelected={handleFileChange}
                acceptedFileTypes={['.xlsx', '.xls']}
                maxFiles={1}
                currentFiles={file ? [file] : []}
              />
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
