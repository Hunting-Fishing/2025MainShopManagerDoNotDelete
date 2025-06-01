
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { IntegratedServiceSelector } from '../fields/services/IntegratedServiceSelector';
import { ManualJobLineForm } from './ManualJobLineForm';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';

interface AddJobLineDialogProps {
  workOrderId: string;
  onJobLineAdd: (jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddJobLineDialog({ workOrderId, onJobLineAdd, open, onOpenChange }: AddJobLineDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const { categories, loading, error } = useServiceCategories();

  // Use external open state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Reset tab when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('services');
    }
  }, [isOpen]);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newJobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
      workOrderId,
      name: service.name,
      category: categoryName,
      subcategory: subcategoryName,
      description: service.description,
      estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : undefined,
      laborRate: service.price,
      totalAmount: service.price,
      status: 'pending',
    };
    
    onJobLineAdd(newJobLine);
    setIsOpen(false);
  };

  const handleManualSubmit = (jobLineData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => {
    onJobLineAdd({
      ...jobLineData,
      workOrderId,
      status: 'pending',
    });
    setIsOpen(false);
  };

  const renderServicesTab = () => {
    if (loading) {
      return (
        <div className="space-y-4 p-4">
          <div className="text-center">
            <LoadingSpinner size="md" text="Loading services..." />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Retry Loading Services
          </Button>
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <div className="text-center py-8 border rounded-md bg-gray-50">
          <p className="text-gray-500 mb-2">No services available</p>
          <p className="text-sm text-gray-400 mb-4">Contact your administrator to set up services</p>
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('manual')}
          >
            Add Manual Job Line
          </Button>
        </div>
      );
    }

    return (
      <div className="max-h-[500px] overflow-y-auto">
        <IntegratedServiceSelector
          categories={categories}
          onServiceSelect={handleServiceSelect}
          selectedServices={[]}
          onRemoveService={() => {}}
          onUpdateServices={() => {}}
        />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {open === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Job Line
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services" disabled={loading}>
              {loading ? 'Loading Services...' : 'Select from Services'}
            </TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="mt-4">
            {renderServicesTab()}
          </TabsContent>
          
          <TabsContent value="manual" className="mt-4">
            <ManualJobLineForm onSubmit={handleManualSubmit} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
