
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';

// Define the form values type
export interface WorkOrderFormValues {
  customer: string;
  customer_id?: string;
  description: string;
  status: string;
  priority: string;
  technician: string;
  technician_id?: string;
  location?: string;
  dueDate?: string;
  notes?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  odometer?: string;
  licensePlate?: string;
  vin?: string;
  inventoryItems?: any[];
}

// Create the schema
const workOrderFormSchema = z.object({
  customer: z.string().min(1, { message: "Customer is required" }),
  customer_id: z.string().optional(),
  description: z.string().min(1, { message: "Description is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  priority: z.string().min(1, { message: "Priority is required" }),
  technician: z.string().optional(),
  technician_id: z.string().optional(),
  location: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  odometer: z.string().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  inventoryItems: z.array(z.any()).optional()
});

export const useWorkOrderForm = (initialData?: Partial<WorkOrderFormValues>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: initialData || {
      customer: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      technician: '',
      location: '',
      notes: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      odometer: '',
      licensePlate: '',
      vin: '',
      inventoryItems: []
    }
  });

  const handleSubmit = async (values: WorkOrderFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting work order:", values);
      
      // Here you would normally send the data to your API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API request
      
      toast({
        title: "Work order created",
        description: "The work order has been created successfully",
      });
      
      return values;
    } catch (error) {
      console.error("Error creating work order:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the work order",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    handleSubmit,
  };
};

export default useWorkOrderForm;
