
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { useServiceStagedImport } from '@/hooks/useServiceStagedImport';
import { 
  Upload, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  FileSpreadsheet,
  Download,
  Play
} from 'lucide-react';
import { ServiceImportPreview } from './ServiceImportPreview';
import { ServiceDuplicateResolver } from './ServiceDuplicateResolver';
import { ServiceBatchManager } from './ServiceBatchManager';

interface ServiceStagedImportProps {
  categories: ServiceMainCategory[];
  onImportComplete: () => void;
}

export const ServiceStagedImport: React.FC<ServiceStagedImportProps> = ({
  categories,
  onImportComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    isLoading,
    previewData,
    duplicateResolutions,
    setDuplicateResolutions,
    importBatches,
    currentStep,
    setCurrentStep,
    processFile,
    createBatches,
    importBatch,
    reset
  } = useServiceStagedImport(categories);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    try {
      await processFile(file);
    } catch (error) {
      console.error('Failed to process file:', error);
    }
  };

  const handleStartImport = () => {
    createBatches(5); // Create batches of 5 categories each
  };

  const handleComplete = () => {
    onImportComplete();
    reset();
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'upload': return <Upload className="h-4 w-4" />;
      case 'preview': return <Eye className="h-4 w-4" />;
      case 'resolve': return <AlertTriangle className="h-4 w-4" />;
      case 'batch': return <FileSpreadsheet className="h-4 w-4" />;
      case 'import': return <Play className="h-4 w-4" />;
      case 'complete': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const steps = [
    { id: 'upload', label: 'Upload File', completed: currentStep !== 'upload' },
    { id: 'preview', label: 'Preview Data', completed: ['resolve', 'batch', 'import', 'complete'].includes(currentStep) },
    { id: 'resolve', label: 'Resolve Duplicates', completed: ['batch', 'import', 'complete'].includes(currentStep) },
    { id: 'batch', label: 'Batch Import', completed: ['import', 'complete'].includes(currentStep) },
    { id: 'complete', label: 'Complete', completed: currentStep === 'complete' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Staged Service Import
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : currentStep === step.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-gray-300 text-gray-300'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  step.completed || currentStep === step.id 
                    ? 'text-gray-900' 
                    : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {currentStep === 'upload' && (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Excel File</h3>
              <p className="text-gray-600 mb-4">
                Select an Excel file containing your service data to begin the staged import process.
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button asChild disabled={isLoading}>
                  <span>
                    {isLoading ? 'Processing...' : 'Choose Excel File'}
                  </span>
                </Button>
              </label>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          )}

          {currentStep === 'preview' && previewData && (
            <ServiceImportPreview 
              previewData={previewData}
              onNext={() => setCurrentStep('resolve')}
              onBack={() => setCurrentStep('upload')}
            />
          )}

          {currentStep === 'resolve' && previewData && (
            <ServiceDuplicateResolver
              previewData={previewData}
              resolutions={duplicateResolutions}
              onResolutionsChange={setDuplicateResolutions}
              onNext={handleStartImport}
              onBack={() => setCurrentStep('preview')}
            />
          )}

          {currentStep === 'batch' && (
            <ServiceBatchManager
              batches={importBatches}
              onImportBatch={importBatch}
              onComplete={handleComplete}
            />
          )}

          {currentStep === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Import Complete!</h3>
              <p className="text-gray-600 mb-4">
                Your service data has been successfully imported.
              </p>
              <Button onClick={reset}>
                Import Another File
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
