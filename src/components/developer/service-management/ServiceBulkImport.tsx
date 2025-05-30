
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, AlertCircle, CheckCircle, FileSpreadsheet } from "lucide-react";
import { parseExcelFile, generateExcelTemplate } from '@/lib/services/excelParser';
import { bulkImportServices } from '@/lib/services/serviceApi';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { toast } from 'sonner';

interface ServiceBulkImportProps {
  onCancel: () => void;
  onComplete: (categories: ServiceMainCategory[]) => void;
}

interface ImportProgress {
  stage: 'parsing' | 'importing' | 'complete' | 'error';
  percentage: number;
  message: string;
  details?: string;
}

export default function ServiceBulkImport({ onCancel, onComplete }: ServiceBulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({ 
    stage: 'parsing', 
    percentage: 0, 
    message: 'Ready to import' 
  });
  const [parsedData, setParsedData] = useState<any>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
        toast.error('Please select an Excel file (.xlsx)');
        return;
      }
      setFile(selectedFile);
      setParsedData(null);
      setProgress({ stage: 'parsing', percentage: 0, message: 'File selected, ready to parse' });
    }
  };

  const updateProgress = (stage: ImportProgress['stage'], percentage: number, message: string, details?: string) => {
    setProgress({ stage, percentage, message, details });
    console.log(`Import Progress: ${stage} - ${percentage}% - ${message}`, details ? `Details: ${details}` : '');
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Step 1: Parse Excel file
      updateProgress('parsing', 10, 'Reading Excel file...');
      
      const parsed = await parseExcelFile(file);
      updateProgress('parsing', 50, 'Parsing categories and services...', 
        `Found ${parsed.stats.totalCategories} categories with ${parsed.stats.totalJobs} services`);
      
      setParsedData(parsed);
      updateProgress('parsing', 100, 'File parsed successfully');
      
      // Small delay to show parsing completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 2: Import to database
      updateProgress('importing', 0, 'Starting database import...');
      
      const result = await bulkImportServices(parsed.categories, (progress) => {
        updateProgress('importing', progress, 
          `Importing services... ${progress}%`,
          `Processing categories and subcategories`);
      });

      updateProgress('complete', 100, 'Import completed successfully!', 
        `Imported ${result.length} categories successfully`);
      
      toast.success(`Successfully imported ${result.length} service categories`);
      
      // Wait a moment before completing
      setTimeout(() => {
        onComplete(result);
      }, 1500);

    } catch (error) {
      console.error('Import failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      updateProgress('error', 0, 'Import failed', errorMessage);
      toast.error(`Import failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      generateExcelTemplate();
      toast.success('Template download started');
    } catch (error) {
      console.error('Failed to generate template:', error);
      toast.error('Failed to generate template');
    }
  };

  const getProgressColor = () => {
    switch (progress.stage) {
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'importing': return 'bg-blue-500';
      default: return 'bg-blue-500';
    }
  };

  const getStageIcon = () => {
    switch (progress.stage) {
      case 'complete': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Upload className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Bulk Import Service Categories
          </CardTitle>
          <CardDescription>
            Import service categories from Excel files using the multi-sheet format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Format Requirements */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Multi-Sheet Excel Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Each sheet represents a service category (sheet name = category name)</li>
                  <li>Row 1 contains subcategory headers starting from column B</li>
                  <li>Rows 2+ contain services under each subcategory column</li>
                  <li>Services can include price and time: "Service Name | $50 | 60min"</li>
                  <li>Example: "Oil Change | $35 | 30min"</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          {/* Template Download */}
          <div className="flex justify-between items-center p-4 border rounded-lg bg-blue-50">
            <div>
              <h3 className="font-medium">Download Template</h3>
              <p className="text-sm text-gray-600">
                Get a sample Excel file that shows the exact format you described
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div>
              <label htmlFor="excel-file" className="block text-sm font-medium mb-2">
                Select Excel File (.xlsx)
              </label>
              <input
                id="excel-file"
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
            </div>

            {file && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Selected:</strong> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>

          {/* Progress Display */}
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {getStageIcon()}
                <span className="font-medium">{progress.message}</span>
              </div>
              
              <Progress 
                value={progress.percentage} 
                className="w-full h-3"
              />
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>{progress.stage.charAt(0).toUpperCase() + progress.stage.slice(1)}</span>
                <span>{progress.percentage}%</span>
              </div>
              
              {progress.details && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {progress.details}
                </p>
              )}
            </div>
          )}

          {/* Parsed Data Preview */}
          {parsedData && !isProcessing && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Parsing Results</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Categories:</span> {parsedData.stats.totalCategories}
                </div>
                <div>
                  <span className="font-medium">Subcategories:</span> {parsedData.stats.totalSubcategories}
                </div>
                <div>
                  <span className="font-medium">Jobs:</span> {parsedData.stats.totalJobs}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isProcessing || progress.stage === 'complete'}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {progress.stage === 'parsing' ? 'Parsing...' : 'Importing...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import Services
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
