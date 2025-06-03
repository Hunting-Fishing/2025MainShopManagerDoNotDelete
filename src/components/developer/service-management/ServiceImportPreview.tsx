
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, AlertTriangle, XCircle, Eye, EyeOff } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

interface PreviewData {
  newCategories: ServiceMainCategory[];
  duplicates: Array<{
    existing: ServiceMainCategory;
    imported: ServiceMainCategory;
    conflicts: string[];
  }>;
  errors: Array<{
    type: string;
    message: string;
    data?: any;
  }>;
}

interface ServiceImportPreviewProps {
  previewData: PreviewData;
  onProceed: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ServiceImportPreview({ 
  previewData, 
  onProceed, 
  onCancel, 
  isLoading = false 
}: ServiceImportPreviewProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  
  const { newCategories, duplicates, errors } = previewData;
  
  const totalServices = newCategories.reduce((total, category) => 
    total + category.subcategories.reduce((subTotal, sub) => 
      subTotal + sub.jobs.length, 0), 0);
  
  const hasErrors = errors.length > 0;
  const hasDuplicates = duplicates.length > 0;
  const canProceed = !hasErrors;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Import Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{newCategories.length}</div>
              <div className="text-sm text-green-700">New Categories</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalServices}</div>
              <div className="text-sm text-blue-700">Total Services</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{duplicates.length}</div>
              <div className="text-sm text-yellow-700">Potential Duplicates</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{errors.length}</div>
              <div className="text-sm text-red-700">Errors</div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2">
            {!hasErrors && (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Ready to Import
              </Badge>
            )}
            {hasDuplicates && (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Duplicates Detected
              </Badge>
            )}
            {hasErrors && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Errors Found
              </Badge>
            )}
          </div>

          {/* Toggle Details */}
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full"
          >
            {showDetails ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Details
              </>
            )}
          </Button>

          {/* Detailed View */}
          {showDetails && (
            <div className="space-y-4">
              {/* Errors Section */}
              {errors.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-red-600 text-lg">Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {errors.map((error, index) => (
                          <div key={index} className="p-2 bg-red-50 rounded border-l-4 border-red-500">
                            <div className="font-semibold text-red-700">{error.type}</div>
                            <div className="text-red-600">{error.message}</div>
                            {error.data && (
                              <div className="text-xs text-red-500 mt-1">
                                {JSON.stringify(error.data, null, 2)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Duplicates Section */}
              {duplicates.length > 0 && (
                <Card className="border-yellow-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-yellow-600 text-lg">Potential Duplicates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {duplicates.map((duplicate, index) => (
                          <div key={index} className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-500">
                            <div className="font-semibold text-yellow-700">
                              {duplicate.imported.name}
                            </div>
                            <div className="text-yellow-600 text-sm">
                              Conflicts: {duplicate.conflicts.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* New Categories Preview */}
              {newCategories.length > 0 && (
                <Card className="border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-green-600 text-lg">New Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="space-y-2">
                        {newCategories.map((category, index) => (
                          <div key={index} className="p-2 bg-green-50 rounded border-l-4 border-green-500">
                            <div className="font-semibold text-green-700">{category.name}</div>
                            <div className="text-green-600 text-sm">
                              {category.subcategories.length} subcategories, {' '}
                              {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} services
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={onCancel} 
              variant="outline" 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={onProceed} 
              disabled={!canProceed || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Processing...' : 'Proceed with Import'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
