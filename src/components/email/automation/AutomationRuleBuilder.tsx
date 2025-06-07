import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface AutomationRule {
  id?: string;
  name: string;
  description: string;
  trigger_type: string;
  trigger_criteria: any;
  action_type: string;
  action_details: any;
  is_active: boolean;
}

interface AutomationRuleBuilderProps {
  onRuleCreated?: (rule: AutomationRule) => void;
}

export const AutomationRuleBuilder: React.FC<AutomationRuleBuilderProps> = ({
  onRuleCreated
}) => {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
    name: '',
    description: '',
    trigger_type: 'customer_signup',
    action_type: 'send_email',
    is_active: true,
    trigger_criteria: {},
    action_details: {}
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock function to simulate saving rule since the table doesn't exist
  const handleSaveRule = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedRule: AutomationRule = {
        ...newRule as AutomationRule,
        id: Date.now().toString()
      };
      
      setRules(prev => [...prev, savedRule]);
      
      // Reset form
      setNewRule({
        name: '',
        description: '',
        trigger_type: 'customer_signup',
        action_type: 'send_email',
        is_active: true,
        trigger_criteria: {},
        action_details: {}
      });
      
      onRuleCreated?.(savedRule);
      
      toast({
        title: "Success",
        description: "Automation rule created successfully",
      });
    } catch (error) {
      console.error('Error saving automation rule:', error);
      toast({
        title: "Error",
        description: "Failed to save automation rule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      toast({
        title: "Success",
        description: "Automation rule deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting automation rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete automation rule",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Automation Rule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter rule name"
              />
            </div>
            
            <div>
              <Label htmlFor="trigger-type">Trigger Type</Label>
              <Select
                value={newRule.trigger_type}
                onValueChange={(value) => setNewRule(prev => ({ ...prev, trigger_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_signup">Customer Signup</SelectItem>
                  <SelectItem value="work_order_completed">Work Order Completed</SelectItem>
                  <SelectItem value="appointment_scheduled">Appointment Scheduled</SelectItem>
                  <SelectItem value="invoice_paid">Invoice Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newRule.description}
              onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this automation rule does"
            />
          </div>

          <div>
            <Label htmlFor="action-type">Action Type</Label>
            <Select
              value={newRule.action_type}
              onValueChange={(value) => setNewRule(prev => ({ ...prev, action_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_email">Send Email</SelectItem>
                <SelectItem value="send_sms">Send SMS</SelectItem>
                <SelectItem value="create_task">Create Task</SelectItem>
                <SelectItem value="update_customer">Update Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSaveRule}
            disabled={loading || !newRule.name}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            {loading ? 'Creating...' : 'Create Automation Rule'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Automation Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No automation rules created yet.
            </p>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Trigger: {rule.trigger_type}
                        </span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Action: {rule.action_type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          rule.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rule.id && handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationRuleBuilder;
