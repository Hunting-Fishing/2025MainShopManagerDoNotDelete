
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';
import { WorkOrder, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderFormSchemaValues, workOrderFormSchema } from '@/schemas/workOrderSchema';
import { updateWorkOrder } from '@/services/workOrder';
import { getUniqueTechnicians } from '@/services/workOrder';
import { handleApiError } from '@/utils/errorHandling';
import { v4 as uuidv4 } from 'uuid';

interface UseWorkOrderEditFormProps {
  workOrder: WorkOrder;
  onSuccess?: () => void;
}

export function useWorkOrderEditForm({ workOrder, onSuccess }: UseWorkOrderEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [technicians, setTechnicians] = useState<Array<{ id: string; name: string; jobTitle?: string }>>([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(true);
  const [technicianError, setTechnicianError] = useState<string | null>(null);

  // Form setup with validation
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customerId: workOrder.customer_id || '',
      customer: workOrder.customer_name || workOrder.customer || '',
      customerEmail: workOrder.customer_email || '',
      customerPhone: workOrder.customer_phone || '',
      customerAddress: workOrder.customer_address || '',
      vehicleId: workOrder.vehicle_id || '',
      vehicleMake: workOrder.vehicle_make || '',
      vehicleModel: workOrder.vehicle_model || '',
      vehicleYear: workOrder.vehicle_year || '',
      licensePlate: workOrder.vehicle_license_plate || '',
      vin: workOrder.vehicle_vin || '',
      odometer: workOrder.vehicle_odometer || '',
      description: workOrder.description || '',
      status: workOrder.status,
      priority: 'medium',
      technicianId: workOrder.technician_id || '',
      location: workOrder.location || '',
      dueDate: workOrder.due_date || workOrder.dueDate || '',
      notes: workOrder.notes || '',
      inventoryItems: (workOrder.inventoryItems || workOrder.inventory_items || []).map(item => ({
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
        supplierOrderRef: item.supplierOrderRef
      }))
    }
  });

  // Load technicians
  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        setIsLoadingTechnicians(true);
        setTechnicianError(null);
        const techData = await getUniqueTechnicians();
        setTechnicians(techData || []);
      } catch (error) {
        console.error('Error loading technicians:', error);
        setTechnicianError('Failed to load technicians');
        setTechnicians([]);
      } finally {
        setIsLoadingTechnicians(false);
      }
    };

    loadTechnicians();
  }, []);

  // Submit handler
  const handleSubmit = async (data: WorkOrderFormSchemaValues) => {
    setIsSubmitting(true);
    
    try {
      // Transform form data to work order format
      const updatedWorkOrder: Partial<WorkOrder> = {
        id: workOrder.id,
        customer_id: data.customerId,
        customer_name: data.customer,
        customer_email: data.customerEmail,
        customer_phone: data.customerPhone,
        customer_address: data.customerAddress,
        vehicle_id: data.vehicleId,
        vehicle_make: data.vehicleMake,
        vehicle_model: data.vehicleModel,
        vehicle_year: data.vehicleYear,
        vehicle_license_plate: data.licensePlate,
        vehicle_vin: data.vin,
        vehicle_odometer: data.odometer,
        description: data.description,
        status: data.status as WorkOrder['status'],
        priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
        technician_id: data.technicianId,
        location: data.location,
        due_date: data.dueDate,
        notes: data.notes,
        // Map inventory items with all required fields
        inventoryItems: data.inventoryItems?.map(item => ({
          id: item.id || uuidv4(), // Ensure id is always present
          name: item.name || '',
          sku: item.sku || '',
          category: item.category || '',
          quantity: item.quantity || 0,
          unit_price: item.unit_price || 0,
          total: item.total || (item.quantity || 0) * (item.unit_price || 0),
          notes: item.notes,
          itemStatus: item.itemStatus,
          estimatedArrivalDate: item.estimatedArrivalDate,
          supplierName: item.supplierName,
          supplierCost: 0,
          customerPrice: item.unit_price || 0,
          retailPrice: item.unit_price || 0,
          partType: 'part',
          markupPercentage: 0,
          isTaxable: false,
          coreChargeAmount: 0,
          coreChargeApplied: false,
          warrantyDuration: '',
          invoiceNumber: '',
          poLine: '',
          isStockItem: false,
          notesInternal: '',
          inventoryItemId: '',
          supplierOrderRef: item.supplierOrderRef
        } as WorkOrderInventoryItem)) || []
      };

      await updateWorkOrder(workOrder.id, updatedWorkOrder);

      toast({
        title: "Success",
        description: "Work order updated successfully",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating work order:', error);
      handleApiError(error, 'Failed to update work order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    technicians,
    isLoadingTechnicians,
    technicianError,
    onSubmit: handleSubmit
  };
}
