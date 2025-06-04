
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { useServiceStagedImport } from '@/hooks/useServiceStagedImport';
import { ServiceImportPreview } from './ServiceImportPreview';
import { ServiceDuplicateResolver } from './ServiceDuplicateResolver';

interface ServiceStagedImportProps {
  existingCategories: ServiceMainCategory[];
  onImportComplete: (data: any) => Promise<void>;
}

const ServiceStagedImport: React.FC<ServiceStagedImportProps> = ({
  existingCategories,
  onImportComplete
}) => {
  const {
    state,
    handleFileUpload,
    handleDuplicateAction,
    startImport,
    reset
  } = useServiceStagedImport(existingCategories, onImportComplete);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const renderUploadStep = () => (
    <div className="text-center py-8">
      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Upload Service Data</h3>
      <p className="text-gray-600 mb-4">
        Select an Excel file containing your service categories, subcategories, and jobs
      </p>
      <div className="mb-4 text-sm text-gray-500">
        <p>Expected columns: Category, Subcategory, Service/Job, Description, Estimated Time, Price</p>
      </div>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button asChild className="gap-2">
          <span>
            <FileSpreadsheet className="h-4 w-4" />
            Choose Excel File
          </span>
        </Button>
      </label>
    </div>
  );

  const renderPreviewStep = () => {
    if (!state.previewData) return null;

    return (
      <ServiceImportPreview
        previewData={state.previewData}
        onBack={() => reset()}
        onProceed={() => {
          if (state.previewData?.duplicates.length) {
            // Already in resolve step, just start import
            startImport();
          } else {
            startImport();
          }
        }}
      />
    );
  };

  const renderResolveStep = () => {
    if (!state.previewData?.duplicates.length) return null;

    return (
      <ServiceDuplicateResolver
        duplicates={state.previewData.duplicates}
        resolutions={state.selectedDuplicateActions}
        onUpdateResolution={handleDuplicateAction}
        onBack={() => reset()}
        onProceed={startImport}
      />
    );
  };

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <div className="mb-4">
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Database className="h-8 w-8 text-blue-600 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Processing Import</h3>
        <p className="text-gray-600">
          Importing your service data to the database...
        </p>
      </div>
      <div className="max-w-md mx-auto">
        <Progress value={state.progress} className="mb-2" />
        <p className="text-sm text-gray-500">{state.progress}% complete</p>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center py-8">
      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Import Complete!</h3>
      
      {state.importResult && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg text-left">
          <h4 className="font-medium text-green-800 mb-2">Import Summary:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✅ {state.importResult.categoriesCreated} categories created</li>
            <li>✅ {state.importResult.subcategoriesCreated} subcategories created</li>
            <li>✅ {state.importResult.jobsCreated} jobs created</li>
          </ul>
          
          {state.importResult.errors.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm font-medium text-yellow-800">Warnings:</p>
              <ul className="text-xs text-yellow-700 mt-1">
                {state.importResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      <p className="text-gray-600 mb-4">
        Your service data has been successfully imported and is now available in the system
      </p>
      <Button onClick={reset} variant="outline">
        Import Another File
      </Button>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
      <h3 className="text-lg font-semibold mb-2">Import Error</h3>
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">{state.error}</p>
      </div>
      <Button onClick={reset} variant="outline">
        Try Again
      </Button>
    </div>
  );

  const getStepContent = () => {
    if (state.error) return renderErrorState();
    
    switch (state.step) {
      case 'upload':
        return renderUploadStep();
      case 'preview':
        return renderPreviewStep();
      case 'resolve':
        return renderResolveStep();
      case 'processing':
        return renderProcessingStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderUploadStep();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Staged Service Import
        </CardTitle>
      </CardHeader>
      <CardContent>
        {getStepContent()}
      </CardContent>
    </Card>
  );
};

export default ServiceStagedImport;
