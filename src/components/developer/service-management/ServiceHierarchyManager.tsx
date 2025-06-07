
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteServiceCategory, deleteServiceSubcategory, deleteServiceJob } from '@/lib/services/serviceApi';

interface ServiceHierarchyManagerProps {
  onDataChange?: () => Promise<void>;
}

export function ServiceHierarchyManager({ onDataChange }: ServiceHierarchyManagerProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"? This will also delete all subcategories and jobs within it.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteServiceCategory(categoryId);
      toast({
        title: "Category Deleted",
        description: `Successfully deleted category "${categoryName}"`,
      });
      
      if (onDataChange) {
        await onDataChange();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Delete Failed",
        description: `Failed to delete category: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string, subcategoryName: string) => {
    if (!confirm(`Are you sure you want to delete the subcategory "${subcategoryName}"? This will also delete all jobs within it.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteServiceSubcategory(subcategoryId);
      toast({
        title: "Subcategory Deleted",
        description: `Successfully deleted subcategory "${subcategoryName}"`,
      });
      
      if (onDataChange) {
        await onDataChange();
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Delete Failed",
        description: `Failed to delete subcategory: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteJob = async (jobId: string, jobName: string) => {
    if (!confirm(`Are you sure you want to delete the job "${jobName}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteServiceJob(jobId);
      toast({
        title: "Job Deleted",
        description: `Successfully deleted job "${jobName}"`,
      });
      
      if (onDataChange) {
        await onDataChange();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Delete Failed",
        description: `Failed to delete job: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Service Hierarchy Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This component provides management functions for the service hierarchy.
            Use the tree view or Excel view to access delete functions for specific items.
          </AlertDescription>
        </Alert>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>Management functions include:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Delete categories (removes all subcategories and jobs)</li>
            <li>Delete subcategories (removes all jobs within)</li>
            <li>Delete individual jobs</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
