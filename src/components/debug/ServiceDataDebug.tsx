
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchServiceCategories } from '@/lib/services/serviceApi';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { getCategoryColor } from '@/utils/categoryColors';
import { RefreshCw, Database, Palette, List } from 'lucide-react';

export function ServiceDataDebug() {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Debug: Fetching service categories...');
      
      const data = await fetchServiceCategories();
      setCategories(data);
      setLastRefresh(new Date());
      
      console.log('✅ Debug: Service data loaded successfully');
    } catch (err) {
      console.error('❌ Debug: Error loading service data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalSubcategories = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
  const totalJobs = categories.reduce((sum, cat) => 
    sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Data Debug</h1>
          <p className="text-gray-600">Debug information for service hierarchy data</p>
        </div>
        <Button onClick={loadData} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Subcategories</p>
                <p className="text-2xl font-bold">{totalSubcategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{totalJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Last Refresh</p>
              <p className="text-sm font-medium">
                {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Never'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading service data...</p>
          </CardContent>
        </Card>
      )}

      {/* Service Categories with Colors */}
      {!loading && categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Service Categories with Color Coordination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((category) => {
                const colorClasses = getCategoryColor(category.name);
                
                return (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={`${colorClasses} font-medium`}>
                        {category.name}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {category.subcategories.length} subcategories, {' '}
                        {category.subcategories.reduce((sum, sub) => sum + sub.jobs.length, 0)} jobs
                      </span>
                    </div>
                    
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="border border-gray-100 rounded-md p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{subcategory.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {subcategory.jobs.length} jobs
                            </Badge>
                          </div>
                          
                          {subcategory.jobs.length > 0 && (
                            <div className="space-y-1">
                              {subcategory.jobs.slice(0, 3).map((job) => (
                                <div key={job.id} className="text-xs text-gray-600 flex items-center justify-between">
                                  <span className="truncate">{job.name}</span>
                                  <div className="flex gap-1 ml-2">
                                    {job.estimatedTime && (
                                      <Badge variant="outline" className="text-xs px-1 py-0">
                                        {job.estimatedTime}m
                                      </Badge>
                                    )}
                                    {job.price && (
                                      <Badge variant="outline" className="text-xs px-1 py-0">
                                        ${job.price}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                              {subcategory.jobs.length > 3 && (
                                <div className="text-xs text-gray-400">
                                  +{subcategory.jobs.length - 3} more...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && !error && (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Service Data</h3>
            <p className="text-gray-500">No service categories found in the database.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
