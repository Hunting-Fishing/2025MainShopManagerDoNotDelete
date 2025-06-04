
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { supabase } from '@/integrations/supabase/client';

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
  const [dbStats, setDbStats] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchDatabaseStats = async () => {
    setDbLoading(true);
    setDbError(null);
    
    try {
      console.log('🔍 Fetching database statistics...');
      
      // Get counts from each table
      const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
        supabase.from('service_categories').select('*', { count: 'exact', head: true }),
        supabase.from('service_subcategories').select('*', { count: 'exact', head: true }),
        supabase.from('service_jobs').select('*', { count: 'exact', head: true })
      ]);
      
      if (categoriesResult.error) throw categoriesResult.error;
      if (subcategoriesResult.error) throw subcategoriesResult.error;
      if (jobsResult.error) throw jobsResult.error;
      
      // Get sample data
      const [sampleCategories, sampleSubcategories, sampleJobs] = await Promise.all([
        supabase.from('service_categories').select('*').limit(3),
        supabase.from('service_subcategories').select('*').limit(3),
        supabase.from('service_jobs').select('*').limit(3)
      ]);
      
      setDbStats({
        counts: {
          categories: categoriesResult.count || 0,
          subcategories: subcategoriesResult.count || 0,
          jobs: jobsResult.count || 0
        },
        samples: {
          categories: sampleCategories.data || [],
          subcategories: sampleSubcategories.data || [],
          jobs: sampleJobs.data || []
        }
      });
      
      console.log('✅ Database stats fetched successfully');
      
    } catch (error) {
      console.error('❌ Failed to fetch database stats:', error);
      setDbError(error instanceof Error ? error.message : 'Failed to fetch database stats');
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStats();
  }, []);

  const getStatusIcon = () => {
    if (error || dbError) return <XCircle className="h-4 w-4 text-red-500" />;
    if (isLoading || dbLoading) return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusColor = () => {
    if (error || dbError) return 'destructive';
    if (isLoading || dbLoading) return 'secondary';
    return 'success';
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {getStatusIcon()}
            <Badge variant={getStatusColor()}>
              {error || dbError ? 'Error' : isLoading || dbLoading ? 'Loading' : 'Connected'}
            </Badge>
            <Button 
              onClick={fetchDatabaseStats} 
              disabled={dbLoading} 
              size="sm" 
              variant="outline"
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${dbLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {(error || dbError) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error || dbError}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Database Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {dbStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">
                    {dbStats.counts.categories}
                  </div>
                  <div className="text-sm text-blue-700">Categories in DB</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-900">
                    {dbStats.counts.subcategories}
                  </div>
                  <div className="text-sm text-green-700">Subcategories in DB</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">
                    {dbStats.counts.jobs}
                  </div>
                  <div className="text-sm text-purple-700">Jobs in DB</div>
                </div>
              </div>

              {/* Sample Data */}
              {dbStats.samples.categories.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Sample Categories from Database:</h4>
                  <div className="space-y-2">
                    {dbStats.samples.categories.map((cat: any) => (
                      <div key={cat.id} className="p-2 bg-gray-50 rounded text-sm">
                        <strong>{cat.name}</strong>
                        {cat.description && <span className="text-gray-600"> - {cat.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              {dbLoading ? 'Loading database statistics...' : 'No database statistics available'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frontend Data Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Frontend Data Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">
                {categories.length}
              </div>
              <div className="text-sm text-orange-700">Categories Loaded</div>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-900">
                {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
              </div>
              <div className="text-sm text-teal-700">Subcategories Loaded</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-900">
                {categories.reduce((sum, cat) => 
                  sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
                )}
              </div>
              <div className="text-sm text-pink-700">Jobs Loaded</div>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Loaded Categories:</h4>
              <div className="space-y-1">
                {categories.slice(0, 5).map((cat) => (
                  <div key={cat.id} className="p-2 bg-gray-50 rounded text-sm">
                    <strong>{cat.name}</strong> 
                    <span className="text-gray-600"> ({cat.subcategories.length} subcategories)</span>
                  </div>
                ))}
                {categories.length > 5 && (
                  <div className="text-sm text-gray-500">
                    ...and {categories.length - 5} more categories
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sync Status</CardTitle>
        </CardHeader>
        <CardContent>
          {dbStats && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Categories sync:</span>
                <Badge variant={dbStats.counts.categories === categories.length ? 'success' : 'secondary'}>
                  {dbStats.counts.categories === categories.length ? 'In Sync' : 'Out of Sync'}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Database: {dbStats.counts.categories}, Frontend: {categories.length}
              </div>
              
              {dbStats.counts.categories !== categories.length && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Database and frontend data are out of sync. Try refreshing the page or reimporting data.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
