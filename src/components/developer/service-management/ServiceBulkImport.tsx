import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertCircle, Check, Download } from "lucide-react";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportToExcel, exportMultiSheetExcel } from '@/utils/export/excelExport';

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

  // Generate template data for Excel export
  const generateTemplateData = () => {
    // Template for main categories sheet
    const categoriesTemplate = [
      {
        id: "category_id_1", // Will be replaced with UUID on import if blank
        name: "Brake Service",
        description: "Complete brake system services",
        position: 1
      },
      {
        id: "category_id_2",
        name: "Engine Service",
        description: "Engine repairs and maintenance",
        position: 2
      }
    ];

    // Template for subcategories sheet
    const subcategoriesTemplate = [
      {
        id: "subcategory_id_1", // Will be replaced with UUID on import if blank
        categoryId: "category_id_1", // References the parent category
        name: "Brake Pad Replacement",
        description: "Replace worn brake pads"
      },
      {
        id: "subcategory_id_2",
        categoryId: "category_id_1",
        name: "Rotor Resurfacing",
        description: "Machine brake rotors to ensure smooth braking"
      },
      {
        id: "subcategory_id_3",
        categoryId: "category_id_2",
        name: "Oil Change",
        description: "Regular oil and filter change"
      }
    ];

    // Template for jobs sheet
    const jobsTemplate = [
      {
        id: "job_id_1", // Will be replaced with UUID on import if blank
        subcategoryId: "subcategory_id_1", // References the parent subcategory
        name: "Front Brake Pad Replacement",
        description: "Replace front brake pads",
        estimatedTime: 60, // in minutes
        price: 129.99
      },
      {
        id: "job_id_2",
        subcategoryId: "subcategory_id_1",
        name: "Rear Brake Pad Replacement",
        description: "Replace rear brake pads",
        estimatedTime: 60,
        price: 139.99
      },
      {
        id: "job_id_3",
        subcategoryId: "subcategory_id_3",
        name: "Synthetic Oil Change",
        description: "Premium synthetic oil change service",
        estimatedTime: 30,
        price: 69.99
      }
    ];

    return {
      'Categories': categoriesTemplate,
      'Subcategories': subcategoriesTemplate,
      'Jobs': jobsTemplate
    };
  };

  // Handle template download
  const downloadTemplate = () => {
    const templateData = generateTemplateData();
    exportMultiSheetExcel(templateData, 'Service_Hierarchy_Template');
    
    toast({
      title: "Template downloaded",
      description: "Fill in the template and upload it in the Import section",
    });
  };

  // Generate JSON template
  const generateJsonTemplate = () => {
    const templateData = [
      {
        "id": "use UUID or leave blank for auto-generation",
        "name": "Brake Service",
        "description": "Complete brake system services",
        "position": 1,
        "subcategories": [
          {
            "id": "use UUID or leave blank for auto-generation",
            "name": "Brake Pad Replacement",
            "description": "Replace worn brake pads",
            "jobs": [
              {
                "id": "use UUID or leave blank for auto-generation",
                "name": "Front Brake Pad Replacement",
                "description": "Replace front brake pads",
                "estimatedTime": 60,
                "price": 129.99
              },
              {
                "id": "use UUID or leave blank for auto-generation",
                "name": "Rear Brake Pad Replacement",
                "description": "Replace rear brake pads",
                "estimatedTime": 60,
                "price": 139.99
              }
            ]
          }
        ]
      },
      {
        "id": "use UUID or leave blank for auto-generation",
        "name": "Engine Service",
        "description": "Engine repairs and maintenance",
        "position": 2,
        "subcategories": [
          {
            "id": "use UUID or leave blank for auto-generation",
            "name": "Oil Change",
            "description": "Regular oil and filter change",
            "jobs": [
              {
                "id": "use UUID or leave blank for auto-generation",
                "name": "Synthetic Oil Change",
                "description": "Premium synthetic oil change service",
                "estimatedTime": 30,
                "price": 69.99
              }
            ]
          }
        ]
      }
    ];
    
    return JSON.stringify(templateData, null, 2);
  };

  // Insert JSON template to the textarea
  const insertJsonTemplate = () => {
    setJsonData(generateJsonTemplate());
  };

  // Parse Excel data
  const parseExcelFile = async (file: File) => {
    try {
      // Since we can't actually parse Excel here without helpers, we'll show a message
      setError("Excel parsing would happen here. Upload your Excel file that follows the template format.");
      
      // In a real implementation, we would use a library like xlsx to parse Excel
      // For now, we'll set a mock preview to show the structure
      setPreviewData([
        {
          id: uuidv4(),
          name: "Sample from Excel",
          description: "Sample category from Excel upload",
          position: 1,
          subcategories: [
            {
              id: uuidv4(),
              name: "Sample Subcategory",
              description: "Sample subcategory description",
              jobs: [
                { 
                  id: uuidv4(), 
                  name: "Sample Job 1", 
                  description: "Sample job description",
                  estimatedTime: 30,
                  price: 59.99
                }
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
          position: category.position || 0,
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
              <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" /> Download Excel Template
                </Button>
              </div>
              
              <div className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-10 w-10 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Excel File</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Upload the completed Excel template with your service categories, subcategories, and jobs
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

              <Alert className="bg-blue-50 border-blue-200">
                <div className="text-blue-800 text-sm">
                  <p className="font-medium mb-2">Instructions for Excel Template:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Download the Excel template using the button above</li>
                    <li>The Excel file contains three sheets: Categories, Subcategories, and Jobs</li>
                    <li>Fill in the required fields in each sheet, maintaining the ID references</li>
                    <li>Save the file and upload it using the form above</li>
                  </ol>
                </div>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="json">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button 
                  variant="outline" 
                  onClick={insertJsonTemplate}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> Insert JSON Template
                </Button>
              </div>
              
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
              
              <Alert className="bg-blue-50 border-blue-200">
                <div className="text-blue-800 text-sm">
                  <p className="font-medium mb-2">JSON Format Instructions:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Use the "Insert JSON Template" button to see the expected format</li>
                    <li>Your JSON must be an array of service categories</li>
                    <li>Each category must have a name and can have subcategories</li>
                    <li>Each subcategory must have a name and can have jobs</li>
                    <li>Jobs can include estimatedTime (in minutes) and price</li>
                  </ol>
                </div>
              </Alert>
              
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
