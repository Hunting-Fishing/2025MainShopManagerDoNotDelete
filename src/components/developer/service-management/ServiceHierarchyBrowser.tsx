
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TreePine, Loader2, Building, Table } from 'lucide-react';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { useExcelServiceData } from '@/hooks/useExcelServiceData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServiceSectorsList } from './ServiceSectorsList';
import { ServiceHierarchyExcelView } from './ServiceHierarchyExcelView';
import { RealDataExcelTable } from './excel/RealDataExcelTable';
import { ExcelImportDialog } from './ExcelImportDialog';
import { ServiceSector } from '@/types/serviceHierarchy';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SectorSectionProps {
  sector: ServiceSector;
}

const SectorSection: React.FC<SectorSectionProps> = ({ sector }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border rounded-md shadow-sm">
      <div
        className="flex items-center justify-between p-3 cursor-pointer bg-gray-50 hover:bg-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          <h3 className="text-lg font-semibold">{sector.name}</h3>
        </div>
        <span className="text-sm text-gray-500">{sector.categories.length} Categories</span>
      </div>
      {isOpen && (
        <div className="p-4">
          {sector.categories.map((category) => (
            <div key={category.id} className="mb-4">
              <h4 className="font-medium text-lg mb-2">{category.name}</h4>
              {category.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="ml-4 mb-2">
                  <h5 className="font-medium text-base">{subcategory.name}</h5>
                  <div className="ml-4">
                    {subcategory.jobs.map((job) => (
                      <div key={job.id} className="text-sm text-gray-600 py-1">
                        {job.name} - ${job.price} ({job.estimatedTime}min)
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export function ServiceHierarchyBrowser() {
  const { sectors, loading, error, refetch } = useServiceSectors();
  const { 
    excelData, 
    hasData, 
    handleImportComplete, 
    updateService, 
    convertToSectorFormat 
  } = useExcelServiceData();
  const [view, setView] = useState<'tree' | 'excel'>('tree');

  const handleSave = async (data: any) => {
    console.log('Saving data:', data);
    await refetch();
  };

  // Use Excel data if available, otherwise fall back to database data
  const displaySectors = hasData ? convertToSectorFormat() : sectors;
  const isLoading = loading && !hasData;
  const displayError = error && !hasData;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (displayError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Error loading services: {displayError}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ServiceSectorsList />
      
      <Card className="h-[800px] flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Service Hierarchy Browser</CardTitle>
            <div className="flex items-center space-x-3">
              <ExcelImportDialog onImportComplete={handleImportComplete} />
              <Tabs value={view} onValueChange={(value: any) => setView(value)} className="w-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tree" className="flex items-center space-x-2">
                    <TreePine className="h-4 w-4" />
                    <span>Tree View</span>
                  </TabsTrigger>
                  <TabsTrigger value="excel" className="flex items-center space-x-2">
                    <Table className="h-4 w-4" />
                    <span>Excel Table</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-0">
          {view === 'tree' ? (
            <div className="p-6 h-full overflow-auto">
              {displaySectors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No service hierarchy found</p>
                  <p className="text-sm">Import Excel data to populate the hierarchy</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {displaySectors.map((sector) => (
                    <SectorSection key={sector.id} sector={sector} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full">
              {hasData ? (
                <Tabs defaultValue={excelData[0]?.sheetName} className="h-full flex flex-col">
                  <TabsList className="grid w-full bg-gray-50 border-b border-gray-200 rounded-none p-0 h-auto">
                    {excelData.map((sheet) => (
                      <TabsTrigger
                        key={sheet.sheetName}
                        value={sheet.sheetName}
                        className="px-6 py-3 border-r border-gray-200 last:border-r-0 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-sm font-medium"
                      >
                        {sheet.sheetName} ({sheet.services.length})
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {excelData.map((sheet) => (
                    <TabsContent
                      key={sheet.sheetName}
                      value={sheet.sheetName}
                      className="flex-1 mt-0 overflow-hidden"
                    >
                      <RealDataExcelTable
                        data={sheet.services}
                        sectorName={sheet.sheetName}
                        onServiceUpdate={(serviceId, updates) => updateService(sheet.sheetName, serviceId, updates)}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <ServiceHierarchyExcelView sectors={displaySectors} onSave={handleSave} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
