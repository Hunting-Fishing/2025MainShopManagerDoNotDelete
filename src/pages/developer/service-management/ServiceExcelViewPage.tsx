
import React from 'react';
import { ServiceHierarchyExcelView } from '@/components/developer/service-management/ServiceHierarchyExcelView';
import { useServiceSectors } from '@/hooks/useServiceCategories';

export function ServiceExcelViewPage() {
  const { sectors } = useServiceSectors();
  const allCategories = sectors.flatMap(sector => sector.categories);

  const handleDownload = () => {
    console.log('Download functionality not implemented yet');
  };

  return (
    <ServiceHierarchyExcelView 
      categories={allCategories}
      onDownload={handleDownload}
    />
  );
}
