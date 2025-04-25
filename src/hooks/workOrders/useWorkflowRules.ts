
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { WorkOrderStatusType } from '@/types/workOrder';

// Define the WorkflowRule interface
export interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  trigger_status: WorkOrderStatusType;
  next_status: WorkOrderStatusType;
  conditions: any;
  actions: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useWorkflowRules() {
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflowRules();
  }, []);

  const fetchWorkflowRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workflow_rules')
        .select('*');

      if (error) throw error;

      // Map the data to ensure type safety
      const typedRules: WorkflowRule[] = data?.map(rule => ({
        ...rule,
        trigger_status: rule.trigger_status as WorkOrderStatusType,
        next_status: rule.next_status as WorkOrderStatusType
      })) || [];

      setRules(typedRules);
    } catch (err) {
      console.error('Error fetching workflow rules:', err);
      setError('Failed to load workflow rules');
    } finally {
      setLoading(false);
    }
  };

  const createWorkflowRule = async (rule: Omit<WorkflowRule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .insert([rule])
        .select();

      if (error) throw error;

      const newRule = data?.[0];
      if (newRule) {
        setRules(prevRules => [...prevRules, {
          ...newRule,
          trigger_status: newRule.trigger_status as WorkOrderStatusType,
          next_status: newRule.next_status as WorkOrderStatusType
        }]);
      }

      toast({
        title: 'Success',
        description: 'Workflow rule created successfully',
      });

      return newRule;
    } catch (err) {
      console.error('Error creating workflow rule:', err);
      toast({
        title: 'Error',
        description: 'Failed to create workflow rule',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateWorkflowRule = async (id: string, updates: Partial<WorkflowRule>) => {
    try {
      const { data, error } = await supabase
        .from('workflow_rules')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      const updatedRule = data?.[0];
      if (updatedRule) {
        setRules(prevRules => 
          prevRules.map(rule => 
            rule.id === id ? {
              ...rule,
              ...updatedRule,
              trigger_status: updatedRule.trigger_status as WorkOrderStatusType,
              next_status: updatedRule.next_status as WorkOrderStatusType
            } : rule
          )
        );
      }

      toast({
        title: 'Success',
        description: 'Workflow rule updated successfully',
      });

      return updatedRule;
    } catch (err) {
      console.error('Error updating workflow rule:', err);
      toast({
        title: 'Error',
        description: 'Failed to update workflow rule',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteWorkflowRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workflow_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRules(prevRules => prevRules.filter(rule => rule.id !== id));

      toast({
        title: 'Success',
        description: 'Workflow rule deleted successfully',
      });

      return true;
    } catch (err) {
      console.error('Error deleting workflow rule:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete workflow rule',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    rules,
    loading,
    error,
    fetchWorkflowRules,
    createWorkflowRule,
    updateWorkflowRule,
    deleteWorkflowRule
  };
}
