
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { clearAllServiceData, getServiceCounts, ImportProgress } from '@/lib/services/folderBasedImportService';
import { FolderBasedImportManager } from './FolderBasedImportManager';
import { ServiceImportProgress } from './ServiceImportProgress';
import { Trash2, Upload, Settings, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceManagementSettingsProps {
  children: React.ReactNode;
}

export function ServiceManagementSettings({ children }: ServiceManagementSettingsProps) {
  const [open, setOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearProgress, setClearProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0
  });
  const { toast } = useToast();

  const handleClearDatabase = async () => {
    setIsClearing(true);
    setClearProgress({
      stage: 'Clearing Data',
      message: 'Removing all service data...',
      progress: 50
    });

    try {
      await clearAllServiceData();
      setClearProgress({
        stage: 'Complete',
        message: 'All service data has been cleared successfully.',
        progress: 100,
        completed: true
      });
      
      toast({
        title: "Database Cleared",
        description: "All service data has been removed successfully.",
      });
    } catch (error) {
      console.error('Failed to clear database:', error);
      setClearProgress({
        stage: 'Error',
        message: error instanceof Error ? error.message : 'Failed to clear database',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Clear Failed",
        description: "Failed to clear service data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsClearing(false);
        setClearProgress({
          stage: '',
          message: '',
          progress: 0
        });
      }, 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Service Management Settings
          </DialogTitle>
          <DialogDescription>
            Import service data from files or manage existing data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Import Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Service Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FolderBasedImportManager />
            </CardContent>
          </Card>

          {/* Database Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Clear All Service Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Remove all sectors, categories, subcategories, and jobs from the database.
                  </p>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isClearing}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Database
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all service sectors, 
                        categories, subcategories, and jobs from the database.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearDatabase}>
                        Yes, clear all data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <ServiceImportProgress
                isImporting={isClearing}
                progress={clearProgress.progress}
                stage={clearProgress.stage}
                message={clearProgress.message}
                error={clearProgress.error}
                completed={clearProgress.completed}
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
