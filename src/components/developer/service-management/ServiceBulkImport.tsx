
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { bulkImportServices } from '@/lib/services/serviceApi';
import { toast } from 'sonner';

interface ServiceBulkImportProps {
  onImportComplete: (categories: ServiceMainCategory[]) => void;
}

interface ImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errors?: string[];
}

export const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({
  onImportComplete
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // Read file content
      const fileContent = await selectedFile.text();
      let importData;

      try {
        importData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error('Invalid JSON format');
      }

      // Validate data structure
      if (!Array.isArray(importData)) {
        throw new Error('Import data must be an array of service categories');
      }

      // Call the bulk import function
      await bulkImportServices(importData);

      const result: ImportResult = {
        success: true,
        message: `Successfully imported ${importData.length} service categories`,
        importedCount: importData.length
      };

      setImportResult(result);
      toast.success(result.message);

      // Notify parent component with the imported data
      onImportComplete(importData as ServiceMainCategory[]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const result: ImportResult = {
        success: false,
        message: `Import failed: ${errorMessage}`,
        errors: [errorMessage]
      };

      setImportResult(result);
      toast.error(result.message);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Import Services
        </CardTitle>
        <CardDescription>
          Import multiple service categories, subcategories, and jobs from a JSON file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!importResult && (
          <>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Select a JSON file containing service hierarchy data
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {selectedFile && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Selected file: {selectedFile.name}
                </p>
                <p className="text-xs text-blue-700">
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
                className="flex-1"
              >
                {isImporting ? 'Importing...' : 'Import Services'}
              </Button>
              {selectedFile && (
                <Button variant="outline" onClick={resetImport}>
                  Clear
                </Button>
              )}
            </div>
          </>
        )}

        {importResult && (
          <div className={`p-4 rounded-lg ${
            importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  importResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {importResult.message}
                </p>
                {importResult.errors && importResult.errors.length > 0 && (
                  <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
                {importResult.success && importResult.importedCount && (
                  <p className="text-sm text-green-700 mt-1">
                    {importResult.importedCount} categories processed successfully
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetImport}
              className="mt-3"
            >
              Import Another File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
