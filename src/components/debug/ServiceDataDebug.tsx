
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { fetchServiceCategories } from '@/lib/services/serviceApi';

export function ServiceDataDebug() {
  const [dbData, setDbData] = useState<any>(null);
  const [apiData, setApiData] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDirectFromDB = async () => {
    setLoading(true);
    try {
      // Fetch directly from database tables
      const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
        supabase.from('service_categories').select('*').order('position'),
        supabase.from('service_subcategories').select('*').order('name'),
        supabase.from('service_jobs').select('*').order('name')
      ]);

      setDbData({
        categories: categoriesResult.data || [],
        subcategories: subcategoriesResult.data || [],
        jobs: jobsResult.data || [],
        errors: {
          categories: categoriesResult.error,
          subcategories: subcategoriesResult.error,
          jobs: jobsResult.error
        }
      });

      // Also fetch via API
      const apiResult = await fetchServiceCategories();
      setApiData(apiResult);
    } catch (error) {
      console.error('Debug fetch error:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDirectFromDB();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Service Data Debug</h2>
        <Button onClick={fetchDirectFromDB} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Direct DB Data */}
        <Card>
          <CardHeader>
            <CardTitle>Direct Database Data</CardTitle>
          </CardHeader>
          <CardContent>
            {dbData && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Categories ({dbData.categories.length})</h3>
                  <ul className="text-sm space-y-1">
                    {dbData.categories.slice(0, 5).map((cat: any) => (
                      <li key={cat.id}>{cat.name} (pos: {cat.position})</li>
                    ))}
                    {dbData.categories.length > 5 && <li>... and {dbData.categories.length - 5} more</li>}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold">Subcategories ({dbData.subcategories.length})</h3>
                  <ul className="text-sm space-y-1">
                    {dbData.subcategories.slice(0, 5).map((sub: any) => (
                      <li key={sub.id}>{sub.name}</li>
                    ))}
                    {dbData.subcategories.length > 5 && <li>... and {dbData.subcategories.length - 5} more</li>}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold">Jobs ({dbData.jobs.length})</h3>
                  <ul className="text-sm space-y-1">
                    {dbData.jobs.slice(0, 5).map((job: any) => (
                      <li key={job.id}>{job.name} - ${job.price}</li>
                    ))}
                    {dbData.jobs.length > 5 && <li>... and {dbData.jobs.length - 5} more</li>}
                  </ul>
                </div>

                {/* Show any errors */}
                {(dbData.errors.categories || dbData.errors.subcategories || dbData.errors.jobs) && (
                  <div className="bg-red-50 p-3 rounded">
                    <h3 className="font-semibold text-red-800">Errors:</h3>
                    {dbData.errors.categories && <p className="text-red-600">Categories: {dbData.errors.categories.message}</p>}
                    {dbData.errors.subcategories && <p className="text-red-600">Subcategories: {dbData.errors.subcategories.message}</p>}
                    {dbData.errors.jobs && <p className="text-red-600">Jobs: {dbData.errors.jobs.message}</p>}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Data */}
        <Card>
          <CardHeader>
            <CardTitle>API Hierarchical Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Categories ({apiData.length})</h3>
                <ul className="text-sm space-y-1">
                  {apiData.slice(0, 3).map((cat) => (
                    <li key={cat.id}>
                      <strong>{cat.name}</strong> ({cat.subcategories.length} subcategories)
                      <ul className="ml-4 mt-1">
                        {cat.subcategories.slice(0, 2).map((sub) => (
                          <li key={sub.id}>
                            {sub.name} ({sub.jobs.length} jobs)
                          </li>
                        ))}
                        {cat.subcategories.length > 2 && <li>... and {cat.subcategories.length - 2} more subcategories</li>}
                      </ul>
                    </li>
                  ))}
                  {apiData.length > 3 && <li>... and {apiData.length - 3} more categories</li>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raw Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Data (First 3 items each)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Categories</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(dbData?.categories.slice(0, 3), null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Subcategories</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(dbData?.subcategories.slice(0, 3), null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Jobs</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(dbData?.jobs.slice(0, 3), null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
