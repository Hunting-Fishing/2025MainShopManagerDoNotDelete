
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { AlertTriangle, Trash2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearAllServiceData, type ImportProgress } from '@/lib/services';
import { ServiceImportProgress } from './ServiceImportProgress';

interface ServiceManagementSettingsProps {
  children: React.ReactNode;
  onDataChange?: () => void;
}

export function ServiceManagementSettings({ children, onDataChange }: ServiceManagementSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearProgress, setClearProgress] = useState<ImportProgress>({
    stage: '',
    message: '',
    progress: 0,
    completed: false,
    error: null
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  const handleClearDatabase = async () => {
    setIsClearing(true);
    setShowConfirmDialog(false);
    
    try {
      setClearProgress({
        stage: 'clearing',
        progress: 20,
        message: 'Clearing service database...',
        completed: false,
        error: null
      });

      await clearAllServiceData();

      setClearProgress({
        stage: 'complete',
        progress: 100,
        message: 'Service database cleared successfully!',
        completed: true,
        error: null
      });

      toast({
        title: "Database Cleared",
        description: "All service data has been removed from the database.",
      });

      // Call the callback to refresh parent component
      onDataChange?.();

    } catch (error: any) {
      console.error('Clear database failed:', error);
      setClearProgress({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : "Failed to clear database",
        error: error instanceof Error ? error.message : "Failed to clear database",
        completed: false
      });
      toast({
        title: "Clear Failed",
        description: error instanceof Error ? error.message : "Failed to clear service database",
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
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetProgress();
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Service Management Settings</DialogTitle>
          <DialogDescription>
            Configure and manage your service hierarchy data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Warning: Destructive Action</p>
                  <p className="mt-1 text-red-700">
                    This will permanently delete all service sectors, categories, subcategories, and jobs from the database.
                  </p>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={() => setShowConfirmDialog(true)}
                disabled={isClearing}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isClearing ? 'Clearing Database...' : 'Clear Service Database'}
              </Button>

              <ServiceImportProgress
                isImporting={isClearing}
                progress={clearProgress.progress}
                stage={clearProgress.stage}
                message={clearProgress.message}
                error={clearProgress.error}
                completed={clearProgress.completed}
                operation="clear"
              />
            </CardContent>
          </Card>
        </div>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Database Clear</DialogTitle>
              <DialogDescription>
                Are you absolutely sure you want to clear the entire service database? 
                This action cannot be undone and will delete all service data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearDatabase}
              >
                Yes, Clear Database
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
