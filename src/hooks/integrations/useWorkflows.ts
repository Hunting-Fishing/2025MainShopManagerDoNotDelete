import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IntegrationWorkflow {
  id: string;
  shop_id: string;
  integration_id: string;
  name: string;
  description: string | null;
  trigger_type: 'webhook' | 'schedule' | 'manual' | 'data_change';
  trigger_config: any;
  actions: any[];
  conditions: any[];
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  run_count: number;
  success_count: number;
  failure_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  trigger_data: any;
  execution_status: 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
  execution_log: any[];
  execution_time_ms: number | null;
  retry_count: number;
  created_at: string;
}

export function useWorkflows(integrationId?: string) {
  const [workflows, setWorkflows] = useState<IntegrationWorkflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('integration_workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (integrationId) {
        query = query.eq('integration_id', integrationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflows',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExecutions = async (workflowId?: string) => {
    try {
      let query = supabase
        .from('workflow_executions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100);

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error('Error fetching workflow executions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflow executions',
        variant: 'destructive'
      });
    }
  };

  const createWorkflow = async (workflow: Partial<IntegrationWorkflow>) => {
    try {
      const { data, error } = await supabase
        .from('integration_workflows')
        .insert([workflow])
        .select()
        .single();

      if (error) throw error;

      setWorkflows(prev => [data, ...prev]);
      toast({
        title: 'Success',
        description: 'Workflow created successfully'
      });

      return data;
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to create workflow',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateWorkflow = async (id: string, updates: Partial<IntegrationWorkflow>) => {
    try {
      const { data, error } = await supabase
        .from('integration_workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setWorkflows(prev => prev.map(w => w.id === id ? data : w));
      toast({
        title: 'Success',
        description: 'Workflow updated successfully'
      });

      return data;
    } catch (error) {
      console.error('Error updating workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update workflow',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('integration_workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkflows(prev => prev.filter(w => w.id !== id));
      toast({
        title: 'Success',
        description: 'Workflow deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workflow',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const triggerWorkflow = async (workflowId: string, triggerData: any = {}) => {
    try {
      const { data, error } = await supabase.rpc('trigger_integration_workflow', {
        p_workflow_id: workflowId,
        p_trigger_data: triggerData
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Workflow triggered successfully'
      });

      // Refresh executions
      await fetchExecutions(workflowId);
      return data;
    } catch (error) {
      console.error('Error triggering workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to trigger workflow',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [integrationId]);

  return {
    workflows,
    executions,
    isLoading,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    triggerWorkflow,
    fetchExecutions,
    refetch: fetchWorkflows
  };
}