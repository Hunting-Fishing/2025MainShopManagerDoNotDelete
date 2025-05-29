
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bug, Eye, EyeOff, Database, AlertTriangle } from 'lucide-react';
import { fetchRawServiceData } from '@/lib/services/serviceApi';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const ServiceDebugInfo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDebugData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchRawServiceData();
      setDebugData(data);
      console.log('Debug data loaded:', data);
    } catch (error) {
      console.error('Failed to load debug data:', error);
      setDebugData({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <CardHeader className="bg-yellow-100 border-b border-yellow-200">
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <Bug className="h-5 w-5" />
          Debug Database Contents
          <Badge variant="outline" className="bg-yellow-200 text-yellow-800 border-yellow-300">
            Troubleshooting
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button 
            onClick={loadDebugData} 
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            <Database className="h-4 w-4 mr-2" />
            {isLoading ? 'Loading...' : 'Load Raw Database Data'}
          </Button>
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                {isOpen ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {isOpen ? 'Hide' : 'Show'} Debug Info
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4">
              {debugData && (
                <div className="space-y-4">
                  {debugData.error ? (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        Error Loading Data
                      </div>
                      <p className="text-red-600 text-sm">{debugData.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-white border border-yellow-200 rounded p-3">
                          <h4 className="font-medium text-gray-800 mb-2">Categories</h4>
                          <p className="text-gray-600">Count: {debugData.categories?.length || 0}</p>
                          {debugData.errors?.categories && (
                            <p className="text-red-500 text-xs mt-1">Error: {debugData.errors.categories.message}</p>
                          )}
                        </div>
                        
                        <div className="bg-white border border-yellow-200 rounded p-3">
                          <h4 className="font-medium text-gray-800 mb-2">Subcategories</h4>
                          <p className="text-gray-600">Count: {debugData.subcategories?.length || 0}</p>
                          {debugData.errors?.subcategories && (
                            <p className="text-red-500 text-xs mt-1">Error: {debugData.errors.subcategories.message}</p>
                          )}
                        </div>
                        
                        <div className="bg-white border border-yellow-200 rounded p-3">
                          <h4 className="font-medium text-gray-800 mb-2">Jobs</h4>
                          <p className="text-gray-600">Count: {debugData.jobs?.length || 0}</p>
                          {debugData.errors?.jobs && (
                            <p className="text-red-500 text-xs mt-1">Error: {debugData.errors.jobs.message}</p>
                          )}
                        </div>
                      </div>

                      {debugData.categories?.length > 0 && (
                        <div className="bg-white border border-yellow-200 rounded p-3">
                          <h4 className="font-medium text-gray-800 mb-2">Sample Categories</h4>
                          <div className="space-y-1 text-xs">
                            {debugData.categories.slice(0, 5).map((cat: any) => (
                              <div key={cat.id} className="flex justify-between">
                                <span className="text-gray-700">{cat.name}</span>
                                <span className="text-gray-500">ID: {cat.id.slice(0, 8)}...</span>
                              </div>
                            ))}
                            {debugData.categories.length > 5 && (
                              <p className="text-gray-500">...and {debugData.categories.length - 5} more</p>
                            )}
                          </div>
                        </div>
                      )}

                      {debugData.subcategories?.length > 0 && (
                        <div className="bg-white border border-yellow-200 rounded p-3">
                          <h4 className="font-medium text-gray-800 mb-2">Sample Subcategories</h4>
                          <div className="space-y-1 text-xs">
                            {debugData.subcategories.slice(0, 5).map((sub: any) => (
                              <div key={sub.id} className="flex justify-between">
                                <span className="text-gray-700">{sub.name}</span>
                                <span className="text-gray-500">Category: {sub.category_id?.slice(0, 8)}...</span>
                              </div>
                            ))}
                            {debugData.subcategories.length > 5 && (
                              <p className="text-gray-500">...and {debugData.subcategories.length - 5} more</p>
                            )}
                          </div>
                        </div>
                      )}

                      {debugData.jobs?.length > 0 && (
                        <div className="bg-white border border-yellow-200 rounded p-3">
                          <h4 className="font-medium text-gray-800 mb-2">Sample Jobs</h4>
                          <div className="space-y-1 text-xs">
                            {debugData.jobs.slice(0, 5).map((job: any) => (
                              <div key={job.id} className="flex justify-between">
                                <span className="text-gray-700">{job.name}</span>
                                <div className="text-gray-500">
                                  {job.price && <span>${job.price}</span>}
                                  {job.estimated_time && <span className="ml-2">{job.estimated_time}min</span>}
                                </div>
                              </div>
                            ))}
                            {debugData.jobs.length > 5 && (
                              <p className="text-gray-500">...and {debugData.jobs.length - 5} more</p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="text-sm text-yellow-700 bg-yellow-100 border border-yellow-200 rounded p-3">
          <p className="font-medium mb-1">Troubleshooting Tips:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>If you see categories but they're not showing above, there might be a data structure issue</li>
            <li>Check if your Excel import created the proper relationships between categories, subcategories, and jobs</li>
            <li>Verify that category_id and subcategory_id foreign keys are properly set</li>
            <li>Look for any console errors in your browser's developer tools</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceDebugInfo;
