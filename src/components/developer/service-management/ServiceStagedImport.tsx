
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { useServiceStagedImport } from '@/hooks/useServiceStagedImport';
import { ServiceImportPreview } from './ServiceImportPreview';
import { parseExcelFile, validateExcelStructure } from '@/lib/services/excelParser';

interface ServiceStagedImportProps {
  existingCategories: ServiceMainCategory[];
  onImportComplete: (data: any) => Promise<void>;
}

const ServiceStagedImport: React.FC<ServiceStagedImportProps> = ({
  existingCategories,
  onImportComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [parsePreview, setParsePreview] = useState<{
    totalWorksheets: number;
    sampleData: { worksheet: string; subcategories: string[]; jobCount: number }[];
  } | null>(null);

  const {
    previewData,
    importProgress,
    isImporting,
    error,
    generatePreview,
    executeImport,
    reset
  } = useServiceStagedImport(existingCategories);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationStatus('validating');
    setParsePreview(null);

    try {
      // Validate file structure
      const isValid = await validateExcelStructure(file);
      
      if (!isValid) {
        setValidationStatus('invalid');
        return;
      }

      // Generate parse preview
      const parsed = await parseExcelFile(file);
      const sampleData = parsed.categories.slice(0, 5).map(cat => ({
        worksheet: cat.name,
        subcategories: cat.subcategories?.slice(0, 3).map(sub => sub.name) || [],
        jobCount: cat.subcategories?.reduce((sum, sub) => sum + (sub.jobs?.length || 0), 0) || 0
      }));

      setParsePreview({
        totalWorksheets: parsed.categories.length,
        sampleData
      });
      setValidationStatus('valid');
      
    } catch (error) {
      console.error('File validation failed:', error);
      setValidationStatus('invalid');
    }
  };

  const handleGeneratePreview = async () => {
    if (!selectedFile) return;
    await generatePreview(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setValidationStatus('idle');
    setParsePreview(null);
    reset();
  };

  if (previewData) {
    return (
      <ServiceImportPreview
        previewData={previewData}
        onBack={handleReset}
        onProceed={executeImport}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Excel File
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              <strong>Expected Excel Format:</strong>
              <ul className="mt-2 space-y-1">
                <li>• Each <strong>worksheet</strong> represents a service category</li>
                <li>• <strong>Row 1</strong> contains subcategory names</li>
                <li>• <strong>Rows 2+</strong> contain service jobs under each subcategory</li>
                <li>• Jobs are mapped to subcategories by column position</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />

            {validationStatus === 'validating' && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Validating file structure...</span>
              </div>
            )}

            {validationStatus === 'invalid' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Invalid file format. Please ensure your Excel file has the correct structure with worksheets containing subcategories in row 1 and jobs in subsequent rows.
                </AlertDescription>
              </Alert>
            )}

            {validationStatus === 'valid' && parsePreview && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>File validated successfully!</strong></p>
                    <p>Found {parsePreview.totalWorksheets} worksheets (categories)</p>
                    
                    {parsePreview.sampleData.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium">Sample worksheets:</p>
                        <div className="space-y-1 text-sm">
                          {parsePreview.sampleData.map((sample, idx) => (
                            <div key={idx} className="ml-2">
                              <strong>{sample.worksheet}</strong>: {sample.jobCount} jobs across subcategories like {sample.subcategories.join(', ')}
                            </div>
                          ))}
                          {parsePreview.totalWorksheets > 5 && (
                            <div className="ml-2 text-gray-600">
                              ...and {parsePreview.totalWorksheets - 5} more worksheets
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing services...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleGeneratePreview}
              disabled={!selectedFile || validationStatus !== 'valid' || isImporting}
              className="flex-1"
            >
              Generate Import Preview
            </Button>
            {selectedFile && (
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceStagedImport;
