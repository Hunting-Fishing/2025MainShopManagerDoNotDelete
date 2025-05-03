
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from '@/hooks/use-toast';
import { serviceCategories } from '@/data/commonServices';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { AlertCircle, ArrowDownToLine, FileX, FileCheck, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { bulkImportServiceCategories } from '@/lib/services/serviceApi';
import { v4 as uuidv4 } from 'uuid';

interface ServiceBulkImportProps {
  onImportComplete: () => void;
}

export const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({ onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importStep, setImportStep] = useState<'select' | 'preview' | 'importing' | 'complete'>('select');
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (data: { categories: ServiceMainCategory[] }) => {
      return await bulkImportServiceCategories(
        data.categories, 
        (progress) => setImportProgress(Math.round(progress * 100))
      );
    },
    onSuccess: () => {
      setImportStep('complete');
      toast({
        title: "Import successful",
        description: "All service categories have been imported successfully.",
      });
      onImportComplete();
    },
    onError: (error: Error) => {
      setError(error.message);
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };

  const handleImportDefaults = () => {
    // Transform the commonServices data to match the ServiceMainCategory structure
    const transformedCategories: ServiceMainCategory[] = serviceCategories.map((category, index) => {
      return {
        id: uuidv4(), // Generate a unique ID for each category
        name: category.name,
        description: `Imported from commonServices data`,
        position: index,
        subcategories: category.subcategories.map(sub => ({
          id: uuidv4(), // Generate a unique ID for each subcategory
          name: sub.name,
          jobs: sub.services.map(serviceName => ({
            id: uuidv4(), // Generate a unique ID for each job
            name: serviceName,
            estimatedTime: 60, // Default estimated time of 60 minutes
          }))
        }))
      };
    });
    
    // Start the import process
    importMutation.mutate({ categories: transformedCategories });
    setImportStep('importing');
  };

  const resetImport = () => {
    setFile(null);
    setImportStep('select');
    setImportProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderStep = () => {
    switch (importStep) {
      case 'select':
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:border-gray-400 transition-all">
              <ArrowDownToLine className="h-10 w-10 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Select an Excel file to import or use default services</p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Select File
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  accept=".xlsx,.xls" 
                  className="hidden" 
                />
                <Button onClick={handleImportDefaults} variant="default">
                  Import Default Services
                </Button>
              </div>
              {file && (
                <div className="mt-4 flex items-center space-x-2">
                  <FileCheck className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              )}
            </div>
            
            <div className="rounded-lg bg-muted p-4">
              <h3 className="font-medium mb-2">Importing from Default Services</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This will import the standard service hierarchy with {serviceCategories.length} categories and 
                {serviceCategories.reduce((total, cat) => 
                  total + cat.subcategories.reduce((subTotal, sub) => 
                    subTotal + sub.services.length, 0), 0)
                } services.
              </p>
              <Button onClick={handleImportDefaults} variant="default">
                Import Default Services
              </Button>
            </div>
          </div>
        );

      case 'importing':
        return (
          <div className="space-y-6">
            <div className="p-6 bg-muted rounded-lg">
              <h3 className="font-medium mb-4">Importing Services</h3>
              <Progress value={importProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">{importProgress}% complete</p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="p-6 bg-muted/30 rounded-lg flex flex-col items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="font-medium text-lg mb-2">Import Complete!</h3>
            <p className="text-center text-muted-foreground mb-4">
              All service categories have been successfully imported.
            </p>
            <div className="flex gap-4">
              <Button onClick={resetImport} variant="outline">Import Another File</Button>
              <Button onClick={() => onImportComplete()} variant="default">View Categories</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Service Categories</CardTitle>
        <CardDescription>
          Import service categories from an Excel file or use the default service hierarchy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {renderStep()}
      </CardContent>
    </Card>
  );
};
