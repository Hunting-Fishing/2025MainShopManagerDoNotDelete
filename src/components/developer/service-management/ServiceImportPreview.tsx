
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { ImportPreviewData } from '@/hooks/useServiceStagedImport';

interface ServiceImportPreviewProps {
  previewData: ImportPreviewData;
  onBack: () => void;
  onProceed: () => void;
}

export const ServiceImportPreview: React.FC<ServiceImportPreviewProps> = ({
  previewData,
  onBack,
  onProceed
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {previewData.stats.totalCategories}
            </div>
            <div className="text-sm text-blue-700">Categories</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {previewData.stats.totalSubcategories}
            </div>
            <div className="text-sm text-green-700">Subcategories</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">
              {previewData.stats.totalJobs}
            </div>
            <div className="text-sm text-purple-700">Jobs</div>
          </div>
        </div>

        {previewData.duplicates.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-yellow-100">
                {previewData.duplicates.length} Duplicates Found
              </Badge>
            </div>
            <p className="text-sm text-yellow-700">
              Some items in your upload match existing data. You'll need to resolve these conflicts before importing.
            </p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Preview Summary:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• {previewData.stats.totalCategories} categories will be imported</li>
            <li>• {previewData.stats.totalSubcategories} subcategories will be created</li>
            <li>• {previewData.stats.totalJobs} service jobs will be added</li>
            {previewData.duplicates.length > 0 && (
              <li>• {previewData.duplicates.length} duplicates need resolution</li>
            )}
          </ul>
        </div>

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onProceed}>
            {previewData.duplicates.length > 0 ? 'Resolve Duplicates' : 'Import Data'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
