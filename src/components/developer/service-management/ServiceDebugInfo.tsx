
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const ServiceDebugInfo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDebugData = async () => {
    setIsLoading(true);
    try {
      // Get raw table data
      const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
        supabase.from('service_categories').select('*').order('created_at', { ascending: false }),
        supabase.from('service_subcategories').select('*').order('created_at', { ascending: false }),
        supabase.from('service_jobs').select('*').order('created_at', { ascending: false })
      ]);

      setDebugData({
        categories: categoriesResult.data || [],
        subcategories: subcategoriesResult.data || [],
        jobs: jobsResult.data || [],
        errors: {
          categories: categoriesResult.error,
          subcategories: subcategoriesResult.error,
          jobs: jobsResult.error
        }
      });
    } catch (error) {
      console.error('Error fetching debug data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-800">Debug Database Contents</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsVisible(true);
                fetchDebugData();
              }}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Eye className="h-4 w-4 mr-2" />
              Show Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Database className="h-5 w-5" />
            Database Debug Information
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDebugData}
              disabled={isLoading}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Hide
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-orange-600">Loading debug data...</div>
        ) : debugData ? (
          <div className="space-y-4">
            {/* Categories */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-orange-800">Service Categories</h4>
                <Badge variant="outline" className="bg-white border-orange-300 text-orange-700">
                  {debugData.categories.length} found
                </Badge>
              </div>
              {debugData.errors.categories ? (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  Error: {debugData.errors.categories.message}
                </div>
              ) : debugData.categories.length > 0 ? (
                <div className="bg-white p-3 rounded border border-orange-200 max-h-32 overflow-y-auto">
                  {debugData.categories.slice(0, 5).map((cat: any) => (
                    <div key={cat.id} className="text-sm py-1">
                      <strong>{cat.name}</strong> (ID: {cat.id})
                      {cat.description && <span className="text-gray-600"> - {cat.description}</span>}
                    </div>
                  ))}
                  {debugData.categories.length > 5 && (
                    <div className="text-sm text-gray-500 italic">
                      ... and {debugData.categories.length - 5} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-orange-600 text-sm">No categories found in database</div>
              )}
            </div>

            {/* Subcategories */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-orange-800">Service Subcategories</h4>
                <Badge variant="outline" className="bg-white border-orange-300 text-orange-700">
                  {debugData.subcategories.length} found
                </Badge>
              </div>
              {debugData.errors.subcategories ? (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  Error: {debugData.errors.subcategories.message}
                </div>
              ) : debugData.subcategories.length > 0 ? (
                <div className="bg-white p-3 rounded border border-orange-200 max-h-32 overflow-y-auto">
                  {debugData.subcategories.slice(0, 5).map((sub: any) => (
                    <div key={sub.id} className="text-sm py-1">
                      <strong>{sub.name}</strong> (Category: {sub.category_id})
                    </div>
                  ))}
                  {debugData.subcategories.length > 5 && (
                    <div className="text-sm text-gray-500 italic">
                      ... and {debugData.subcategories.length - 5} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-orange-600 text-sm">No subcategories found in database</div>
              )}
            </div>

            {/* Jobs */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-orange-800">Service Jobs</h4>
                <Badge variant="outline" className="bg-white border-orange-300 text-orange-700">
                  {debugData.jobs.length} found
                </Badge>
              </div>
              {debugData.errors.jobs ? (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                  Error: {debugData.errors.jobs.message}
                </div>
              ) : debugData.jobs.length > 0 ? (
                <div className="bg-white p-3 rounded border border-orange-200 max-h-32 overflow-y-auto">
                  {debugData.jobs.slice(0, 5).map((job: any) => (
                    <div key={job.id} className="text-sm py-1">
                      <strong>{job.name}</strong> (Subcategory: {job.subcategory_id})
                      {job.price && <span className="text-green-600"> - ${job.price}</span>}
                    </div>
                  ))}
                  {debugData.jobs.length > 5 && (
                    <div className="text-sm text-gray-500 italic">
                      ... and {debugData.jobs.length - 5} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-orange-600 text-sm">No jobs found in database</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-orange-600">Click Refresh to load debug data</div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceDebugInfo;
