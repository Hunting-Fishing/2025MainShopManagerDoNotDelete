import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceMainCategory } from '@/types/service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download, Eye, EyeOff } from 'lucide-react';

interface ServiceHierarchyExcelViewProps {
  categories: ServiceMainCategory[];
  onDownload: () => void;
}

export function ServiceHierarchyExcelView({ categories, onDownload }: ServiceHierarchyExcelViewProps) {
  const [showDescriptions, setShowDescriptions] = useState(false);

  const totalServices = categories.reduce((total, category) =>
    total + category.subcategories.reduce((subTotal, subcategory) =>
      subTotal + subcategory.jobs.length, 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Service Hierarchy (Excel View)
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download Excel
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          <Badge variant="secondary">{categories.length} Categories</Badge>
          <Badge variant="secondary">{totalServices} Services</Badge>
        </div>

        <div className="flex items-center justify-end space-x-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDescriptions(!showDescriptions)}
          >
            {showDescriptions ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Descriptions
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Descriptions
              </>
            )}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Name
                </th>
                {showDescriptions && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Time (min)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                category.subcategories.map((subcategory) => (
                  subcategory.jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {subcategory.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.name}
                      </td>
                      {showDescriptions && (
                        <td className="px-6 py-4">
                          {job.description}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.price ? `$${job.price}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.estimatedTime ? job.estimatedTime : 'N/A'}
                      </td>
                    </tr>
                  ))
                ))
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
