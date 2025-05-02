
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle, Check } from "lucide-react";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServiceBulkImportProps {
  onImportSuccess: () => void;
}

export default function ServiceBulkImport({ onImportSuccess }: ServiceBulkImportProps) {
  const [activeTab, setActiveTab] = useState<string>('excel');
  const [jsonData, setJsonData] = useState<string>('');
  const [excelData, setExcelData] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ServiceMainCategory[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse Excel data
  const parseExcelFile = async (file: File) => {
    try {
      // Since we can't actually parse Excel here, we'll show a message
      setError("Excel parsing would happen here. In a real implementation, we would use a library like xlsx to parse the Excel file.");
      
      // Mock preview data
      setPreviewData([
        {
          id: uuidv4(),
          name: "Sample Category from Excel",
          description: "This is a sample category parsed from your Excel file",
          subcategories: [
            {
              id: uuidv4(),
              name: "Sample Subcategory",
              jobs: [
                { id: uuidv4(), name: "Sample Job 1" },
                { id: uuidv4(), name: "Sample Job 2" }
              ]
            }
          ]
        }
      ]);
    } catch (err) {
      console.error('Error parsing Excel file:', err);
      setError('Failed to parse Excel file. Please check the format.');
      setPreviewData(null);
    }
  };

  // Parse JSON data
  const parseJsonData = () => {
    try {
      const parsedData = JSON.parse(jsonData);
      
      // Validate the data structure
      if (!Array.isArray(parsedData)) {
        throw new Error('Data must be an array of categories');
      }
      
      // Generate IDs for any items that don't have them
      const processedData = parsedData.map((category: any) => {
        return {
          id: category.id || uuidv4(),
          name: category.name,
          description: category.description || '',
          subcategories: (category.subcategories || []).map((subcategory: any) => {
            return {
              id: subcategory.id || uuidv4(),
              name: subcategory.name,
              description: subcategory.description || '',
              jobs: (subcategory.jobs || []).map((job: any) => {
                return {
                  id: job.id || uuidv4(),
                  name: job.name,
                  description: job.description || '',
                  estimatedTime: job.estimatedTime || null,
                  price: job.price || null
                };
              })
            };
          })
        };
      });
      
      setPreviewData(processedData);
      setError(null);
    } catch (err) {
      console.error('Error parsing JSON:', err);
      setError((err as Error).message || 'Invalid JSON format');
      setPreviewData(null);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setExcelData(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!previewData) {
      setError('No valid data to import');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert the data into Supabase
      const { error } = await supabase
        .from('service_hierarchy')
        .upsert(previewData);
      
      if (error) throw error;
      
      toast({
        title: "Import successful",
        description: `Imported ${previewData.length} service categories`,
      });
      
      onImportSuccess();
    } catch (err) {
      console.error('Error importing data:', err);
      setError((err as Error).message || 'Failed to import data');
      
      toast({
        title: "Import failed",
        description: "There was an error importing the data.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Import Services</CardTitle>
        <CardDescription>
          Import your service data from Excel or JSON
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="excel">Excel Import</TabsTrigger>
            <TabsTrigger value="json">JSON Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="excel">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-10 w-10 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Excel File</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Upload your Excel file with service categories. Each sheet should be a main category, with columns for subcategories and jobs.
                </p>
                <Button type="button">
                  <FileText className="mr-2 h-4 w-4" /> Select File
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls"
                  className="hidden"
                />
              </div>
              
              {excelData && (
                <div className="p-4 border rounded-lg bg-slate-50">
                  <p className="font-medium">Selected File:</p>
                  <p className="text-sm">{excelData.name} ({Math.round(excelData.size / 1024)} KB)</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="json">
            <div className="space-y-4">
              <div>
                <Label htmlFor="jsonData">JSON Data</Label>
                <Textarea
                  id="jsonData"
                  className="font-mono text-sm min-h-[250px]"
                  placeholder="Paste your JSON data here..."
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={parseJsonData}
                disabled={!jsonData.trim()}
              >
                Preview Data
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {previewData && (
          <div className="mt-6 border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Preview</h3>
              <div className="text-sm text-muted-foreground">
                {previewData.length} categories, {previewData.reduce((sum, cat) => sum + cat.subcategories.length, 0)} subcategories
              </div>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto space-y-4">
              {previewData.map((category) => (
                <div key={category.id} className="border rounded p-3">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {category.subcategories.length} subcategories
                  </div>
                  
                  <div className="pl-4 border-l-2 border-slate-200 space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id}>
                        <div className="font-medium text-sm">{subcategory.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {subcategory.jobs.length} jobs
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="ml-auto" 
          onClick={handleSubmit}
          disabled={!previewData || isSubmitting}
        >
          {isSubmitting ? (
            <>Processing...</>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" /> Import Data
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
