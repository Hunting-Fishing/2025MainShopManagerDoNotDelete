import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Search, Database, FileText, Trash2, Download } from 'lucide-react';
import { ServiceImportProgress } from './ServiceImportProgress';
import { StorageFileBrowser } from './StorageFileBrowser';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { supabase } from '@/integrations/supabase/client';
import { importFromStorage } from '@/lib/services/storageImportService';
import { batchImportServices } from '@/lib/services/batchServiceImporter';
import { toast } from '@/components/ui/use-toast';

interface ServiceSector {
  id: string;
  name: string;
  categories: ServiceMainCategory[];
}

interface ServiceMainCategory {
  id: string;
  name: string;
  subcategories: ServiceSubcategory[];
}

interface ServiceSubcategory {
  id: string;
  name: string;
  jobs: ServiceJob[];
}

interface ServiceJob {
  id: string;
  name: string;
  description: string;
}

interface ImportProgress {
  stage: string;
  progress: number;
  message: string;
}

export const ServiceHierarchyBrowser: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    stage: '',
    progress: 0,
    message: ''
  });
  const [importError, setImportError] = useState<string | null>(null);
  const [importCompleted, setImportCompleted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isStorageBrowserOpen, setIsStorageBrowserOpen] = useState(false);
  const { sectors, loading, error, refetch } = useServiceSectors();

  const filteredSectors = sectors.map(sector => ({
    ...sector,
    categories: sector.categories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        jobs: subcategory.jobs.filter(job =>
          job.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(subcategory => subcategory.jobs.length > 0)
    })).filter(category => category.subcategories.length > 0)
  })).filter(sector => sector.categories.length > 0);

  const handleFileSelect = (file: string) => {
    setSelectedFile(file);
    setIsStorageBrowserOpen(false);
  };

  const handleImportServices = async () => {
    if (!selectedFile) {
      alert('No file selected for import.');
      return;
    }

    setIsImporting(true);
    setImportCompleted(false);
    setImportError(null);

    try {
      const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET_SERVICES || 'services';

      const excelData = await importFromStorage(bucketName, selectedFile, (progress: ImportProgress) => {
        setImportProgress(progress);
      });

      if (!excelData || excelData.length === 0) {
        throw new Error('No data found in the Excel file.');
      }

      await batchImportServices(excelData);

      setImportProgress({
        stage: 'complete',
        progress: 100,
        message: 'Service import completed successfully!'
      });
      setImportCompleted(true);
      toast({
        title: "Service Import Complete",
        description: "Services have been successfully imported.",
      });
      refetch();

    } catch (err) {
      const error = err as Error;
      console.error('Service import error:', error.message);
      setImportError(error.message || 'An error occurred during service import.');
      toast({
        title: "Service Import Failed",
        description: error.message || 'An error occurred during service import.',
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancelImport = () => {
    setIsImporting(false);
    setSelectedFile(null);
    setImportProgress({ stage: '', progress: 0, message: '' });
    setImportError(null);
    setImportCompleted(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy Browser</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="browse">
                <Search className="h-4 w-4 mr-2" />
                Browse
              </TabsTrigger>
              <TabsTrigger value="import">
                <Upload className="h-4 w-4 mr-2" />
                Import Services
              </TabsTrigger>
            </TabsList>
            <TabsContent value="browse" className="space-y-4">
              <Input
                type="search"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {loading ? (
                <p>Loading service hierarchy...</p>
              ) : error ? (
                <p className="text-red-500">Error: {error}</p>
              ) : (
                <div className="space-y-4">
                  {filteredSectors.map((sector) => (
                    <Card key={sector.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{sector.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {sector.categories.map((category) => (
                          <div key={category.id} className="space-y-1">
                            <h3 className="font-semibold">{category.name}</h3>
                            <div className="ml-4 space-y-1">
                              {category.subcategories.map((subcategory) => (
                                <div key={subcategory.id} className="space-y-1">
                                  <h4 className="font-medium">{subcategory.name}</h4>
                                  <div className="ml-4 flex flex-wrap gap-1">
                                    {subcategory.jobs.map((job) => (
                                      <Badge key={job.id}>{job.name}</Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="import" className="space-y-4">
              <ServiceImportProgress
                isImporting={isImporting}
                progress={importProgress.progress}
                stage={importProgress.stage}
                message={importProgress.message}
                onCancel={handleCancelImport}
                error={importError}
                completed={importCompleted}
              />
              {!isImporting && !importCompleted && !importError && (
                <>
                  <Button onClick={() => setIsStorageBrowserOpen(true)}>
                    <Database className="h-4 w-4 mr-2" />
                    Select File from Storage
                  </Button>
                  {selectedFile && <p>Selected File: {selectedFile}</p>}
                  {selectedFile && (
                    <Button onClick={handleImportServices} disabled={isImporting}>
                      <FileText className="h-4 w-4 mr-2" />
                      Start Import
                    </Button>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <StorageFileBrowser
        isOpen={isStorageBrowserOpen}
        onClose={() => setIsStorageBrowserOpen(false)}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
};
