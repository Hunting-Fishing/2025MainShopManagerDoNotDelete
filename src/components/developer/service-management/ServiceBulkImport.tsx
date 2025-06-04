
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import ServiceStagedImport from './ServiceStagedImport';

interface ServiceBulkImportProps {
  categories: ServiceMainCategory[];
  onImport: (data: any) => Promise<void>;
  onExport: () => Promise<void>;
}

const ServiceBulkImport: React.FC<ServiceBulkImportProps> = ({
  categories,
  onImport,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState('staged');

  const handleExport = async () => {
    try {
      await onExport();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportComplete = async (data: any) => {
    try {
      await onImport(data);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Service Data Import/Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="staged">Staged Import</TabsTrigger>
              <TabsTrigger value="export">Export Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="staged" className="mt-6">
              <ServiceStagedImport 
                existingCategories={categories}
                onImportComplete={handleImportComplete}
              />
            </TabsContent>
            
            <TabsContent value="export" className="mt-6">
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Download className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Export Service Data</h3>
                  <p className="text-gray-600 mb-4">
                    Download your current service catalog as an Excel file
                  </p>
                  <Button onClick={handleExport} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export to Excel
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceBulkImport;
