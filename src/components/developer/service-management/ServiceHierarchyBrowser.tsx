
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorageFileBrowser } from './StorageFileBrowser';
import { ServiceImportProgress } from './ServiceImportProgress';
import { importFromStorage } from '@/lib/services/storageImportService';
import { BatchServiceImporter } from '@/lib/services/batchServiceImporter';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { Database, Upload, FileText, Trash2 } from 'lucide-react';

export function ServiceHierarchyBrowser() {
  const { sectors, loading: sectorsLoading, refetch } = useServiceSectors();
  const [selectedFile, setSelectedFile] = useState<string>('');
  
  // Import state
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStage, setImportStage] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importCompleted, setImportCompleted] = useState(false);
  const [batchImporter, setBatchImporter] = useState<BatchServiceImporter | null>(null);

  const totalSectors = sectors.length;
  const totalCategories = sectors.reduce((acc, sector) => acc + sector.categories.length, 0);
  const totalServices = sectors.reduce((acc, sector) => 
    acc + sector.categories.reduce((catAcc, category) => 
      catAcc + category.subcategories.reduce((subAcc, subcategory) => 
        subAcc + subcategory.jobs.length, 0), 0), 0);

  const handleImportFile = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportError(null);
    setImportCompleted(false);
    setImportProgress(0);
    setImportStage('download');
    setImportMessage('Starting import...');

    try {
      // Create batch importer with progress callback
      const importer = new BatchServiceImporter((progress) => {
        setImportProgress(progress.progress);
        setImportStage(progress.stage);
        setImportMessage(progress.message);
      });
      setBatchImporter(importer);

      // Step 1: Download and parse Excel file (0-30%)
      setImportMessage('Downloading and parsing Excel file...');
      const sheetsData = await importFromStorage('service-imports', selectedFile, (progress) => {
        setImportProgress(progress.progress);
        setImportStage(progress.stage);
        setImportMessage(progress.message);
      });

      if (sheetsData.length === 0) {
        throw new Error('No data found in the Excel file');
      }

      // Step 2: Convert sheets data to service data (30-35%)
      setImportProgress(30);
      setImportStage('convert');
      setImportMessage('Converting Excel data to service format...');
      
      const services = convertSheetsToServices(sheetsData);
      console.log(`Converted ${services.length} services from ${sheetsData.length} sheets`);

      // Step 3: Import to database using batch processor (35-100%)
      const result = await importer.importServices(services);

      if (result.success) {
        setImportCompleted(true);
        setImportMessage(`Successfully imported ${result.totalProcessed} services!`);
        
        // Refresh the service data
        await refetch();
      } else {
        throw new Error(result.errors.join(', '));
      }

    } catch (error) {
      console.error('Import failed:', error);
      setImportError(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImporting(false);
      setBatchImporter(null);
    }
  };

  const handleCancelImport = () => {
    if (batchImporter) {
      batchImporter.cancel();
      setIsImporting(false);
      setImportError('Import cancelled by user');
      setBatchImporter(null);
    }
  };

  const convertSheetsToServices = (sheetsData: any[]) => {
    const services: any[] = [];

    sheetsData.forEach(sheet => {
      const { sheetName, data } = sheet;
      
      if (data.length === 0) return;

      // Use sheet name as sector
      const sectorName = sheetName.trim();
      
      // Process each row
      data.forEach((row: any[], rowIndex: number) => {
        if (!row || row.length === 0) return;
        
        // Skip empty rows
        if (!row.some(cell => cell && cell.toString().trim())) return;

        // Try to extract service information from the row
        const [category, subcategory, jobName, description, estimatedTime, price] = row.map(cell => 
          cell ? cell.toString().trim() : ''
        );

        if (!category || !subcategory || !jobName) return;

        services.push({
          sectorName,
          categoryName: category,
          subcategoryName: subcategory,
          jobName,
          description: description || '',
          estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
          price: price ? parseFloat(price) : undefined
        });
      });
    });

    console.log(`Converted ${services.length} services from sheets data`);
    return services;
  };

  const handleClearAllData = async () => {
    if (!confirm('Are you sure you want to clear ALL service data? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.rpc('clear_service_data');
      if (error) throw error;
      
      await refetch();
      console.log('All service data cleared successfully');
    } catch (error) {
      console.error('Failed to clear service data:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Sectors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sectorsLoading ? '...' : totalSectors}</p>
            <p className="text-sm text-muted-foreground">Service sectors</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sectorsLoading ? '...' : totalCategories}</p>
            <p className="text-sm text-muted-foreground">Total categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sectorsLoading ? '...' : totalServices}</p>
            <p className="text-sm text-muted-foreground">Total services</p>
          </CardContent>
        </Card>
      </div>

      {/* Import Progress */}
      <ServiceImportProgress
        isImporting={isImporting}
        progress={importProgress}
        stage={importStage}
        message={importMessage}
        onCancel={handleCancelImport}
        error={importError}
        completed={importCompleted}
      />

      {/* Main Content */}
      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import">Import Services</TabsTrigger>
          <TabsTrigger value="browse">Browse Hierarchy</TabsTrigger>
          <TabsTrigger value="manage">Manage Data</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Services from Excel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StorageFileBrowser
                bucketName="service-imports"
                onFileSelect={setSelectedFile}
              />
              
              {selectedFile && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                  <span className="text-sm font-medium">Selected: {selectedFile}</span>
                  <Button
                    onClick={handleImportFile}
                    disabled={isImporting}
                    className="ml-4"
                  >
                    {isImporting ? 'Importing...' : 'Import Selected File'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              {sectorsLoading ? (
                <p>Loading service hierarchy...</p>
              ) : sectors.length === 0 ? (
                <p className="text-muted-foreground">No services found. Import some data to get started.</p>
              ) : (
                <div className="space-y-4">
                  {sectors.map(sector => (
                    <div key={sector.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg">{sector.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{sector.description}</p>
                      <div className="space-y-2">
                        {sector.categories.map(category => (
                          <div key={category.id} className="ml-4 border-l-2 border-gray-200 pl-4">
                            <h4 className="font-medium">{category.name}</h4>
                            <div className="space-y-1">
                              {category.subcategories.map(subcategory => (
                                <div key={subcategory.id} className="ml-4 text-sm">
                                  <span className="font-medium">{subcategory.name}</span>
                                  <span className="ml-2 text-muted-foreground">
                                    ({subcategory.jobs.length} services)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
                <p className="text-sm text-red-700 mb-4">
                  This will permanently delete all service data including sectors, categories, subcategories, and jobs.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleClearAllData}
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Service Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
