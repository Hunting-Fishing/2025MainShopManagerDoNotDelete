
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Database, FileText, BarChart3, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ServiceBulkImport } from './ServiceBulkImport';
import { ServiceManagementSettings } from './ServiceManagementSettings';
import { getServiceCounts, type ImportStats } from '@/lib/services';

export function FolderBasedImportManager() {
  const [stats, setStats] = useState<ImportStats>({
    sectors: 0,
    categories: 0,
    subcategories: 0,
    jobs: 0,
    totalImported: 0,
    errors: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const currentStats = await getServiceCounts();
      setStats({
        sectors: currentStats.sectors,
        categories: currentStats.categories,
        subcategories: currentStats.subcategories,
        jobs: currentStats.jobs,
        totalImported: currentStats.totalImported,
        errors: currentStats.errors
      });
    } catch (error) {
      console.error('Error fetching service stats:', error);
      toast({
        title: "Error",
        description: "Failed to load service statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleImportComplete = () => {
    fetchStats();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading service management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Service Data Management</h2>
          <p className="text-gray-600 mt-1">
            Import and manage your service hierarchy from Excel files
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Service Sectors</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sectors}</div>
                <p className="text-xs text-muted-foreground">
                  Total sectors in database
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.categories}</div>
                <p className="text-xs text-muted-foreground">
                  Total categories in database
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.subcategories}</div>
                <p className="text-xs text-muted-foreground">
                  Total subcategories in database
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Service Jobs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.jobs}</div>
                <p className="text-xs text-muted-foreground">
                  Total service jobs in database
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Import Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Database contains a total of <strong>{stats.totalImported}</strong> service items
                  </p>
                  {stats.errors.length > 0 && (
                    <div className="mt-2">
                      <Badge variant="destructive">
                        {stats.errors.length} error(s) detected
                      </Badge>
                    </div>
                  )}
                </div>
                <Button onClick={fetchStats} variant="outline">
                  Refresh Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="mt-6">
          <ServiceBulkImport onImportComplete={handleImportComplete} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ServiceManagementSettings onDataChange={handleImportComplete}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Open Settings
            </Button>
          </ServiceManagementSettings>
        </TabsContent>
      </Tabs>
    </div>
  );
}
