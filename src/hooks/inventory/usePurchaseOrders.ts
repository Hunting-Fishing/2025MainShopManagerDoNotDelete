import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { InventoryPurchaseOrder, InventoryPurchaseOrderItem } from '@/types/inventory';
import { toast } from '@/hooks/use-toast';

interface CreatePurchaseOrderParams {
  vendorId: string;
  items: Array<{
    inventory_item_id: string;
    quantity: number;
    unitPrice: number;
  }>;
  expectedDeliveryDate?: string;
  notes?: string;
}

interface PurchaseOrderFilters {
  status?: string;
  vendorId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Mock data
const mockPurchaseOrders: InventoryPurchaseOrder[] = [
  {
    id: '1',
    vendor_id: 'vendor-1',
    order_date: '2024-01-15',
    expected_delivery_date: '2024-01-22',
    total_amount: 1250.00,
    status: 'pending',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    notes: 'Urgent order for brake pads'
  }
];

export function usePurchaseOrders() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PurchaseOrderFilters>({});

  const {
    data: purchaseOrders = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['purchase-orders', filters],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockPurchaseOrders;
    },
    staleTime: 5 * 60 * 1000,
  });

  const createPurchaseOrderMutation = useMutation({
    mutationFn: async (params: CreatePurchaseOrderParams) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newOrder: InventoryPurchaseOrder = {
        id: `po-${Date.now()}`,
        vendor_id: params.vendorId,
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: params.expectedDeliveryDate,
        total_amount: params.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        notes: params.notes
      };
      
      return newOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast({
        title: "Purchase Order Created",
        description: "Purchase order has been created successfully.",
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast({
        title: "Status Updated",
        description: "Purchase order status has been updated successfully.",
      });
    }
  });

  const createPurchaseOrder = useCallback((params: CreatePurchaseOrderParams) => {
    return createPurchaseOrderMutation.mutateAsync(params);
  }, [createPurchaseOrderMutation]);

  const updateStatus = useCallback((id: string, status: string) => {
    return updateStatusMutation.mutateAsync({ id, status });
  }, [updateStatusMutation]);

  const updateFilters = useCallback((newFilters: Partial<PurchaseOrderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const generateAutoOrders = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Auto Orders Generated",
      description: "3 purchase orders have been automatically generated for low stock items.",
    });
    queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
  }, [queryClient]);

  return {
    purchaseOrders,
    filters,
    isLoading,
    error,
    isCreating: createPurchaseOrderMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    createPurchaseOrder,
    updateStatus,
    updateFilters,
    generateAutoOrders,
    refetch
  };
}