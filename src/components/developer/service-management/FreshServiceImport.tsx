
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { batchImportServices } from '@/lib/services/serviceApi';
import * as XLSX from 'xlsx';
import type { ServiceSector } from '@/types/serviceHierarchy';

interface FreshServiceImportProps {
  onImportComplete?: () => Promise<void>;
}

export function FreshServiceImport({ onImportComplete }: FreshServiceImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string>('');
  const [importComplete, setImportComplete] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setImportComplete(false);
        toast({
          title: "File Selected",
          description: `Selected file: ${file.name}`,
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const parseExcelFile = async (file: File): Promise<ServiceSector[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sectors: ServiceSector[] = [];

          // Process each worksheet as a category
          workbook.SheetNames.forEach((sheetName, index) => {
            console.log(`Processing sheet: ${sheetName}`);
            
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length === 0) {
              console.log(`Sheet ${sheetName} is empty, skipping`);
              return;
            }

            // Create or find sector (using "Automotive Services" as default)
            let sector = sectors.find(s => s.name === 'Automotive Services');
            if (!sector) {
              sector = {
                id: `sector-${sectors.length + 1}`,
                name: 'Automotive Services',
                description: 'Imported automotive services',
                position: sectors.length + 1,
                is_active: true,
                categories: []
              };
              sectors.push(sector);
            }

            // Sheet name becomes the category name
            const categoryName = sheetName.trim();
            
            // First row contains subcategory headers
            const headers = jsonData[0] as string[];
            const subcategoryNames = headers.filter(header => header && header.trim());

            if (subcategoryNames.length === 0) {
              console.log(`No subcategory headers found in sheet ${sheetName}`);
              return;
            }

            const category = {
              id: `category-${sector.categories.length + 1}`,
              name: categoryName,
              description: `${categoryName} services`,
              position: sector.categories.length + 1,
              sector_id: sector.id,
              subcategories: subcategoryNames.map((subName, subIndex) => ({
                id: `subcategory-${sector.categories.length + 1}-${subIndex + 1}`,
                name: subName.trim(),
                description: `${subName.trim()} services`,
                category_id: `category-${sector.categories.length + 1}`,
                jobs: []
              }))
            };

            // Process remaining rows to extract jobs for each subcategory
            for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
              const row = jsonData[rowIndex] as string[];
              
              row.forEach((cellValue, colIndex) => {
                if (cellValue && cellValue.trim() && colIndex < category.subcategories.length) {
                  const jobName = cellValue.trim();
                  const subcategory = category.subcategories[colIndex];
                  
                  // Avoid duplicate jobs in the same subcategory
                  if (!subcategory.jobs.find(job => job.name === jobName)) {
                    subcategory.jobs.push({
                      id: `job-${subcategory.jobs.length + 1}`,
                      name: jobName,
                      description: `${jobName} service`,
                      estimatedTime: 60, // Default 1 hour
                      price: 100, // Default price
                      subcategory_id: subcategory.id
                    });
                  }
                }
              });
            }

            sector.categories.push(category);
            console.log(`Processed category ${categoryName} with ${category.subcategories.length} subcategories`);
          });

          console.log(`Parsed ${sectors.length} sectors from Excel file`);
          resolve(sectors);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to import",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setImportProgress('Reading Excel file...');

    try {
      console.log('Starting import process...');
      
      // Parse the Excel file
      setImportProgress('Parsing Excel data...');
      const sectorsData = await parseExcelFile(selectedFile);
      
      if (sectorsData.length === 0) {
        throw new Error('No data found in Excel file');
      }

      console.log('Parsed sectors data:', sectorsData);

      // Import to database
      setImportProgress('Importing to database...');
      await batchImportServices(sectorsData);

      setImportProgress('Import completed successfully!');
      setImportComplete(true);

      toast({
        title: "Import Successful",
        description: `Successfully imported ${sectorsData.length} sector(s) with services`,
      });

      // Notify parent component
      if (onImportComplete) {
        setTimeout(async () => {
          await onImportComplete();
        }, 1000);
      }

    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setImportProgress(`Import failed: ${errorMessage}`);
      
      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
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
            <strong>Excel Format Expected:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
              <li>Each worksheet represents a service category</li>
              <li>Row 1: Subcategory names as column headers</li>
              <li>Subsequent rows: Individual service jobs under each subcategory</li>
              <li>Empty cells are ignored</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label htmlFor="excel-file" className="block text-sm font-medium mb-2">
              Select Excel File
            </label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              disabled={isImporting}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {selectedFile && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Selected:</strong> {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                Size: {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {importProgress && (
            <Alert className={importComplete ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"}>
              {importComplete ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-blue-600" />
              )}
              <AlertDescription className={importComplete ? "text-green-700" : "text-blue-700"}>
                {importProgress}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
            className="w-full"
            size="lg"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Services
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
