
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { useServiceStagedImport } from '@/hooks/useServiceStagedImport';
import { ServiceImportPreview } from './ServiceImportPreview';
import { ServiceDuplicateResolver } from './ServiceDuplicateResolver';
import { ServiceBatchManager } from './ServiceBatchManager';

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
        Select an Excel file containing your service categories and jobs
      </p>
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
        onProceed={() => state.previewData?.duplicates.length ? 
          ({ ...state, step: 'resolve' }) : startImport()}
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
        onBack={() => ({ ...state, step: 'preview' })}
        onProceed={startImport}
      />
    );
  };

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <div className="mb-4">
        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <FileSpreadsheet className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Processing Import</h3>
        <p className="text-gray-600">
          Importing your service data in batches...
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
      <h3 className="text-lg font-semibold mb-2">Import Complete</h3>
      <p className="text-gray-600 mb-4">
        Your service data has been successfully imported
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
      <p className="text-red-600 mb-4">{state.error}</p>
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
