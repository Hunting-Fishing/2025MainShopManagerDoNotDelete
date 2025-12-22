import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  TrendingUp, 
  Zap, 
  Clock,
  Activity,
  Database,
  Plus
} from 'lucide-react';

interface IntegrationWorkflowsTabProps {
  integrationId: string;
  providerId?: string | null;
}

const successMetricTypes = new Set(['sync_success', 'workflow_success']);
const failureMetricTypes = new Set(['sync_failure', 'workflow_failure']);
const durationMetricTypes = new Set(['execution_time_ms', 'execution_duration_ms']);
const dataMetricTypes = new Set(['records_synced', 'data_synced']);

const mapTemplateTriggerType = (trigger?: string) => {
  if (!trigger) return 'manual';
  const normalized = trigger.toLowerCase();
  if (normalized.includes('schedule') || normalized.includes('cron')) return 'schedule';
  if (normalized.includes('webhook')) return 'webhook';
  return 'data_change';
};

export function IntegrationWorkflowsTab({ integrationId, providerId }: IntegrationWorkflowsTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    triggerType: 'manual'
  });

  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['integration-workflows', integrationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_workflows')
        .select('*')
        .eq('integration_id', integrationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const sinceDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString();
  }, []);

  const { data: analytics = [], isLoading: analyticsLoading } = useQuery({
    queryKey: ['integration-analytics', integrationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_analytics')
        .select('metric_type, metric_value, recorded_at, time_bucket')
        .eq('integration_id', integrationId)
        .gte('recorded_at', sinceDate);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: fieldMappings = [], isLoading: mappingsLoading } = useQuery({
    queryKey: ['integration-field-mappings', integrationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_field_mappings')
        .select('*')
        .eq('integration_id', integrationId)
        .order('entity_type', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['integration-templates', providerId],
    enabled: Boolean(providerId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_templates')
        .select('*')
        .eq('provider_id', providerId as string)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('shop_id')
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile?.shop_id) throw new Error('No shop assigned to user');

      const payload = {
        shop_id: profile.shop_id,
        integration_id: integrationId,
        name: createForm.name.trim(),
        description: createForm.description.trim() || null,
        trigger_type: createForm.triggerType,
        is_active: true,
        created_by: userId
      };

      const { error } = await supabase
        .from('integration_workflows')
        .insert(payload);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Workflow created', description: 'Your workflow is ready to configure.' });
      setIsCreateOpen(false);
      setCreateForm({ name: '', description: '', triggerType: 'manual' });
      queryClient.invalidateQueries({ queryKey: ['integration-workflows', integrationId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Workflow creation failed',
        description: error?.message || 'Unable to create workflow.',
        variant: 'destructive'
      });
    }
  });

  const toggleWorkflowMutation = useMutation({
    mutationFn: async ({ workflowId, isActive }: { workflowId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('integration_workflows')
        .update({ is_active: isActive })
        .eq('id', workflowId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-workflows', integrationId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error?.message || 'Unable to update workflow.',
        variant: 'destructive'
      });
    }
  });

  const runWorkflowMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      const { error } = await supabase.rpc('trigger_integration_workflow', {
        p_workflow_id: workflowId,
        p_trigger_data: {}
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Workflow triggered', description: 'Execution started.' });
      queryClient.invalidateQueries({ queryKey: ['integration-workflows', integrationId] });
      queryClient.invalidateQueries({ queryKey: ['integration-analytics', integrationId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Run failed',
        description: error?.message || 'Unable to trigger workflow.',
        variant: 'destructive'
      });
    }
  });

  const applyTemplateMutation = useMutation({
    mutationFn: async (template: any) => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('shop_id')
        .or(`id.eq.${userId},user_id.eq.${userId}`)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile?.shop_id) throw new Error('No shop assigned to user');

      const workflows = Array.isArray(template.workflow_templates)
        ? template.workflow_templates
        : [];

      if (workflows.length === 0) {
        throw new Error('This template does not include workflow definitions.');
      }

      const payload = workflows.map((entry: any) => ({
        shop_id: profile.shop_id,
        integration_id: integrationId,
        name: entry.name || template.name,
        description: template.description || null,
        trigger_type: mapTemplateTriggerType(entry.trigger),
        trigger_config: entry.trigger ? { trigger: entry.trigger } : {},
        actions: entry.actions || [],
        conditions: entry.conditions || [],
        is_active: true,
        created_by: userId
      }));

      const { error } = await supabase
        .from('integration_workflows')
        .insert(payload);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Template applied', description: 'Workflows have been created.' });
      queryClient.invalidateQueries({ queryKey: ['integration-workflows', integrationId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Template failed',
        description: error?.message || 'Unable to apply template.',
        variant: 'destructive'
      });
    }
  });

  const metrics = useMemo(() => {
    const totalExecutions = workflows.reduce((sum, workflow) => sum + (workflow.run_count || 0), 0);
    const successCount = workflows.reduce((sum, workflow) => sum + (workflow.success_count || 0), 0);
    const failureCount = workflows.reduce((sum, workflow) => sum + (workflow.failure_count || 0), 0);
    const successRate = totalExecutions > 0 ? Math.round((successCount / totalExecutions) * 1000) / 10 : 0;

    const durationMetrics = analytics.filter(entry => durationMetricTypes.has(entry.metric_type));
    const durationTotal = durationMetrics.reduce((sum, entry) => sum + Number(entry.metric_value || 0), 0);
    const avgExecutionTime = durationMetrics.length > 0 ? durationTotal / durationMetrics.length : 0;

    const dataSynced = analytics
      .filter(entry => dataMetricTypes.has(entry.metric_type))
      .reduce((sum, entry) => sum + Number(entry.metric_value || 0), 0);

    return {
      totalExecutions,
      successRate,
      failureCount,
      avgExecutionTime,
      dataSynced
    };
  }, [workflows, analytics]);

  const chartData = useMemo(() => {
    const days: { date: string; successRate: number }[] = [];
    const dayMap = new Map<string, { success: number; failure: number }>();

    analytics.forEach(entry => {
      const dateValue = entry.time_bucket || entry.recorded_at;
      if (!dateValue) return;
      const dayKey = new Date(dateValue).toISOString().slice(0, 10);
      const metricValue = Number(entry.metric_value || 0);
      const bucket = dayMap.get(dayKey) || { success: 0, failure: 0 };

      if (successMetricTypes.has(entry.metric_type)) {
        bucket.success += metricValue;
      } else if (failureMetricTypes.has(entry.metric_type)) {
        bucket.failure += metricValue;
      }

      dayMap.set(dayKey, bucket);
    });

    for (let i = 29; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const bucket = dayMap.get(key);
      const total = bucket ? bucket.success + bucket.failure : 0;
      const successRate = total > 0 ? Math.round((bucket!.success / total) * 100) : 0;
      days.push({ date: key, successRate });
    }

    return days;
  }, [analytics]);

  const formatRelativeTime = (timestamp?: string | null) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMinutes = Math.round((now - then) / 60000);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} days ago`;
  };

  const formatDuration = (durationMs: number) => {
    if (!durationMs) return '0s';
    const seconds = Math.round(durationMs / 100) / 10;
    return `${seconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Integration Workflows</h3>
          <p className="text-sm text-muted-foreground">
            Automate data synchronization and business processes
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="field-mapping">Field Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {workflowsLoading ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Loading workflows...
                </CardContent>
              </Card>
            ) : workflows.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  No workflows configured for this integration yet.
                </CardContent>
              </Card>
            ) : (
              workflows.map(workflow => {
                const totalRuns = workflow.run_count || 0;
                const successRate = totalRuns > 0
                  ? Math.round(((workflow.success_count || 0) / totalRuns) * 100)
                  : Math.round(workflow.success_rate || 0);

                return (
                  <WorkflowCard
                    key={workflow.id}
                    name={workflow.name}
                    description={workflow.description || 'No description provided'}
                    trigger={workflow.trigger_type}
                    isActive={Boolean(workflow.is_active)}
                    lastRun={formatRelativeTime(workflow.last_run_at)}
                    nextRun={workflow.next_run_at ? formatRelativeTime(workflow.next_run_at) : null}
                    successRate={successRate}
                    runCount={totalRuns}
                    onToggle={() =>
                      toggleWorkflowMutation.mutate({ workflowId: workflow.id, isActive: !workflow.is_active })
                    }
                    onRun={() => runWorkflowMutation.mutate(workflow.id)}
                  />
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {templatesLoading ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Loading templates...
              </CardContent>
            </Card>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No templates available for this provider.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  name={template.name}
                  description={template.description || 'No description provided'}
                  category={template.category}
                  onApply={() => applyTemplateMutation.mutate(template)}
                  isApplying={applyTemplateMutation.isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Executions"
              value={metrics.totalExecutions.toLocaleString()}
              change="Last 30 days"
              changeTone="neutral"
              icon={Activity}
            />
            <MetricCard
              title="Success Rate"
              value={`${metrics.successRate.toFixed(1)}%`}
              change={metrics.successRate >= 90 ? 'Healthy' : 'Needs review'}
              changeTone={metrics.successRate >= 90 ? 'positive' : 'negative'}
              icon={TrendingUp}
            />
            <MetricCard
              title="Avg. Execution Time"
              value={formatDuration(metrics.avgExecutionTime)}
              change={metrics.avgExecutionTime > 0 ? 'Last 30 days' : 'No data'}
              changeTone="neutral"
              icon={Clock}
            />
            <MetricCard
              title="Data Synced"
              value={metrics.dataSynced.toLocaleString()}
              change={metrics.dataSynced > 0 ? 'Records' : 'No data'}
              changeTone="neutral"
              icon={Database}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance</CardTitle>
              <CardDescription>
                Execution success rate over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Loading performance data...
                </div>
              ) : chartData.every(point => point.successRate === 0) ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No workflow performance data recorded in the last 30 days.
                </div>
              ) : (
                <div className="h-[200px] flex items-end gap-1">
                  {chartData.map(point => (
                    <div key={point.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-sm bg-primary/70"
                        style={{ height: `${Math.max(point.successRate, 4)}%` }}
                        title={`${point.date}: ${point.successRate}%`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="field-mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping Configuration</CardTitle>
              <CardDescription>
                Map fields between your shop and external systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mappingsLoading ? (
                <div className="text-sm text-muted-foreground">Loading field mappings...</div>
              ) : fieldMappings.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No field mappings configured for this integration.
                </div>
              ) : (
                <div className="space-y-4">
                  {fieldMappings.map(mapping => (
                    <FieldMappingRow
                      key={mapping.id}
                      entityType={mapping.entity_type}
                      sourceField={mapping.local_field}
                      targetField={mapping.external_field}
                      fieldType={mapping.sync_direction || 'bidirectional'}
                      isRequired={Boolean(mapping.is_required)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workflow-name">Name</Label>
              <Input
                id="workflow-name"
                value={createForm.name}
                onChange={(event) => setCreateForm(prev => ({ ...prev, name: event.target.value }))}
                placeholder="e.g., Customer Sync"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                value={createForm.description}
                onChange={(event) => setCreateForm(prev => ({ ...prev, description: event.target.value }))}
                placeholder="Describe what this workflow does"
              />
            </div>
            <div className="space-y-2">
              <Label>Trigger</Label>
              <Select
                value={createForm.triggerType}
                onValueChange={(value) => setCreateForm(prev => ({ ...prev, triggerType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="data_change">Data Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createWorkflowMutation.mutate()}
                disabled={!createForm.name.trim() || createWorkflowMutation.isPending}
              >
                {createWorkflowMutation.isPending ? 'Creating...' : 'Create Workflow'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface WorkflowCardProps {
  name: string;
  description: string;
  trigger: string;
  isActive: boolean;
  lastRun: string;
  nextRun: string | null;
  successRate: number;
  runCount: number;
  onToggle: () => void;
  onRun: () => void;
}

function WorkflowCard({
  name,
  description,
  trigger,
  isActive,
  lastRun,
  nextRun,
  successRate,
  runCount,
  onToggle,
  onRun
}: WorkflowCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{name}</h4>
              <Badge variant={isActive ? 'default' : 'secondary'}>
                {isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">{trigger}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>Last run: {lastRun}</span>
              {nextRun && <span>Next run: {nextRun}</span>}
              <span>Runs: {runCount}</span>
              <span>Success rate: {successRate}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRun}>
              <Zap className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onToggle}>
              {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TemplateCardProps {
  name: string;
  description: string;
  category: string;
  onApply: () => void;
  isApplying: boolean;
}

function TemplateCard({ name, description, category, onApply, isApplying }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{name}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onApply} disabled={isApplying}>
            {isApplying ? 'Applying...' : 'Use Template'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">{category}</Badge>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeTone: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<any>;
}

function MetricCard({ title, value, change, changeTone, icon: Icon }: MetricCardProps) {
  const toneClass = changeTone === 'positive'
    ? 'text-green-600'
    : changeTone === 'negative'
      ? 'text-red-600'
      : 'text-muted-foreground';
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className={`text-xs ${toneClass}`}>
              {change}
            </p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

interface FieldMappingRowProps {
  entityType: string;
  sourceField: string;
  targetField: string;
  fieldType: string;
  isRequired: boolean;
}

function FieldMappingRow({
  entityType,
  sourceField,
  targetField,
  fieldType,
  isRequired
}: FieldMappingRowProps) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="space-y-1">
        <div className="text-xs uppercase text-muted-foreground">{entityType}</div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">{sourceField}</div>
          <div className="text-muted-foreground">→</div>
          <div className="text-sm font-medium">{targetField}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline">{fieldType}</Badge>
        {isRequired && <Badge variant="secondary">Required</Badge>}
      </div>
    </div>
  );
}
