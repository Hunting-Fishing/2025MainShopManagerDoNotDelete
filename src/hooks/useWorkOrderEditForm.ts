
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

import { getWorkOrderById, updateWorkOrder } from '@/services/workOrder';
import { getAllCustomers } from '@/services/customer';
import { getProfiles } from '@/services/profiles';
import { WorkOrderFormSchemaValues, workOrderFormSchema } from '@/schemas/workOrderSchema';
import { WorkOrder, WorkOrderInventoryItem } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { WorkOrderStatus } from '@/utils/workOrders/constants';

interface Technician {
  id: string;
  name: string;
  jobTitle?: string;
}

export interface UseWorkOrderEditFormReturn {
  form: ReturnType<typeof useForm<WorkOrderFormSchemaValues>>;
  workOrder: WorkOrder | null;
  customers: Customer[];
  technicians: Technician[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (data: WorkOrderFormSchemaValues) => Promise<void>;
}

export function useWorkOrderEditForm(workOrderId: string): UseWorkOrderEditFormReturn {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      technician: '',
      location: '',
      dueDate: '',
      notes: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      licensePlate: '',
      vin: '',
      odometer: '',
      inventoryItems: []
    }
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load work order data
        const workOrderData = await getWorkOrderById(workOrderId);
        if (!workOrderData) {
          throw new Error('Work order not found');
        }
        setWorkOrder(workOrderData);

        // Load customers
        const customersData = await getAllCustomers();
        setCustomers(customersData || []);

        // Load technicians from profiles
        const profilesData = await getProfiles();
        const techniciansList = profilesData?.map(profile => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
          jobTitle: profile.job_title || undefined
        })) || [];
        setTechnicians(techniciansList);

        // Populate form with work order data
        const formData: WorkOrderFormSchemaValues = {
          customer: workOrderData.customer_name || workOrderData.customer || '',
          description: workOrderData.description || '',
          status: (workOrderData.status as WorkOrderStatus) || 'pending',
          priority: (workOrderData.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
          technician: workOrderData.technician_id || workOrderData.technician || '',
          location: workOrderData.location || '',
          dueDate: workOrderData.due_date || workOrderData.dueDate || '',
          notes: workOrderData.notes || '',
          vehicleMake: workOrderData.vehicle_make || '',
          vehicleModel: workOrderData.vehicle_model || '',
          vehicleYear: workOrderData.vehicle_year || '',
          licensePlate: workOrderData.vehicle_license_plate || '',
          vin: workOrderData.vehicle_vin || '',
          odometer: workOrderData.vehicle_odometer || '',
          inventoryItems: (workOrderData.inventoryItems || workOrderData.inventory_items || []).map((item: any): WorkOrderInventoryItem => ({
            id: item.id || uuidv4(),
            name: item.name || '',
            sku: item.sku || '',
            category: item.category || '',
            quantity: item.quantity || 0,
            unit_price: item.unit_price || item.customerPrice || 0,
            total: item.total || (item.quantity || 0) * (item.unit_price || item.customerPrice || 0),
            notes: item.notes || '',
            itemStatus: item.itemStatus || item.status,
            estimatedArrivalDate: item.estimatedArrivalDate,
            supplierName: item.supplierName,
            supplierCost: item.supplierCost,
            customerPrice: item.customerPrice || item.unit_price,
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
          }))
        };

        form.reset(formData);
      } catch (err) {
        console.error('Error loading work order data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load work order data');
      } finally {
        setIsLoading(false);
      }
    };

    if (workOrderId && workOrderId !== 'new') {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [workOrderId, form]);

  const onSubmit = async (data: WorkOrderFormSchemaValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (!workOrder) {
        throw new Error('No work order data available');
      }

      // Prepare update data
      const updateData: Partial<WorkOrder> = {
        ...workOrder,
        customer_name: data.customer,
        description: data.description,
        status: data.status as WorkOrderStatus,
        priority: data.priority,
        technician_id: data.technician,
        location: data.location,
        due_date: data.dueDate,
        notes: data.notes,
        vehicle_make: data.vehicleMake,
        vehicle_model: data.vehicleModel,
        vehicle_year: data.vehicleYear,
        vehicle_license_plate: data.licensePlate,
        vehicle_vin: data.vin,
        vehicle_odometer: data.odometer,
        inventoryItems: data.inventoryItems,
        updated_at: new Date().toISOString()
      };

      await updateWorkOrder(workOrderId, updateData);
      
      toast.success('Work order updated successfully');
    } catch (err) {
      console.error('Error updating work order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update work order';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    workOrder,
    customers,
    technicians,
    isLoading,
    isSubmitting,
    error,
    onSubmit: form.handleSubmit(onSubmit)
  };
}
