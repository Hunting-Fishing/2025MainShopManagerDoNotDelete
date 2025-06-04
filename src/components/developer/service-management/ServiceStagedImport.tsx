
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Info, Download } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { useServiceStagedImport } from '@/hooks/useServiceStagedImport';

interface ServiceStagedImportProps {
  existingCategories: ServiceMainCategory[];
  onImportComplete?: () => void;
}

const ServiceStagedImport: React.FC<ServiceStagedImportProps> = ({
  existingCategories,
  onImportComplete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await generatePreview(file);
    }
  };

  const handleImport = async () => {
    await executeImport();
    if (onImportComplete) {
      onImportComplete();
    }
  };

  const renderFileUpload = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Import Service Data</h3>
        <p className="text-gray-600 mb-4">
          Upload an Excel file containing your service categories, subcategories, and jobs
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isGeneratingPreview}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {isGeneratingPreview ? 'Processing...' : 'Select Excel File'}
        </Button>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your Excel file should have columns: Category, Subcategory, Job Name, Description, Price, Estimated Time (minutes)
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderPreview = () => {
    if (!previewData) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Import Preview</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={isImporting}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Confirm Import'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {previewData.stats.totalCategories}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {previewData.stats.totalSubcategories}
                </div>
                <div className="text-sm text-gray-600">Subcategories</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {previewData.stats.totalJobs}
                </div>
                <div className="text-sm text-gray-600">Jobs</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {previewData.duplicates.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Potential Duplicates Found:</div>
              <div className="space-y-1">
                {previewData.duplicates.slice(0, 5).map((duplicate, index) => (
                  <div key={index} className="text-sm">• {duplicate}</div>
                ))}
                {previewData.duplicates.length > 5 && (
                  <div className="text-sm text-gray-600">
                    ...and {previewData.duplicates.length - 5} more
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sample Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previewData.parsedData.categories.slice(0, 2).map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="font-semibold mb-2">{category.name}</div>
                  {category.subcategories?.slice(0, 2).map((subcategory) => (
                    <div key={subcategory.id} className="ml-4 mb-2">
                      <div className="font-medium text-sm text-gray-700">
                        {subcategory.name}
                      </div>
                      <div className="ml-4 space-y-1">
                        {subcategory.jobs.slice(0, 3).map((job) => (
                          <div key={job.id} className="flex items-center gap-2 text-sm">
                            <span>{job.name}</span>
                            <Badge variant="secondary">${job.base_price}</Badge>
                            <Badge variant="outline">{job.estimated_duration}min</Badge>
                          </div>
                        ))}
                        {subcategory.jobs.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{subcategory.jobs.length - 3} more jobs
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(category.subcategories?.length || 0) > 2 && (
                    <div className="ml-4 text-xs text-gray-500">
                      +{(category.subcategories?.length || 0) - 2} more subcategories
                    </div>
                  )}
                </div>
              ))}
              {previewData.parsedData.categories.length > 2 && (
                <div className="text-sm text-gray-500 text-center">
                  +{previewData.parsedData.categories.length - 2} more categories
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderImportProgress = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Importing Service Data</h3>
        <p className="text-gray-600">Please wait while we import your service data...</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{importProgress}%</span>
        </div>
        <Progress value={importProgress} className="w-full" />
      </div>
      
      {importProgress === 100 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Import completed successfully! The page will refresh shortly.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Staged Service Data Import
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isImporting ? renderImportProgress() : 
         previewData ? renderPreview() : 
         renderFileUpload()}
      </CardContent>
    </Card>
  );
};

export default ServiceStagedImport;
