
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkOrderStatusType } from '@/types/workOrder';
import { toast } from '@/hooks/use-toast';

interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  trigger_status: WorkOrderStatusType;
  next_status: WorkOrderStatusType;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  is_active: boolean;
}

export function useWorkflowRules() {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflowRules();
  }, []);

  const fetchWorkflowRules = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching workflow rules:', error);
      toast({
        title: "Error",
        description: "Failed to load workflow rules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const evaluateWorkflowRules = async (workOrder: any) => {
    const applicableRules = rules.filter(rule => 
      rule.is_active && rule.trigger_status === workOrder.status
    );

    for (const rule of applicableRules) {
      if (await evaluateConditions(rule.conditions, workOrder)) {
        return rule.next_status;
      }
    }
    return null;
  };

  const evaluateConditions = async (conditions: Record<string, any>, workOrder: any) => {
    // Basic condition evaluation - can be expanded based on needs
    if (!conditions || Object.keys(conditions).length === 0) return true;
    
    // Example: Check if all required fields are filled
    if (conditions.requiredFields) {
      return conditions.requiredFields.every((field: string) => 
        workOrder[field] != null && workOrder[field] !== ''
      );
    }
    
    return true;
  };

  return {
    rules,
    loading,
    evaluateWorkflowRules
  };
}
