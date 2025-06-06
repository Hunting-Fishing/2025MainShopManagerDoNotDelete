
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ServiceImportProgress } from './ServiceImportProgress';
import { Upload, FileText, AlertCircle, FolderOpen } from 'lucide-react';
import { importFromLocalFiles } from '@/lib/services/folderBasedImportService';
import { useServiceSectors } from '@/hooks/useServiceCategories';

export const FolderBasedImportManager: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const { sectors, loading } = useServiceSectors();

  const totalSectors = sectors.length;
  const totalCategories = sectors.reduce((acc, sector) => acc + sector.categories.length, 0);
  const totalSubcategories = sectors.reduce((acc, sector) => 
    acc + sector.categories.reduce((catAcc, category) => 
      catAcc + category.subcategories.length, 0), 0);
  const totalServices = sectors.reduce((acc, sector) => 
    acc + sector.categories.reduce((catAcc, category) => 
      catAcc + category.subcategories.reduce((subAcc, subcategory) => 
        subAcc + subcategory.jobs.length, 0), 0), 0);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      setError(null);
      setCompleted(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Please select files to import');
      return;
    }

    setIsImporting(true);
    setError(null);
    setCompleted(false);
    setProgress(0);
    setStage('Starting');
    setMessage('Preparing to import service data...');

    try {
      console.log(`Starting import of ${selectedFiles.length} files`);
      
      await importFromLocalFiles(selectedFiles, (progressUpdate) => {
        setProgress(progressUpdate.progress);
        setStage(progressUpdate.stage);
        setMessage(progressUpdate.message);
      });

      setCompleted(true);
      setStage('Completed');
      setMessage('Import completed successfully!');
    } catch (err) {
      console.error('Import failed:', err);
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setIsImporting(false);
    setProgress(0);
    setStage('');
    setMessage('');
    setError('Import cancelled');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FolderOpen className="h-5 w-5 mr-2" />
            Folder-Based Service Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{loading ? '...' : totalSectors}</div>
              <div className="text-sm text-gray-600">Sectors</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{loading ? '...' : totalCategories}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{loading ? '...' : totalSubcategories}</div>
              <div className="text-sm text-gray-600">Subcategories</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{loading ? '...' : totalServices}</div>
              <div className="text-sm text-gray-600">Services</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel or CSV Files
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isImporting}
              />
              {selectedFiles && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {selectedFiles.length} file(s) selected:
                  </p>
                  <ul className="mt-1 text-xs text-gray-500">
                    {Array.from(selectedFiles).map((file, index) => (
                      <li key={index} className="flex items-center">
                        <FileText className="h-3 w-3 mr-1" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Import Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload Excel (.xlsx, .xls) or CSV files containing service data</li>
                <li>• Each sheet/file should contain a service category with jobs</li>
                <li>• Files can contain multiple categories and unlimited jobs per subcategory</li>
                <li>• The system will automatically organize the data into sectors, categories, subcategories, and jobs</li>
              </ul>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Import will be added to existing service data. Use Settings → Clear Database to remove existing data first if needed.
              </AlertDescription>
            </Alert>

            <ServiceImportProgress
              isImporting={isImporting}
              progress={progress}
              stage={stage}
              message={message}
              onCancel={handleCancel}
              error={error}
              completed={completed}
            />

            <Button
              onClick={handleImport}
              disabled={isImporting || !selectedFiles || selectedFiles.length === 0}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import from Files'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
