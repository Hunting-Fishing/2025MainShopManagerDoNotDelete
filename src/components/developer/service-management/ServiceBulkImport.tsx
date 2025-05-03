
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileSpreadsheet, Upload, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { parseExcelToServiceHierarchy } from '@/lib/services';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { bulkImportServiceCategories } from '@/lib/services';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ServiceBulkImportProps {
  onImportComplete?: () => void;
}

export const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({ onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ServiceMainCategory[] | null>(null);
  const { toast } = useToast();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const parseFile = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    setProgress(10);
    setError(null);

    try {
      // Read the Excel file
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          setProgress(40);
          
          // Convert to an object with sheet names as keys
          const sheets: { [key: string]: any[] } = {};
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet);
          });
          
          setProgress(60);
          
          // Parse the Excel data to service categories
          const serviceCategories = parseExcelToServiceHierarchy(sheets);
          setParsedData(serviceCategories);
          setProgress(90);
          
          toast({
            title: "File parsed successfully",
            description: `Found ${serviceCategories.length} service categories with ${serviceCategories.reduce((acc, cat) => acc + cat.subcategories.length, 0)} subcategories.`,
          });
          
          setProgress(100);
        } catch (err: any) {
          console.error("Error parsing Excel:", err);
          setError(`Error parsing Excel file: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError("Error reading file");
        setIsLoading(false);
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (err: any) {
      console.error("Error during file upload:", err);
      setError(`Error uploading file: ${err.message}`);
      setIsLoading(false);
    }
  };
  
  const handleImport = async () => {
    if (!parsedData) {
      setError("No parsed data available. Please parse the file first.");
      return;
    }
    
    setIsLoading(true);
    setProgress(0);
    
    try {
      await bulkImportServiceCategories(parsedData, (progress) => {
        setProgress(Math.round(progress * 100));
      });
      
      toast({
        title: "Import completed",
        description: `Successfully imported ${parsedData.length} service categories.`,
      });
      
      if (onImportComplete) {
        onImportComplete();
      }
      
    } catch (err: any) {
      console.error("Error during import:", err);
      setError(`Error during import: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Service Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-700" />
          <AlertDescription className="text-blue-800">
            <h4 className="font-medium mb-2">Excel Format Guidelines:</h4>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Each <strong>sheet name</strong> becomes a main service category (e.g., "ADJUSTMENTS", "VIBRATIONS")</li>
              <li>Column <strong>headers in each sheet</strong> become subcategories</li>
              <li>Each cell contains a service job for that subcategory</li>
            </ol>
          </AlertDescription>
        </Alert>
        
        <div className="p-4 border border-dashed rounded-lg bg-muted/40">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Sample Excel Structure</h3>
              <div className="mt-2 p-2 bg-slate-100 rounded text-left text-xs overflow-x-auto">
                <pre>{`
Sheet Name: ADJUSTMENTS (Main Category)
-------------------------------------
Column A         | Column B
-------------------------------------
Minor Adjusts    | Major Adjusts  <-- Subcategories (headers)
-------------------------------------
Turn Mirrors     | Front End      <-- Jobs (cells)
Adjust Seatbelt  | Rack & Pinion
`}</pre>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-2">
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
            Select Excel File
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-primary file:text-white
                hover:file:bg-primary/90"
              disabled={isLoading}
            />
          </div>
          {file && (
            <p className="text-sm text-muted-foreground mt-1">
              Selected file: {file.name}
            </p>
          )}
        </div>
        
        {isLoading && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 100 ? "Processing..." : "Completed"}
            </p>
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={parseFile} 
            disabled={!file || isLoading}
          >
            Parse File
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!parsedData || isLoading}
            className="flex items-center space-x-1"
          >
            <Upload className="h-4 w-4 mr-1" />
            Import to Database
          </Button>
        </div>
        
        {parsedData && (
          <div className="mt-4 border-t pt-4">
            <h3 className="font-medium mb-2">Preview</h3>
            <div className="max-h-60 overflow-y-auto">
              <pre className="text-xs p-4 rounded bg-muted overflow-x-auto">
                {parsedData.map((category, i) => (
                  <div key={i} className="mb-2">
                    <strong>{category.name}</strong>: {category.subcategories.length} subcategories, 
                    {category.subcategories.reduce((acc, sub) => acc + sub.jobs.length, 0)} jobs
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
