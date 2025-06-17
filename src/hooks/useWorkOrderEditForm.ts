
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { workOrderFormSchema, type WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { 
  getWorkOrderById, 
  updateWorkOrder,
  getWorkOrderJobLines,
  getWorkOrderParts,
  getWorkOrderTimeEntries
} from "@/services/workOrder";
import { getAllTeamMembers } from "@/services/team";
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";
import { WorkOrderPart } from "@/types/workOrderPart";

export const useWorkOrderEditForm = (workOrderId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch work order data
  const { data: workOrder, isLoading: workOrderLoading, error: workOrderError } = useQuery({
    queryKey: ['workOrder', workOrderId],
    queryFn: () => getWorkOrderById(workOrderId),
    enabled: !!workOrderId,
  });

  // Fetch technicians
  const { data: technicians = [], isLoading: technicianLoading, error: technicianError } = useQuery({
    queryKey: ['technicians'],
    queryFn: getAllTeamMembers,
  });

  // Fetch job lines
  const { data: jobLines = [] } = useQuery({
    queryKey: ['workOrderJobLines', workOrderId],
    queryFn: () => getWorkOrderJobLines(workOrderId),
    enabled: !!workOrderId,
  });

  // Fetch parts
  const { data: parts = [] } = useQuery({
    queryKey: ['workOrderParts', workOrderId],
    queryFn: () => getWorkOrderParts(workOrderId),
    enabled: !!workOrderId,
  });

  // Fetch time entries
  const { data: timeEntries = [] } = useQuery({
    queryKey: ['workOrderTimeEntries', workOrderId],
    queryFn: () => getWorkOrderTimeEntries(workOrderId),
    enabled: !!workOrderId,
  });

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      description: "",
      status: "pending",
      priority: "medium",
      technicianId: "",
      notes: "",
      inventoryItems: [],
    },
  });

  // Initialize form with work order data
  useEffect(() => {
    if (workOrder) {
      // Ensure inventory items have required fields with proper typing
      const inventoryItems: WorkOrderInventoryItem[] = (workOrder.inventoryItems || []).map(item => ({
        id: item.id || crypto.randomUUID(), // Ensure id is always present
        name: item.name || "",
        sku: item.sku || "",
        category: item.category || "",
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        total: item.total || (item.quantity || 0) * (item.unit_price || 0),
        // Include all optional fields that might be present
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

      form.reset({
        description: workOrder.description || "",
        status: workOrder.status || "pending",
        priority: workOrder.priority || "medium", 
        technicianId: workOrder.technician_id || "",
        notes: workOrder.notes || "",
        inventoryItems,
      });
    }
  }, [workOrder, form]);

  // Update work order mutation
  const updateMutation = useMutation({
    mutationFn: async (values: WorkOrderFormSchemaValues) => {
      // Ensure all inventory items have required fields before updating
      const validatedInventoryItems: WorkOrderInventoryItem[] = values.inventoryItems.map(item => ({
        id: item.id || crypto.randomUUID(), // Ensure id is always present
        name: item.name || "",
        sku: item.sku || "",
        category: item.category || "",
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        total: item.total || (item.quantity || 0) * (item.unit_price || 0),
        // Include all optional fields
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

      const updateData: Partial<WorkOrder> = {
        notes: values.notes,
        status: values.status,
        priority: values.priority,
        description: values.description,
        technician_id: values.technicianId,
        inventoryItems: validatedInventoryItems,
      };
      
      return updateWorkOrder(workOrderId, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Work order updated successfully",
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['workOrder', workOrderId] });
      queryClient.invalidateQueries({ queryKey: ['workOrders'] });
    },
    onError: (error: any) => {
      console.error('Update work order error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update work order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: WorkOrderFormSchemaValues) => {
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    isSubmitting,
    workOrder,
    workOrderLoading,
    workOrderError: workOrderError as Error | null,
    technicians,
    technicianLoading,
    technicianError: technicianError as string | null,
    jobLines: jobLines as WorkOrderJobLine[],
    parts: parts as WorkOrderPart[],
    timeEntries: timeEntries as TimeEntry[],
  };
};
