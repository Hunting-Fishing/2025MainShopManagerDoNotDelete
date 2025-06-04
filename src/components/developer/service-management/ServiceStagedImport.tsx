
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { useServiceStagedImport } from '@/hooks/useServiceStagedImport';
import { ServiceImportPreview } from './ServiceImportPreview';

interface ServiceStagedImportProps {
  existingCategories: ServiceMainCategory[];
  onImportComplete: (data: any) => Promise<void>;
}

const ServiceStagedImport: React.FC<ServiceStagedImportProps> = ({
  existingCategories,
  onImportComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    previewData,
    importProgress,
    isImporting,
    isGeneratingPreview,
    error,
    generatePreview,
    executeImport,
    reset
  } = useServiceStagedImport(existingCategories);

  const handleFileSelect = useCallback((file: File) => {
    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
        file.type !== 'application/vnd.ms-excel') {
      alert('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }
    setSelectedFile(file);
    generatePreview(file);
  }, [generatePreview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleImport = async () => {
    try {
      await executeImport();
      await onImportComplete(previewData?.parsedData);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleBack = () => {
    setSelectedFile(null);
    reset();
  };

  // If we have preview data, show the preview component
  if (previewData) {
    return (
      <ServiceImportPreview
        previewData={previewData}
        onBack={handleBack}
        onProceed={handleImport}
      />
    );
  }

  // If importing, show progress
  if (isImporting) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importing Service Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Import Progress</span>
              <span>{importProgress}%</span>
            </div>
            <Progress value={importProgress} className="w-full" />
          </div>
          
          {importProgress === 100 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Import completed successfully! The data has been added to your service catalog.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Service Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isGeneratingPreview ? 'Processing File...' : 'Upload Excel File'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isGeneratingPreview 
              ? 'Analyzing your service data...'
              : 'Drag & drop your Excel file here, or click to browse'
            }
          </p>
          
          {!isGeneratingPreview && (
            <div className="space-y-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button as="span" className="cursor-pointer">
                  Select File
                </Button>
              </label>
              
              {selectedFile && (
                <p className="text-sm text-gray-500">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          )}

          {isGeneratingPreview && (
            <div className="space-y-2">
              <Progress value={50} className="w-full max-w-xs mx-auto" />
              <p className="text-sm text-gray-500">Generating preview...</p>
            </div>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Excel Format Requirements:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Each worksheet represents a service category</li>
            <li>• Row 1: Subcategory names (column headers)</li>
            <li>• Rows 2+: Service job names under each subcategory</li>
            <li>• Supported formats: .xlsx, .xls</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceStagedImport;
