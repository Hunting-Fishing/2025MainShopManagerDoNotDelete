import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { InventoryItemExtended, AutoReorderSettings, ReorderSettings } from '@/types/inventory';
import { useInventoryData } from './useInventoryData';
import { toast } from '@/hooks/use-toast';

interface ReorderAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  priority: 'high' | 'medium' | 'low';
  lastOrderDate?: string;
  averageUsage: number;
  estimatedStockoutDate: string;
}

interface AutoReorderRule {
  id: string;
  itemId: string;
  enabled: boolean;
  reorderPoint: number;
  reorderQuantity: number;
  maxStock: number;
  vendorId?: string;
  leadTimeDays: number;
  seasonalMultiplier?: number;
  lastExecuted?: string;
}

export function useAutomatedReordering() {
  const queryClient = useQueryClient();
  const { items } = useInventoryData();
  const [reorderSettings, setReorderSettings] = useState<ReorderSettings>({});

  // Calculate reorder alerts
  const reorderAlerts = useMemo((): ReorderAlert[] => {
    if (!items.length) return [];

    return items
      .filter(item => {
        const quantity = Number(item.quantity) || 0;
        const reorderPoint = Number(item.reorder_point) || 0;
        return quantity <= reorderPoint && reorderPoint > 0;
      })
      .map(item => {
        const currentStock = Number(item.quantity) || 0;
        const reorderPoint = Number(item.reorder_point) || 0;
        const averageUsage = Math.random() * 10 + 5; // Mock usage data
        const daysUntilStockout = currentStock / averageUsage;
        
        const priority: 'high' | 'medium' | 'low' = currentStock === 0 ? 'high' : 
                        currentStock <= reorderPoint * 0.5 ? 'high' :
                        currentStock <= reorderPoint * 0.8 ? 'medium' : 'low';

        const estimatedStockoutDate = new Date();
        estimatedStockoutDate.setDate(estimatedStockoutDate.getDate() + Math.max(0, daysUntilStockout));

        return {
          id: `alert-${item.id}`,
          itemId: item.id,
          itemName: item.name,
          currentStock,
          reorderPoint,
          suggestedQuantity: Math.ceil(reorderPoint * 2 - currentStock),
          priority,
          averageUsage,
          estimatedStockoutDate: estimatedStockoutDate.toISOString().split('T')[0]
        };
      })
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }, [items]);

  // Fetch auto-reorder rules
  const {
    data: autoReorderRules = [],
    isLoading: rulesLoading,
    refetch: refetchRules
  } = useQuery({
    queryKey: ['auto-reorder-rules'],
    queryFn: async () => {
      console.log('🔄 Fetching auto-reorder rules');
      
      // Mock rules data
      const mockRules: AutoReorderRule[] = items.slice(0, 5).map((item, index) => ({
        id: `rule-${item.id}`,
        itemId: item.id,
        enabled: index % 2 === 0,
        reorderPoint: Number(item.reorder_point) || 10,
        reorderQuantity: 50,
        maxStock: 100,
        leadTimeDays: 7,
        seasonalMultiplier: 1.0
      }));
      
      console.log('✅ Fetched', mockRules.length, 'auto-reorder rules');
      return mockRules;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Create or update auto-reorder rule
  const saveReorderRuleMutation = useMutation({
    mutationFn: async (rule: Omit<AutoReorderRule, 'id'>) => {
      console.log('🔄 Saving auto-reorder rule:', rule);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const savedRule: AutoReorderRule = {
        ...rule,
        id: `rule-${rule.itemId}`,
        lastExecuted: undefined
      };
      
      console.log('✅ Saved auto-reorder rule:', savedRule);
      return savedRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-reorder-rules'] });
      toast({
        title: "Rule Saved",
        description: "Auto-reorder rule has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('❌ Error saving auto-reorder rule:', error);
      toast({
        title: "Error",
        description: "Failed to save auto-reorder rule.",
        variant: "destructive",
      });
    }
  });

  // Execute automatic reordering
  const executeAutoReorderMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Executing automatic reordering');
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const executedRules = autoReorderRules.filter(rule => rule.enabled);
      console.log('✅ Executed', executedRules.length, 'auto-reorder rules');
      
      return {
        executed: executedRules.length,
        ordersCreated: Math.floor(executedRules.length * 0.7), // Some rules may not trigger
        totalValue: executedRules.length * 500 // Mock total value
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['auto-reorder-rules'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      
      toast({
        title: "Auto Reordering Completed",
        description: `Created ${result.ordersCreated} purchase orders worth $${result.totalValue.toLocaleString()}.`,
      });
    },
    onError: (error) => {
      console.error('❌ Error executing auto-reorder:', error);
      toast({
        title: "Error",
        description: "Failed to execute automatic reordering.",
        variant: "destructive",
      });
    }
  });

  // Dismiss reorder alert
  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      console.log('🔄 Dismissing reorder alert:', alertId);
      await new Promise(resolve => setTimeout(resolve, 300));
      return alertId;
    },
    onSuccess: () => {
      // In real app, this would update the backend to mark alert as dismissed
      toast({
        title: "Alert Dismissed",
        description: "Reorder alert has been dismissed.",
      });
    }
  });

  const saveReorderRule = useCallback((rule: Omit<AutoReorderRule, 'id'>) => {
    return saveReorderRuleMutation.mutateAsync(rule);
  }, [saveReorderRuleMutation]);

  const executeAutoReorder = useCallback(() => {
    return executeAutoReorderMutation.mutateAsync();
  }, [executeAutoReorderMutation]);

  const dismissAlert = useCallback((alertId: string) => {
    return dismissAlertMutation.mutateAsync(alertId);
  }, [dismissAlertMutation]);

  // Calculate reorder insights
  const insights = useMemo(() => {
    const totalAlerts = reorderAlerts.length;
    const highPriorityAlerts = reorderAlerts.filter(a => a.priority === 'high').length;
    const estimatedValue = reorderAlerts.reduce((sum, alert) => 
      sum + (alert.suggestedQuantity * 25), 0 // Mock unit price of $25
    );
    const activeRules = autoReorderRules.filter(r => r.enabled).length;

    return {
      totalAlerts,
      highPriorityAlerts,
      estimatedReorderValue: estimatedValue,
      activeRules,
      automationCoverage: items.length > 0 ? (activeRules / items.length) * 100 : 0
    };
  }, [reorderAlerts, autoReorderRules, items.length]);

  return {
    // Data
    reorderAlerts,
    autoReorderRules,
    insights,
    
    // Loading states
    isLoading: rulesLoading,
    isSaving: saveReorderRuleMutation.isPending,
    isExecuting: executeAutoReorderMutation.isPending,
    isDismissing: dismissAlertMutation.isPending,
    
    // Actions
    saveReorderRule,
    executeAutoReorder,
    dismissAlert,
    refetchRules
  };
}