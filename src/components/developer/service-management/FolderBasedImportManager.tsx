
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Database, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ServiceBulkImport } from './ServiceBulkImport';
import { 
  getServiceCounts, 
  clearAllServiceData,
  type ImportStats,
  type ImportProgress 
} from '@/lib/services/folderBasedImportService';

export function FolderBasedImportManager() {
  const [stats, setStats] = useState<ImportStats>({
    sectors: 0,
    categories: 0,
    subcategories: 0,
    services: 0,
    totalImported: 0,
    errors: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [clearProgress, setClearProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const currentStats = await getServiceCounts();
      setStats(currentStats);
    } catch (error) {
      console.error('Error loading service stats:', error);
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
    loadStats();
  }, []);

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all service data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    setClearProgress({
      stage: 'clearing',
      progress: 50,
      message: 'Clearing service database...',
      completed: false,
      error: null
    });

    try {
      await clearAllServiceData();
      
      setClearProgress({
        stage: 'complete',
        progress: 100,
        message: 'Database cleared successfully!',
        completed: true,
        error: null
      });

      // Refresh stats
      await loadStats();

      toast({
        title: "Success",
        description: "Service database cleared successfully",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setClearProgress({
        stage: 'error',
        progress: 0,
        message: errorMessage,
        completed: false,
        error: errorMessage
      });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const resetProgress = () => {
    setClearProgress({
      stage: '',
      message: '',
      progress: 0,
      completed: false,
      error: null
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sectors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.sectors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.categories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Subcategories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.subcategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.services}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ServiceBulkImport />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Manage the service hierarchy database. Use with caution as these actions cannot be undone.
            </div>

            <Button
              variant="destructive"
              onClick={handleClearDatabase}
              disabled={isClearing}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isClearing ? 'Clearing Database...' : 'Clear All Service Data'}
            </Button>

            {(isClearing || clearProgress.completed || clearProgress.error) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{clearProgress.stage}</span>
                  <span className="text-sm text-gray-500">{Math.round(clearProgress.progress)}%</span>
                </div>
                {clearProgress.progress > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${clearProgress.progress}%` }}
                    />
                  </div>
                )}
                <p className="text-sm text-gray-600">{clearProgress.message}</p>
                {clearProgress.error && (
                  <p className="text-sm text-red-600">{clearProgress.error}</p>
                )}
              </div>
            )}

            <Button
              variant="outline"
              onClick={loadStats}
              disabled={isLoading}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Refresh Statistics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
