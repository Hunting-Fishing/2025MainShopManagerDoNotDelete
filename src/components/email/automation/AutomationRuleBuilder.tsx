import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, Play, Pause } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useEmailTemplates } from '@/hooks/email/useEmailTemplates';
import { supabase } from '@/integrations/supabase/client';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_event: string;
  conditions: Condition[];
  actions: Action[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Condition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface Action {
  id: string;
  type: string;
  template_id?: string;
  delay_hours?: number;
  sequence_id?: string;
  tag?: string;
}

export function AutomationRuleBuilder() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [currentRule, setCurrentRule] = useState<AutomationRule | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { templates, loading: templatesLoading } = useEmailTemplates();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_automation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRules(data || []);
    } catch (err) {
      console.error('Error fetching automation rules:', err);
      toast({
        title: "Error",
        description: "Failed to load automation rules",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewRule = () => {
    const newRule: AutomationRule = {
      id: `new-${Date.now()}`,
      name: 'New Automation Rule',
      description: '',
      trigger_type: 'event',
      trigger_event: 'customer_created',
      conditions: [],
      actions: [],
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCurrentRule(newRule);
  };

  const editRule = (rule: AutomationRule) => {
    setCurrentRule({ ...rule });
  };

  const addCondition = () => {
    if (!currentRule) return;
    
    const newCondition: Condition = {
      id: `condition-${Date.now()}`,
      field: 'email',
      operator: 'contains',
      value: '',
    };
    
    setCurrentRule({
      ...currentRule,
      conditions: [...currentRule.conditions, newCondition],
    });
  };

  const updateCondition = (id: string, field: keyof Condition, value: string) => {
    if (!currentRule) return;
    
    const updatedConditions = currentRule.conditions.map(condition => {
      if (condition.id === id) {
        return { ...condition, [field]: value };
      }
      return condition;
    });
    
    setCurrentRule({
      ...currentRule,
      conditions: updatedConditions,
    });
  };

  const removeCondition = (id: string) => {
    if (!currentRule) return;
    
    setCurrentRule({
      ...currentRule,
      conditions: currentRule.conditions.filter(condition => condition.id !== id),
    });
  };

  const addAction = () => {
    if (!currentRule) return;
    
    const newAction: Action = {
      id: `action-${Date.now()}`,
      type: 'send_email',
      template_id: '',
    };
    
    setCurrentRule({
      ...currentRule,
      actions: [...currentRule.actions, newAction],
    });
  };

  const updateAction = (id: string, field: keyof Action, value: string | number) => {
    if (!currentRule) return;
    
    const updatedActions = currentRule.actions.map(action => {
      if (action.id === id) {
        return { ...action, [field]: value };
      }
      return action;
    });
    
    setCurrentRule({
      ...currentRule,
      actions: updatedActions,
    });
  };

  const removeAction = (id: string) => {
    if (!currentRule) return;
    
    setCurrentRule({
      ...currentRule,
      actions: currentRule.actions.filter(action => action.id !== id),
    });
  };

  const saveRule = async () => {
    if (!currentRule) return;
    
    try {
      setSaving(true);
      
      const isNew = currentRule.id.startsWith('new-');
      const ruleData = {
        name: currentRule.name,
        description: currentRule.description,
        trigger_type: currentRule.trigger_type,
        trigger_event: currentRule.trigger_event,
        conditions: currentRule.conditions,
        actions: currentRule.actions,
        is_active: currentRule.is_active,
      };
      
      if (isNew) {
        // Remove the temporary ID for new rules
        const { data, error } = await supabase
          .from('email_automation_rules')
          .insert([ruleData])
          .select()
          .single();
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Automation rule created successfully",
        });
        
        setCurrentRule(null);
      } else {
        const { error } = await supabase
          .from('email_automation_rules')
          .update(ruleData)
          .eq('id', currentRule.id);
          
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Automation rule updated successfully",
        });
      }
      
      fetchRules();
    } catch (err) {
      console.error('Error saving automation rule:', err);
      toast({
        title: "Error",
        description: "Failed to save automation rule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleRuleStatus = async (rule: AutomationRule) => {
    try {
      const { error } = await supabase
        .from('email_automation_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Rule ${rule.is_active ? 'disabled' : 'enabled'} successfully`,
      });
      
      fetchRules();
    } catch (err) {
      console.error('Error toggling rule status:', err);
      toast({
        title: "Error",
        description: "Failed to update rule status",
        variant: "destructive",
      });
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;
    
    try {
      const { error } = await supabase
        .from('email_automation_rules')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Automation rule deleted successfully",
      });
      
      if (currentRule?.id === id) {
        setCurrentRule(null);
      }
      
      fetchRules();
    } catch (err) {
      console.error('Error deleting automation rule:', err);
      toast({
        title: "Error",
        description: "Failed to delete automation rule",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Email Automation Rules</h2>
        <Button onClick={createNewRule}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Rules</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : rules.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No automation rules found. Create your first rule!
                </div>
              ) : (
                <ul className="space-y-2">
                  {rules.map(rule => (
                    <li key={rule.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {rule.trigger_event.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={rule.is_active ? "default" : "outline"}>
                            {rule.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => editRule(rule)}>
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {currentRule ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentRule.id.startsWith('new-') ? 'Create New Rule' : 'Edit Rule'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-name">Rule Name</Label>
                      <Input
                        id="rule-name"
                        value={currentRule.name}
                        onChange={e => setCurrentRule({ ...currentRule, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rule-status">Status</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="rule-status"
                          checked={currentRule.is_active}
                          onCheckedChange={checked => setCurrentRule({ ...currentRule, is_active: checked })}
                        />
                        <Label htmlFor="rule-status">
                          {currentRule.is_active ? 'Active' : 'Inactive'}
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rule-description">Description</Label>
                    <Textarea
                      id="rule-description"
                      value={currentRule.description}
                      onChange={e => setCurrentRule({ ...currentRule, description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trigger-event">Trigger Event</Label>
                    <Select
                      value={currentRule.trigger_event}
                      onValueChange={value => setCurrentRule({ ...currentRule, trigger_event: value })}
                    >
                      <SelectTrigger id="trigger-event">
                        <SelectValue placeholder="Select trigger event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer_created">Customer Created</SelectItem>
                        <SelectItem value="customer_updated">Customer Updated</SelectItem>
                        <SelectItem value="work_order_created">Work Order Created</SelectItem>
                        <SelectItem value="work_order_completed">Work Order Completed</SelectItem>
                        <SelectItem value="invoice_created">Invoice Created</SelectItem>
                        <SelectItem value="invoice_paid">Invoice Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Conditions</Label>
                      <Button variant="outline" size="sm" onClick={addCondition}>
                        <Plus className="h-4 w-4 mr-1" /> Add Condition
                      </Button>
                    </div>
                    {currentRule.conditions.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-2">
                        No conditions added. Rule will apply to all {currentRule.trigger_event.replace('_', ' ')} events.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentRule.conditions.map(condition => (
                          <div key={condition.id} className="flex items-center space-x-2 border rounded-md p-2">
                            <Select
                              value={condition.field}
                              onValueChange={value => updateCondition(condition.id, 'field', value)}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="tag">Tag</SelectItem>
                                <SelectItem value="total">Total Amount</SelectItem>
                              </SelectContent>
                            </Select>

                            <Select
                              value={condition.operator}
                              onValueChange={value => updateCondition(condition.id, 'operator', value)}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="starts_with">Starts With</SelectItem>
                                <SelectItem value="ends_with">Ends With</SelectItem>
                                <SelectItem value="greater_than">Greater Than</SelectItem>
                                <SelectItem value="less_than">Less Than</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              value={condition.value}
                              onChange={e => updateCondition(condition.id, 'value', e.target.value)}
                              className="flex-1"
                            />

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCondition(condition.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Actions</Label>
                      <Button variant="outline" size="sm" onClick={addAction}>
                        <Plus className="h-4 w-4 mr-1" /> Add Action
                      </Button>
                    </div>
                    {currentRule.actions.length === 0 ? (
                      <div className="text-sm text-muted-foreground py-2">
                        No actions added. Add at least one action for this rule to do something.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentRule.actions.map(action => (
                          <div key={action.id} className="border rounded-md p-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <Select
                                  value={action.type}
                                  onValueChange={value => updateAction(action.id, 'type', value)}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="send_email">Send Email</SelectItem>
                                    <SelectItem value="add_tag">Add Tag</SelectItem>
                                    <SelectItem value="remove_tag">Remove Tag</SelectItem>
                                    <SelectItem value="enroll_sequence">Enroll in Sequence</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAction(action.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {action.type === 'send_email' && (
                              <div className="space-y-2">
                                <Label>Email Template</Label>
                                <Select
                                  value={action.template_id || ''}
                                  onValueChange={value => updateAction(action.id, 'template_id', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select email template" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {templatesLoading ? (
                                      <SelectItem value="" disabled>Loading templates...</SelectItem>
                                    ) : templates.length === 0 ? (
                                      <SelectItem value="" disabled>No templates available</SelectItem>
                                    ) : (
                                      templates.map(template => (
                                        <SelectItem key={template.id} value={template.id}>
                                          {template.name}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>

                                <div className="space-y-2">
                                  <Label>Delay (hours)</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={action.delay_hours || 0}
                                    onChange={e => updateAction(action.id, 'delay_hours', parseInt(e.target.value) || 0)}
                                  />
                                </div>
                              </div>
                            )}

                            {(action.type === 'add_tag' || action.type === 'remove_tag') && (
                              <div className="space-y-2">
                                <Label>Tag</Label>
                                <Input
                                  value={action.tag || ''}
                                  onChange={e => updateAction(action.id, 'tag', e.target.value)}
                                  placeholder="Enter tag name"
                                />
                              </div>
                            )}

                            {action.type === 'enroll_sequence' && (
                              <div className="space-y-2">
                                <Label>Email Sequence</Label>
                                <Select
                                  value={action.sequence_id || ''}
                                  onValueChange={value => updateAction(action.id, 'sequence_id', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select email sequence" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="seq1">Welcome Sequence</SelectItem>
                                    <SelectItem value="seq2">Follow-up Sequence</SelectItem>
                                    <SelectItem value="seq3">Re-engagement Sequence</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setCurrentRule(null)}>
                    Cancel
                  </Button>
                  <Button onClick={saveRule} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Rule
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full border-2 border-dashed rounded-lg p-12">
              <div className="text-center">
                <h3 className="text-lg font-medium">No Rule Selected</h3>
                <p className="text-muted-foreground mt-1">
                  Select a rule to edit or create a new one
                </p>
                <Button className="mt-4" onClick={createNewRule}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Rule
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
