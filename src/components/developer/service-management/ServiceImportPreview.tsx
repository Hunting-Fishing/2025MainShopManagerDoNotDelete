
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
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
  const { stats, errors, duplicates } = previewData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Import Preview</h3>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onProceed} disabled={errors.length > 0}>
            {duplicates.length > 0 ? 'Resolve Duplicates' : 'Import Data'}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCategories}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalSubcategories}</div>
            <div className="text-sm text-gray-600">Subcategories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalJobs}</div>
            <div className="text-sm text-gray-600">Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.newItems}</div>
            <div className="text-sm text-gray-600">New Items</div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings and Errors */}
      {duplicates.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Duplicates Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 mb-3">
              {duplicates.length} potential duplicate{duplicates.length !== 1 ? 's' : ''} found. 
              You'll need to decide how to handle them.
            </p>
            <div className="space-y-2">
              {duplicates.slice(0, 3).map((duplicate, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                  <span className="font-medium">{duplicate.imported.name}</span>
                  <Badge variant="secondary">Duplicate</Badge>
                </div>
              ))}
              {duplicates.length > 3 && (
                <p className="text-sm text-yellow-600">
                  And {duplicates.length - 3} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Import Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-3">
              {errors.length} error{errors.length !== 1 ? 's' : ''} must be fixed before importing.
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {errors.map((error, index) => (
                <div key={index} className="bg-white p-3 rounded border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-800">Row {error.row}</p>
                      <p className="text-sm text-red-600">{error.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {duplicates.length === 0 && errors.length === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Ready to Import</span>
            </div>
            <p className="text-green-700 mt-1">
              No issues detected. Your data is ready to be imported.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
