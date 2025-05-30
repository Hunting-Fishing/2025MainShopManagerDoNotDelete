
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Copy, Bug, AlertTriangle, Info } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { toast } from 'sonner';

interface ServiceDebugInfoProps {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  error?: string | null;
}

export const ServiceDebugInfo: React.FC<ServiceDebugInfoProps> = ({
  categories,
  isLoading,
  error
}) => {
  const debugInfo = React.useMemo(() => {
    const totalJobs = categories.reduce((total, cat) => 
      total + cat.subcategories.reduce((subTotal, sub) => subTotal + sub.jobs.length, 0), 0
    );
    
    const totalSubcategories = categories.reduce((total, cat) => total + cat.subcategories.length, 0);
    
    const jobsWithPrices = categories.reduce((total, cat) => 
      total + cat.subcategories.reduce((subTotal, sub) => 
        subTotal + sub.jobs.filter(job => job.price !== null && job.price !== undefined).length, 0
      ), 0
    );
    
    const jobsWithTime = categories.reduce((total, cat) => 
      total + cat.subcategories.reduce((subTotal, sub) => 
        subTotal + sub.jobs.filter(job => job.estimatedTime !== null && job.estimatedTime !== undefined).length, 0
      ), 0
    );

    const categoriesWithoutSubcategories = categories.filter(cat => cat.subcategories.length === 0);
    const subcategoriesWithoutJobs = categories.flatMap(cat => 
      cat.subcategories.filter(sub => sub.jobs.length === 0)
    );

    return {
      totalCategories: categories.length,
      totalSubcategories,
      totalJobs,
      jobsWithPrices,
      jobsWithTime,
      categoriesWithoutSubcategories,
      subcategoriesWithoutJobs,
      dataStructureValid: categories.every(cat => cat.id && cat.name && Array.isArray(cat.subcategories))
    };
  }, [categories]);

  const copyDebugInfo = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      debugInfo,
      isLoading,
      error,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        subcategoriesCount: cat.subcategories.length,
        jobsCount: cat.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)
      }))
    };

    navigator.clipboard.writeText(JSON.stringify(debugData, null, 2))
      .then(() => toast.success('Debug info copied to clipboard'))
      .catch(() => toast.error('Failed to copy debug info'));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{debugInfo.totalCategories}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{debugInfo.totalSubcategories}</div>
              <div className="text-sm text-gray-600">Subcategories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{debugInfo.totalJobs}</div>
              <div className="text-sm text-gray-600">Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {debugInfo.totalJobs > 0 ? Math.round((debugInfo.jobsWithPrices / debugInfo.totalJobs) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-600">Jobs with Prices</div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={isLoading ? "secondary" : "outline"}>
              {isLoading ? "Loading..." : "Loaded"}
            </Badge>
            <Badge variant={debugInfo.dataStructureValid ? "success" : "destructive"}>
              {debugInfo.dataStructureValid ? "Valid Structure" : "Invalid Structure"}
            </Badge>
            <Badge variant={error ? "destructive" : "success"}>
              {error ? "Has Errors" : "No Errors"}
            </Badge>
          </div>

          {/* Warnings */}
          {debugInfo.categoriesWithoutSubcategories.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {debugInfo.categoriesWithoutSubcategories.length} categories have no subcategories: {
                  debugInfo.categoriesWithoutSubcategories.map(cat => cat.name).join(', ')
                }
              </AlertDescription>
            </Alert>
          )}

          {debugInfo.subcategoriesWithoutJobs.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {debugInfo.subcategoriesWithoutJobs.length} subcategories have no jobs
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error: {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Copy Debug Info */}
          <Button onClick={copyDebugInfo} variant="outline" className="gap-2">
            <Copy className="h-4 w-4" />
            Copy Debug Info
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
