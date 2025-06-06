
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Database, Trash2, AlertTriangle } from 'lucide-react';
import { clearServiceDatabase, getServiceCounts, ImportProgress } from '@/lib/services/folderBasedImportService';
import { toast } from '@/hooks/use-toast';

interface ServiceManagementSettingsProps {
  children: React.ReactNode;
}

export function ServiceManagementSettings({ children }: ServiceManagementSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearProgress, setClearProgress] = useState<ImportProgress | null>(null);
  const [serviceCounts, setServiceCounts] = useState({
    sectors: 0,
    categories: 0,
    subcategories: 0,
    jobs: 0
  });

  React.useEffect(() => {
    if (isOpen) {
      loadServiceCounts();
    }
  }, [isOpen]);

  const loadServiceCounts = async () => {
    try {
      const counts = await getServiceCounts();
      setServiceCounts(counts);
    } catch (error) {
      console.error('Error loading service counts:', error);
    }
  };

  const handleClearDatabase = async () => {
    setIsClearing(true);
    setClearProgress(null);

    try {
      await clearServiceDatabase((progress) => {
        setClearProgress(progress);
      });

      toast({
        title: 'Success!',
        description: 'Service database cleared successfully',
        variant: 'success',
      });

      // Reload counts after clearing
      await loadServiceCounts();
    } catch (error) {
      console.error('Error clearing database:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear database. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
      setClearProgress(null);
    }
  };

  const totalRecords = serviceCounts.sectors + serviceCounts.categories + serviceCounts.subcategories + serviceCounts.jobs;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Service Management Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Database Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Status
              </CardTitle>
              <CardDescription>
                Current service data in the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{serviceCounts.sectors}</div>
                  <div className="text-sm text-muted-foreground">Sectors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{serviceCounts.categories}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{serviceCounts.subcategories}</div>
                  <div className="text-sm text-muted-foreground">Subcategories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{serviceCounts.jobs}</div>
                  <div className="text-sm text-muted-foreground">Services</div>
                </div>
              </div>
              <div className="text-center pt-2 border-t">
                <div className="text-lg font-semibold">Total: {totalRecords.toLocaleString()} records</div>
              </div>
            </CardContent>
          </Card>

          {/* Clear Database Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Clear Database
              </CardTitle>
              <CardDescription>
                Remove all service data from the database to start fresh
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {totalRecords > 0 ? (
                <>
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      This action will permanently delete all {totalRecords.toLocaleString()} service records from the database. This cannot be undone.
                    </AlertDescription>
                  </Alert>

                  {isClearing && clearProgress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{clearProgress.message}</span>
                        <span>{clearProgress.progress}%</span>
                      </div>
                      <Progress value={clearProgress.progress} />
                    </div>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        disabled={isClearing}
                        className="w-full"
                      >
                        {isClearing ? 'Clearing Database...' : 'Clear Database'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all {totalRecords.toLocaleString()} service records from the database:
                          <ul className="mt-2 list-disc list-inside space-y-1">
                            <li>{serviceCounts.jobs.toLocaleString()} services</li>
                            <li>{serviceCounts.subcategories.toLocaleString()} subcategories</li>
                            <li>{serviceCounts.categories.toLocaleString()} categories</li>
                            <li>{serviceCounts.sectors.toLocaleString()} sectors</li>
                          </ul>
                          <br />
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearDatabase}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, clear database
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <Alert>
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    Database is already empty. No service data to clear.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
