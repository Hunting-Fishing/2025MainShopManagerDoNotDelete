
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Database, Code, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { fetchServiceCategories } from '@/lib/services/serviceApi';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export function ServiceDataDebug() {
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [apiCategories, setApiCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('comparison');

  const fetchDirectFromDatabase = async () => {
    try {
      console.log('🔍 Fetching direct from database...');
      
      // Fetch from database directly
      const { data: categories, error: catError } = await supabase
        .from('service_categories')
        .select('*')
        .order('position', { ascending: true });

      const { data: subcategories, error: subError } = await supabase
        .from('service_subcategories')
        .select('*')
        .order('name', { ascending: true });

      const { data: jobs, error: jobsError } = await supabase
        .from('service_jobs')
        .select('*')
        .order('name', { ascending: true });

      if (catError) throw catError;
      if (subError) throw subError;
      if (jobsError) throw jobsError;

      console.log('📊 Database results:', {
        categories: categories?.length || 0,
        subcategories: subcategories?.length || 0,
        jobs: jobs?.length || 0
      });

      // Build hierarchy
      const hierarchicalData = categories?.map(category => ({
        ...category,
        subcategories: subcategories?.filter(sub => sub.category_id === category.id).map(subcategory => ({
          ...subcategory,
          jobs: jobs?.filter(job => job.subcategory_id === subcategory.id) || []
        })) || []
      })) || [];

      setDbCategories(hierarchicalData);
      return hierarchicalData;
    } catch (err) {
      console.error('❌ Database fetch error:', err);
      throw err;
    }
  };

  const fetchFromAPI = async () => {
    try {
      console.log('🌐 Fetching from API...');
      const apiData = await fetchServiceCategories();
      console.log('📊 API results:', apiData?.length || 0, 'categories');
      setApiCategories(apiData);
      return apiData;
    } catch (err) {
      console.error('❌ API fetch error:', err);
      throw err;
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await Promise.all([
        fetchDirectFromDatabase(),
        fetchFromAPI()
      ]);
    } catch (err) {
      console.error('❌ Load data error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTotalJobs = (categories: any[]) => {
    return categories.reduce((total, cat) => {
      return total + cat.subcategories.reduce((subTotal: number, sub: any) => {
        return subTotal + (sub.jobs?.length || 0);
      }, 0);
    }, 0);
  };

  const renderCategoryTree = (categories: any[], source: string) => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
            <div className="text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {categories.reduce((total, cat) => total + (cat.subcategories?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Subcategories</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{getTotalJobs(categories)}</div>
            <div className="text-sm text-gray-600">Jobs</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {categories.map((category, idx) => (
          <Card key={category.id || idx} className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-900">{category.name}</h3>
                <Badge variant="secondary">{category.subcategories?.length || 0} subcategories</Badge>
              </div>
              
              {category.subcategories?.map((sub: any, subIdx: number) => (
                <div key={sub.id || subIdx} className="ml-4 mt-2 p-2 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-green-800">{sub.name}</span>
                    <Badge variant="outline">{sub.jobs?.length || 0} jobs</Badge>
                  </div>
                  
                  {sub.jobs?.length > 0 && (
                    <div className="ml-4 space-y-1">
                      {sub.jobs.slice(0, 3).map((job: any, jobIdx: number) => (
                        <div key={job.id || jobIdx} className="text-sm text-purple-700">
                          • {job.name}
                        </div>
                      ))}
                      {sub.jobs.length > 3 && (
                        <div className="text-sm text-gray-500">
                          ... and {sub.jobs.length - 3} more jobs
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const findDifferences = () => {
    const dbJobCount = getTotalJobs(dbCategories);
    const apiJobCount = getTotalJobs(apiCategories);
    
    const differences = [];
    
    if (dbCategories.length !== apiCategories.length) {
      differences.push(`Category count mismatch: DB has ${dbCategories.length}, API has ${apiCategories.length}`);
    }
    
    if (dbJobCount !== apiJobCount) {
      differences.push(`Job count mismatch: DB has ${dbJobCount}, API has ${apiJobCount}`);
    }

    // Check for structural differences
    dbCategories.forEach(dbCat => {
      const apiCat = apiCategories.find(api => api.name === dbCat.name);
      if (!apiCat) {
        differences.push(`Category "${dbCat.name}" exists in DB but not in API`);
      }
    });

    apiCategories.forEach(apiCat => {
      const dbCat = dbCategories.find(db => db.name === apiCat.name);
      if (!dbCat) {
        differences.push(`Category "${apiCat.name}" exists in API but not in DB`);
      }
    });

    return differences;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading service data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading data: {error}
          <Button onClick={loadData} variant="outline" className="ml-2" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const differences = findDifferences();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Data Debug</h1>
          <p className="text-gray-600">Compare database vs API service data</p>
        </div>
        <Button onClick={loadData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {differences.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Data Inconsistencies Found:</div>
            <ul className="list-disc list-inside space-y-1">
              {differences.map((diff, idx) => (
                <li key={idx}>{diff}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Direct
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            API Response
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Source Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Database Direct
                  </h3>
                  <div className="space-y-2">
                    <div>Categories: <Badge>{dbCategories.length}</Badge></div>
                    <div>Total Jobs: <Badge>{getTotalJobs(dbCategories)}</Badge></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    API Response
                  </h3>
                  <div className="space-y-2">
                    <div>Categories: <Badge>{apiCategories.length}</Badge></div>
                    <div>Total Jobs: <Badge>{getTotalJobs(apiCategories)}</Badge></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Direct Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCategoryTree(dbCategories, 'database')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API Response Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderCategoryTree(apiCategories, 'api')}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
