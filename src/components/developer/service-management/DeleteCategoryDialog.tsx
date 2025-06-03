
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

interface DeleteCategoryDialogProps {
  isOpen: boolean;
  category: ServiceMainCategory | null;
  onClose: () => void;
  onConfirm: (categoryId: string) => void;
}

export const DeleteCategoryDialog: React.FC<DeleteCategoryDialogProps> = ({
  isOpen,
  category,
  onClose,
  onConfirm
}) => {
  const handleConfirm = () => {
    if (category) {
      onConfirm(category.id);
    }
    onClose();
  };

  const subcategoryCount = category?.subcategories?.length || 0;
  const jobCount = category?.subcategories?.reduce((total, sub) => total + sub.jobs.length, 0) || 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Service Category</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete "<strong>{category?.name}</strong>"?
            </p>
            {subcategoryCount > 0 && (
              <p className="text-orange-600 font-medium">
                This will also delete {subcategoryCount} subcategory{subcategoryCount !== 1 ? 'ies' : ''} 
                {jobCount > 0 && ` and ${jobCount} job${jobCount !== 1 ? 's' : ''}`}.
              </p>
            )}
            <p className="text-red-600 font-medium">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
