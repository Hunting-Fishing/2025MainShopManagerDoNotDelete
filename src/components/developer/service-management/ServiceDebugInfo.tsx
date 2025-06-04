
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Database } from 'lucide-react';

interface ServiceDebugInfoProps {
  categories: ServiceMainCategory[];
  isLoading: boolean;
  error: string | null;
}

export const ServiceDebugInfo: React.FC<ServiceDebugInfoProps> = ({
  categories,
  isLoading,
  error
}) => {
  const [debugInfo, setDebugInfo] = React.useState<any>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  const checkDatabaseDirectly = async () => {
    setIsChecking(true);
    try {
      console.log('🔍 Checking database directly...');
      
      // Check each table directly
      const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
        supabase.from('service_categories').select('*'),
        supabase.from('service_subcategories').select('*'),
        supabase.from('service_jobs').select('*')
      ]);

      const debugData = {
        categories: {
          count: categoriesResult.data?.length || 0,
          data: categoriesResult.data || [],
          error: categoriesResult.error
        },
        subcategories: {
          count: subcategoriesResult.data?.length || 0,
          data: subcategoriesResult.data || [],
          error: subcategoriesResult.error
        },
        jobs: {
          count: jobsResult.data?.length || 0,
          data: jobsResult.data || [],
          error: jobsResult.error
        }
      };

      console.log('🔍 Direct database check results:', debugData);
      setDebugInfo(debugData);
    } catch (err) {
      console.error('❌ Error checking database:', err);
      setDebugInfo({ error: err });
    } finally {
      setIsChecking(false);
    }
  };

  React.useEffect(() => {
    checkDatabaseDirectly();
  }, []);

  const totalJobs = categories.reduce((sum, cat) => 
    sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Service Data Debug Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">API Response</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Categories:</span>
                  <Badge variant={categories.length > 0 ? "default" : "destructive"}>
                    {categories.length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Subcategories:</span>
                  <Badge variant={categories.reduce((sum, cat) => sum + cat.subcategories.length, 0) > 0 ? "default" : "destructive"}>
                    {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Jobs:</span>
                  <Badge variant={totalJobs > 0 ? "default" : "destructive"}>
                    {totalJobs}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Loading:</span>
                  <Badge variant={isLoading ? "secondary" : "outline"}>
                    {isLoading ? "Yes" : "No"}
                  </Badge>
                </div>
                {error && (
                  <div className="text-red-600 text-xs mt-2">
                    Error: {error}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">Direct Database Check</h4>
                <Button 
                  onClick={checkDatabaseDirectly} 
                  disabled={isChecking}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {debugInfo && (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>DB Categories:</span>
                    <Badge variant={debugInfo.categories?.count > 0 ? "default" : "destructive"}>
                      {debugInfo.categories?.count || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>DB Subcategories:</span>
                    <Badge variant={debugInfo.subcategories?.count > 0 ? "default" : "destructive"}>
                      {debugInfo.subcategories?.count || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>DB Jobs:</span>
                    <Badge variant={debugInfo.jobs?.count > 0 ? "default" : "destructive"}>
                      {debugInfo.jobs?.count || 0}
                    </Badge>
                  </div>
                  {(debugInfo.categories?.error || debugInfo.subcategories?.error || debugInfo.jobs?.error) && (
                    <div className="text-red-600 text-xs mt-2">
                      DB Errors detected - check console
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {debugInfo && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Sample Data</h4>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <h5 className="font-medium">Categories (first 3):</h5>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-20">
                    {JSON.stringify(debugInfo.categories?.data?.slice(0, 3), null, 1)}
                  </pre>
                </div>
                <div>
                  <h5 className="font-medium">Subcategories (first 3):</h5>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-20">
                    {JSON.stringify(debugInfo.subcategories?.data?.slice(0, 3), null, 1)}
                  </pre>
                </div>
                <div>
                  <h5 className="font-medium">Jobs (first 3):</h5>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-20">
                    {JSON.stringify(debugInfo.jobs?.data?.slice(0, 3), null, 1)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {categories.length === 0 && !isLoading && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">No Service Data Found</h4>
            <p className="text-yellow-700 text-sm mb-3">
              The service database appears to be empty. This could mean:
            </p>
            <ul className="text-yellow-700 text-sm space-y-1 ml-4 list-disc">
              <li>The Excel upload didn't complete successfully</li>
              <li>The data wasn't saved to the database</li>
              <li>There's a formatting issue with the uploaded file</li>
              <li>The import process encountered an error</li>
            </ul>
            <p className="text-yellow-700 text-sm mt-3">
              Try uploading your Excel file again through the Import/Export tab.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
