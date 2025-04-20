
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormValues } from '@/hooks/useWorkOrderForm';
import { WorkOrderTemplate } from '@/types/workOrder';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface UseWorkOrderInitializationProps {
  form: UseFormReturn<WorkOrderFormValues>;
  initialTemplate?: WorkOrderTemplate | null;
  customerId?: string | null;
  customerName?: string | null;
  vehicleId?: string | null;
  vehicleInfo?: string | null;
}

export const useWorkOrderInitialization = ({
  form,
  initialTemplate,
  customerId,
  customerName,
  vehicleId,
  vehicleInfo
}: UseWorkOrderInitializationProps) => {
  // Handle template initialization
  useEffect(() => {
    if (initialTemplate) {
      console.log("Applying template:", initialTemplate.name);
      
      const today = format(new Date(), 'yyyy-MM-dd');
      
      form.reset({
        customer: initialTemplate.customer || "",
        description: initialTemplate.description || "",
        status: initialTemplate.status,
        priority: initialTemplate.priority,
        technician: initialTemplate.technician,
        location: initialTemplate.location || "",
        dueDate: today,
        notes: initialTemplate.notes || "",
        inventoryItems: initialTemplate.inventoryItems || [],
      });

      toast({
        title: "Template Applied",
        description: `${initialTemplate.name} template has been applied.`,
        variant: "success",
      });
    }
  }, [initialTemplate, form]);

  // Handle customer/vehicle initialization
  useEffect(() => {
    if (customerId) {
      console.log("Pre-filling form with customerId:", customerId);
      form.setValue('customer', customerId);
      
      if (vehicleInfo) {
        form.setValue('description', `Service for ${vehicleInfo}`);
        
        if (vehicleId) {
          form.setValue('vehicle_id', vehicleId);
        }
        
        toast({
          title: "Information Pre-filled",
          description: `Work order created for ${customerName}'s ${vehicleInfo}`,
        });
      }
    }
  }, [customerId, customerName, vehicleId, vehicleInfo, form]);
};
