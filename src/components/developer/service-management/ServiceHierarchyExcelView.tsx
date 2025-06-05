
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceSector } from '@/types/serviceHierarchy';
import { ExcelStyleTable } from './excel/ExcelStyleTable';
import { ExcelViewPagination } from './excel/ExcelViewPagination';
import { ExcelViewHeader } from './excel/ExcelViewHeader';

interface ServiceHierarchyExcelViewProps {
  sectors: ServiceSector[];
  onSave: (data: any) => void;
}

export function ServiceHierarchyExcelView({ sectors, onSave }: ServiceHierarchyExcelViewProps) {
  const [currentPage, setCurrentPage] = useState<{ [sectorId: string]: number }>({});
  const [itemsPerPage] = useState(50); // Excel-like page size
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten data for Excel-style display
  const flattenedData = useMemo(() => {
    const result: { [sectorId: string]: any[] } = {};
    
    sectors.forEach(sector => {
      const sectorData: any[] = [];
      
      sector.categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          subcategory.jobs.forEach(job => {
            sectorData.push({
              id: job.id,
              sector: sector.name,
              category: category.name,
              subcategory: subcategory.name,
              serviceName: job.name,
              description: job.description || '',
              estimatedTime: job.estimatedTime || 0,
              price: job.price || 0,
              type: 'job'
            });
          });
        });
      });
      
      result[sector.id] = sectorData;
    });
    
    return result;
  }, [sectors]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    const result: { [sectorId: string]: any[] } = {};
    
    Object.entries(flattenedData).forEach(([sectorId, data]) => {
      if (searchTerm) {
        result[sectorId] = data.filter(item =>
          item.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      } else {
        result[sectorId] = data;
      }
    });
    
    return result;
  }, [flattenedData, searchTerm]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const result: { [sectorId: string]: { data: any[], totalPages: number } } = {};
    
    Object.entries(filteredData).forEach(([sectorId, data]) => {
      const page = currentPage[sectorId] || 1;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      
      result[sectorId] = {
        data: data.slice(startIndex, endIndex),
        totalPages: Math.ceil(data.length / itemsPerPage)
      };
    });
    
    return result;
  }, [filteredData, currentPage, itemsPerPage]);

  const handlePageChange = (sectorId: string, page: number) => {
    setCurrentPage(prev => ({ ...prev, [sectorId]: page }));
  };

  const handleCellEdit = (sectorId: string, rowIndex: number, field: string, value: any) => {
    // Update the data and trigger save
    console.log('Editing:', { sectorId, rowIndex, field, value });
    // Implementation for saving changes would go here
    onSave({ sectorId, rowIndex, field, value });
  };

  if (sectors.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No service data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <ExcelViewHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalSectors={sectors.length}
      />
      
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue={sectors[0]?.id} className="h-full flex flex-col">
          <TabsList className="grid w-full bg-gray-50 border-b border-gray-200 rounded-none p-0 h-auto">
            {sectors.map((sector) => (
              <TabsTrigger
                key={sector.id}
                value={sector.id}
                className="px-6 py-3 border-r border-gray-200 last:border-r-0 rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 text-sm font-medium"
              >
                {sector.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {sectors.map((sector) => (
            <TabsContent
              key={sector.id}
              value={sector.id}
              className="flex-1 mt-0 overflow-hidden flex flex-col"
            >
              <div className="flex-1 overflow-auto">
                <ExcelStyleTable
                  data={paginatedData[sector.id]?.data || []}
                  onCellEdit={(rowIndex, field, value) => 
                    handleCellEdit(sector.id, rowIndex, field, value)
                  }
                />
              </div>
              
              {paginatedData[sector.id]?.totalPages > 1 && (
                <ExcelViewPagination
                  currentPage={currentPage[sector.id] || 1}
                  totalPages={paginatedData[sector.id]?.totalPages || 1}
                  onPageChange={(page) => handlePageChange(sector.id, page)}
                  totalItems={filteredData[sector.id]?.length || 0}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
