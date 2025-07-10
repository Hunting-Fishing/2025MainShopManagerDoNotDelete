import { useState, useCallback } from 'react';
import { SelectedService } from '@/types/selectedService';
import { WorkOrderJobLine } from '@/types/jobLine';
import { createJobLinesFromServices, removeServiceJobLines } from '@/utils/serviceToJobLineConverter';
import { toast } from '@/hooks/use-toast';

export function useWorkOrderServiceSelection(workOrderId: string, onJobLinesChange: () => Promise<void>) {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isCreatingJobLines, setIsCreatingJobLines] = useState(false);

  const addService = useCallback((service: SelectedService) => {
    setSelectedServices(prev => {
      const isAlreadySelected = prev.some(s => s.id === service.id || s.serviceId === service.serviceId);
      if (isAlreadySelected) {
        return prev;
      }
      return [...prev, service];
    });
  }, []);

  const removeService = useCallback((serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId && s.serviceId !== serviceId));
  }, []);

  const updateServices = useCallback((services: SelectedService[]) => {
    setSelectedServices(services);
  }, []);

  const convertServicesToJobLines = useCallback(async () => {
    if (selectedServices.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please select services first before converting to job lines.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingJobLines(true);
    
    try {
      console.log('Converting services to job lines:', selectedServices);
      
      // Remove any existing service job lines first
      await removeServiceJobLines(workOrderId);
      
      // Create new job lines from selected services
      const createdJobLines = await createJobLinesFromServices(selectedServices, workOrderId);
      
      console.log('Created job lines:', createdJobLines);
      
      // Clear selected services since they're now job lines
      setSelectedServices([]);
      
      // Refresh the job lines data
      await onJobLinesChange();
      
      toast({
        title: "Services Added",
        description: `Successfully added ${createdJobLines.length} service(s) to Labor & Services.`
      });
      
    } catch (error) {
      console.error('Failed to convert services to job lines:', error);
      toast({
        title: "Error",
        description: "Failed to add services to Labor & Services. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingJobLines(false);
    }
  }, [selectedServices, workOrderId, onJobLinesChange]);

  const clearServices = useCallback(() => {
    setSelectedServices([]);
  }, []);

  return {
    selectedServices,
    addService,
    removeService,
    updateServices,
    convertServicesToJobLines,
    clearServices,
    isCreatingJobLines,
    hasSelectedServices: selectedServices.length > 0
  };
}