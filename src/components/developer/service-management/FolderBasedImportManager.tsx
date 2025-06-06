
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, RefreshCw, Database, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  importServicesFromStorage, 
  getServiceCounts, 
  clearAllServiceData,
  type ImportProgress,
  type ImportResult,
  type ImportStats
} from '@/lib/services/folderBasedImportService';

export function FolderBasedImportManager() {
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  const [stats, setStats] = useState<ImportStats>({
    sectors: 0,
    categories: 0,
    subcategories: 0,
    services: 0,
    importedCount: 0,
    errors: []
  });
  const { toast } = useToast();

  // Load current stats on component mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const currentStats = await getServiceCounts();
      setStats(currentStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setProgress({
      stage: 'Starting...',
      message: 'Initializing import process',
      progress: 0,
      completed: false,
      error: null
    });

    try {
      const result: ImportResult = await importServicesFromStorage((progressUpdate) => {
        setProgress(progressUpdate);
      });

      if (result.success) {
        setProgress({
          stage: 'Import Complete',
          message: `Successfully imported ${result.importedCount} services`,
          progress: 100,
          completed: true,
          error: null
        });

        toast({
          title: "Import Successful",
          description: `Imported ${result.importedCount} services successfully`,
        });

        // Reload stats
        await loadStats();
      } else {
        const errorMessage = result.errors?.join(', ') || 'Unknown error';
        setProgress({
          stage: 'Import Failed',
          progress: 0,
          message: errorMessage,
          error: errorMessage,
          completed: false
        });

        toast({
          title: "Import Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setProgress({
        stage: 'Import Failed',
        message: errorMessage,
        progress: 0,
        error: errorMessage,
        completed: false
      });

      toast({
        title: "Import Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all service data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearAllServiceData();
      
      toast({
        title: "Data Cleared",
        description: "All service data has been cleared successfully",
      });

      // Reload stats
      await loadStats();
      
      // Reset progress
      setProgress({
        stage: '',
        message: '',
        progress: 0,
        completed: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Clear Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleRefreshStats = async () => {
    await loadStats();
    toast({
      title: "Stats Refreshed",
      description: "Service statistics have been updated",
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Current Service Database
            </CardTitle>
            <Button variant="outline" size="sm" onClick={handleRefreshStats}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-800">{stats.sectors}</div>
              <div className="text-sm text-blue-600">Sectors</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800">{stats.categories}</div>
              <div className="text-sm text-green-600">Categories</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-800">{stats.subcategories}</div>
              <div className="text-sm text-yellow-600">Subcategories</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-800">{stats.services}</div>
              <div className="text-sm text-purple-600">Services</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import from Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import from Storage Bucket
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            Import service data from Excel files stored in the 'service-data' storage bucket.
            Files should be organized in folders by sector with proper Excel structure.
          </div>

          {(isImporting || progress.stage) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{progress.stage}</span>
                <span className="text-sm text-gray-500">{Math.round(progress.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{progress.message}</p>
            </div>
          )}

          {progress.completed && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">{progress.message}</span>
            </div>
          )}

          {progress.error && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{progress.error}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleImport}
              disabled={isImporting || isClearing}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import from Storage'}
            </Button>
            
            <Button 
              variant="destructive"
              onClick={handleClearData}
              disabled={isImporting || isClearing}
            >
              {isClearing ? 'Clearing...' : 'Clear All Data'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
