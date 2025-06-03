
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImportPreviewData } from '@/hooks/useServiceStagedImport';
import { 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Layers,
  Grid,
  Wrench
} from 'lucide-react';

interface ServiceImportPreviewProps {
  previewData: ImportPreviewData;
  onNext: () => void;
  onBack: () => void;
}

export const ServiceImportPreview: React.FC<ServiceImportPreviewProps> = ({
  previewData,
  onNext,
  onBack
}) => {
  const {
    categories,
    duplicateCategories,
    duplicateSubcategories,
    duplicateJobs,
    totalNewItems
  } = previewData;

  const totalDuplicates = duplicateCategories.length + duplicateSubcategories.length + duplicateJobs.length;
  const totalItems = categories.reduce((total, cat) => 
    total + 1 + cat.subcategories.reduce((subTotal, sub) => 
      subTotal + 1 + sub.jobs.length, 0
    ), 0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Layers className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalNewItems.categories}</p>
                <p className="text-sm text-gray-600">New Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Grid className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{totalNewItems.subcategories}</p>
                <p className="text-sm text-gray-600">New Subcategories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{totalNewItems.jobs}</p>
                <p className="text-sm text-gray-600">New Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {totalDuplicates > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Found {totalDuplicates} potential duplicates that will need resolution:
            <ul className="mt-2 space-y-1">
              {duplicateCategories.length > 0 && (
                <li>• {duplicateCategories.length} duplicate categories</li>
              )}
              {duplicateSubcategories.length > 0 && (
                <li>• {duplicateSubcategories.length} duplicate subcategories</li>
              )}
              {duplicateJobs.length > 0 && (
                <li>• {duplicateJobs.length} duplicate jobs</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {categories.map((category, catIndex) => (
                <div key={catIndex} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">{category.name}</h4>
                    {duplicateCategories.includes(category.name) && (
                      <Badge variant="destructive">Duplicate</Badge>
                    )}
                  </div>
                  
                  <div className="ml-4 space-y-2">
                    {category.subcategories.map((subcategory, subIndex) => (
                      <div key={subIndex} className="border-l-2 border-gray-200 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium">{subcategory.name}</h5>
                          {duplicateSubcategories.includes(subcategory.name) && (
                            <Badge variant="destructive" size="sm">Duplicate</Badge>
                          )}
                        </div>
                        
                        <div className="ml-4 text-sm text-gray-600">
                          {subcategory.jobs.slice(0, 3).map((job, jobIndex) => (
                            <div key={jobIndex} className="flex items-center justify-between">
                              <span>{job.name}</span>
                              {duplicateJobs.includes(job.name) && (
                                <Badge variant="destructive" size="sm">Duplicate</Badge>
                              )}
                            </div>
                          ))}
                          {subcategory.jobs.length > 3 && (
                            <div className="text-xs text-gray-500">
                              ... and {subcategory.jobs.length - 3} more jobs
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Upload
        </Button>
        <Button onClick={onNext}>
          {totalDuplicates > 0 ? 'Resolve Duplicates' : 'Start Import'}
        </Button>
      </div>
    </div>
  );
};
