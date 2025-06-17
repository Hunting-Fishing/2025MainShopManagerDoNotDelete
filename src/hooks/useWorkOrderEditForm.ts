
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workOrderFormSchema, WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderStatus } from '@/utils/workOrders/constants';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

export const useWorkOrderEditForm = (workOrderId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customerId: '',
      customer: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      vehicleId: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleLicensePlate: '',
      vehicleVin: '',
      description: '',
      status: 'pending' as WorkOrderStatus,
      priority: 'medium',
      technicianId: '',
      notes: '',
      inventoryItems: []
    }
  });

  // Fetch work order data
  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('work_orders')
          .select(`
            *,
            customer:customers(*),
            vehicle:vehicles(*),
            technician:profiles!work_orders_technician_id_fkey(*)
          `)
          .eq('id', workOrderId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setWorkOrder(data);
          
          // Populate form with existing data
          form.reset({
            customerId: data.customer_id || '',
            customer: data.customer ? `${data.customer.first_name} ${data.customer.last_name}` : '',
            customerEmail: data.customer?.email || '',
            customerPhone: data.customer?.phone || '',
            customerAddress: data.customer?.address || '',
            vehicleId: data.vehicle_id || '',
            vehicleMake: data.vehicle?.make || '',
            vehicleModel: data.vehicle?.model || '',
            vehicleYear: data.vehicle?.year?.toString() || '',
            vehicleLicensePlate: data.vehicle?.license_plate || '',
            vehicleVin: data.vehicle?.vin || '',
            description: data.description || '',
            status: data.status as WorkOrderStatus,
            priority: data.priority || 'medium',
            technicianId: data.technician_id || '',
            notes: data.notes || '',
            inventoryItems: data.inventory_items || []
          });
        }
      } catch (err) {
        console.error('Error fetching work order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load work order');
        toast({
          title: "Error",
          description: "Failed to load work order",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (workOrderId) {
      fetchWorkOrder();
    }
  }, [workOrderId, form]);

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, job_title')
          .not('first_name', 'is', null)
          .not('last_name', 'is', null);

        if (error) {
          throw error;
        }

        const technicianList = (data || []).map(profile => ({
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`,
          jobTitle: profile.job_title || undefined
        }));

        setTechnicians(technicianList);
      } catch (err) {
        console.error('Error fetching technicians:', err);
      }
    };

    fetchTechnicians();
  }, []);

  const onSubmit = async (data: WorkOrderFormSchemaValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Ensure all inventory items have required properties
      const processedInventoryItems: WorkOrderInventoryItem[] = (data.inventoryItems || []).map(item => ({
        id: item.id || uuidv4(),
        name: item.name || '',
        sku: item.sku || '',
        category: item.category || '',
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        total: item.total || 0,
        notes: item.notes,
        itemStatus: item.itemStatus,
        estimatedArrivalDate: item.estimatedArrivalDate,
        supplierName: item.supplierName,
        supplierCost: item.supplierCost,
        customerPrice: item.customerPrice,
        retailPrice: item.retailPrice,
        partType: item.partType,
        markupPercentage: item.markupPercentage,
        isTaxable: item.isTaxable,
        coreChargeAmount: item.coreChargeAmount,
        coreChargeApplied: item.coreChargeApplied,
        warrantyDuration: item.warrantyDuration,
        invoiceNumber: item.invoiceNumber,
        poLine: item.poLine,
        isStockItem: item.isStockItem,
        notesInternal: item.notesInternal,
        inventoryItemId: item.inventoryItemId,
        supplierOrderRef: item.supplierOrderRef
      }));

      // Prepare update data
      const updateData: Partial<WorkOrder> = {
        customer_id: data.customerId || undefined,
        vehicle_id: data.vehicleId || undefined,
        technician_id: data.technicianId || undefined,
        description: data.description,
        status: data.status as WorkOrderStatus,
        priority: data.priority,
        notes: data.notes,
        inventoryItems: processedInventoryItems,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('work_orders')
        .update(updateData)
        .eq('id', workOrderId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Work order updated successfully",
      });

      // Refresh the work order data
      const { data: updatedData } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', workOrderId)
        .single();

      if (updatedData) {
        setWorkOrder(updatedData);
      }

    } catch (err) {
      console.error('Error updating work order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update work order';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isLoading,
    isSubmitting,
    error,
    workOrder,
    technicians,
    onSubmit
  };
};
