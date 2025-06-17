
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { WorkOrder, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderStatus } from '@/utils/workOrders/constants';
import { updateWorkOrder } from '@/services/workOrder';
import { useFetchProfiles } from '@/hooks/team/useFetchProfiles';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Form schema that matches the expected form structure
const workOrderEditSchema = z.object({
  customerId: z.string().optional(),
  customer: z.string().optional(),
  customerEmail: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  vehicleId: z.string().optional(),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.string().optional(),
  vehicleVin: z.string().optional(),
  licensePlate: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  technicianId: z.string().optional(),
  notes: z.string().optional(),
  inventoryItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    category: z.string(),
    quantity: z.number(),
    unit_price: z.number(),
    total: z.number(),
    notes: z.string().optional(),
    itemStatus: z.string().optional(),
    estimatedArrivalDate: z.string().optional(),
    supplierName: z.string().optional(),
    supplierCost: z.number().optional(),
    customerPrice: z.number().optional(),
    retailPrice: z.number().optional(),
    partType: z.string().optional(),
    markupPercentage: z.number().optional(),
    isTaxable: z.boolean().optional(),
    coreChargeAmount: z.number().optional(),
    coreChargeApplied: z.boolean().optional(),
    warrantyDuration: z.string().optional(),
    invoiceNumber: z.string().optional(),
    poLine: z.string().optional(),
    isStockItem: z.boolean().optional(),
    notesInternal: z.string().optional(),
    inventoryItemId: z.string().optional(),
    supplierOrderRef: z.string().optional(),
  })).optional(),
});

type WorkOrderEditFormValues = z.infer<typeof workOrderEditSchema>;

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

export function useWorkOrderEditForm(workOrderId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  const { fetchProfiles } = useFetchProfiles();

  const form = useForm<WorkOrderEditFormValues>({
    resolver: zodResolver(workOrderEditSchema),
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
      vehicleVin: '',
      licensePlate: '', // Use licensePlate instead of vehicleLicensePlate
      description: '',
      status: 'pending',
      priority: 'medium',
      technicianId: '',
      notes: '',
      inventoryItems: [],
    },
  });

  useEffect(() => {
    const loadData = async () => {
      if (!workOrderId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch profiles for technicians
        const profiles = await fetchProfiles();
        const formattedTechnicians = profiles.map(profile => ({
          id: profile.id,
          name: `${profile.first_name} ${profile.last_name}`.trim(),
          jobTitle: profile.job_title || undefined,
        }));
        setTechnicians(formattedTechnicians);

        // Fetch work order with explicit column hints to avoid relationship ambiguity
        const { data: workOrderData, error: workOrderError } = await supabase
          .from('work_orders')
          .select(`
            *,
            customers:customer_id (
              id,
              first_name,
              last_name,
              email,
              phone,
              address
            ),
            vehicles:vehicle_id (
              id,
              make,
              model,
              year,
              license_plate,
              vin
            )
          `)
          .eq('id', workOrderId)
          .single();

        if (workOrderError) {
          throw workOrderError;
        }

        if (workOrderData) {
          // Create a properly typed WorkOrder object
          const workOrderObject: WorkOrder = {
            id: workOrderData.id,
            status: workOrderData.status as WorkOrderStatus,
            description: workOrderData.description || '',
            customer_id: workOrderData.customer_id,
            vehicle_id: workOrderData.vehicle_id,
            advisor_id: workOrderData.advisor_id,
            technician_id: workOrderData.technician_id,
            estimated_hours: workOrderData.estimated_hours,
            total_cost: workOrderData.total_cost,
            created_by: workOrderData.created_by,
            created_at: workOrderData.created_at,
            updated_at: workOrderData.updated_at,
            start_time: workOrderData.start_time,
            end_time: workOrderData.end_time,
            service_category_id: workOrderData.service_category_id,
            invoiced_at: workOrderData.invoiced_at,
            service_type: workOrderData.service_type,
            invoice_id: workOrderData.invoice_id,
            work_order_number: workOrderData.work_order_number,
            // Add backward compatibility fields
            technician: '', // Will be populated from technician lookup
            priority: 'medium', // Default value as this field doesn't exist in DB yet
            notes: workOrderData.description || '',
            timeEntries: [],
            inventoryItems: [],
          };

          setWorkOrder(workOrderObject);

          // Set form values with proper field names
          const customer = workOrderData.customers;
          const vehicle = workOrderData.vehicles;

          form.reset({
            customerId: customer?.id || '',
            customer: customer ? `${customer.first_name} ${customer.last_name}`.trim() : '',
            customerEmail: customer?.email || '',
            customerPhone: customer?.phone || '',
            customerAddress: customer?.address || '',
            vehicleId: vehicle?.id || '',
            vehicleMake: vehicle?.make || '',
            vehicleModel: vehicle?.model || '',
            vehicleYear: vehicle?.year?.toString() || '',
            licensePlate: vehicle?.license_plate || '', // Use licensePlate
            vehicleVin: vehicle?.vin || '',
            description: workOrderData.description || '',
            status: workOrderData.status || 'pending',
            priority: 'medium', // Default as this field doesn't exist in DB yet
            technicianId: workOrderData.technician_id || '',
            notes: workOrderData.description || '',
            inventoryItems: [], // Will be populated from separate query if needed
          });
        }
      } catch (err) {
        console.error('Error loading work order data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load work order data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [workOrderId, fetchProfiles, form]);

  const handleSubmit = async (data: WorkOrderEditFormValues) => {
    if (!workOrder) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Map form data to WorkOrder format
      const updatedWorkOrder: Partial<WorkOrder> = {
        id: workOrder.id,
        description: data.description,
        status: data.status as WorkOrderStatus,
        technician_id: data.technicianId,
        customer_id: data.customerId,
        vehicle_id: data.vehicleId,
        updated_at: new Date().toISOString(),
      };

      // Convert inventory items to proper format if they exist
      if (data.inventoryItems && data.inventoryItems.length > 0) {
        const inventoryItems: WorkOrderInventoryItem[] = data.inventoryItems.map(item => ({
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
          supplierOrderRef: item.supplierOrderRef,
        }));
        updatedWorkOrder.inventoryItems = inventoryItems;
      }

      await updateWorkOrder(workOrder.id, updatedWorkOrder);
      
      // Update local state
      setWorkOrder(prev => prev ? { ...prev, ...updatedWorkOrder } : null);
      
    } catch (err) {
      console.error('Error updating work order:', err);
      setError(err instanceof Error ? err.message : 'Failed to update work order');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    workOrder,
    technicians,
    isLoading,
    isSubmitting,
    error,
    onSubmit: handleSubmit,
  };
}
