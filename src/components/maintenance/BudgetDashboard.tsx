import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, addMonths, addQuarters, addYears, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';

interface Budget {
  id: string;
  budget_name: string;
  description?: string;
  budget_period: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  parts_budget: number;
  labor_budget: number;
  external_services_budget: number;
  total_spent: number;
  parts_spent: number;
  labor_spent: number;
  external_services_spent: number;
  status: string;
  created_at: string;
}

interface BudgetFormData {
  budget_name: string;
  description: string;
  budget_period: string;
  total_budget: string;
  parts_budget: string;
  labor_budget: string;
  external_services_budget: string;
}

const initialFormData: BudgetFormData = {
  budget_name: '',
  description: '',
  budget_period: 'quarterly',
  total_budget: '',
  parts_budget: '',
  labor_budget: '',
  external_services_budget: '0',
};

function getDateRange(period: string): { start_date: string; end_date: string } {
  const now = new Date();
  let start: Date, end: Date;
  
  switch (period) {
    case 'monthly':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'quarterly':
      start = startOfQuarter(now);
      end = endOfQuarter(now);
      break;
    case 'yearly':
      start = startOfYear(now);
      end = endOfYear(now);
      break;
    default:
      start = startOfQuarter(now);
      end = endOfQuarter(now);
  }
  
  return {
    start_date: format(start, 'yyyy-MM-dd'),
    end_date: format(end, 'yyyy-MM-dd'),
  };
}

export function BudgetDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<BudgetFormData>(initialFormData);

  // Fetch budgets from database
  const { data: budgets = [], isLoading, error } = useQuery({
    queryKey: ['maintenance-budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_budgets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Budget[];
    },
  });

  // Create budget mutation
  const createBudgetMutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const dateRange = getDateRange(data.budget_period);
      
      const { data: result, error } = await supabase
        .from('maintenance_budgets')
        .insert({
          budget_name: data.budget_name,
          description: data.description || null,
          budget_period: data.budget_period,
          start_date: dateRange.start_date,
          end_date: dateRange.end_date,
          total_budget: parseFloat(data.total_budget) || 0,
          parts_budget: parseFloat(data.parts_budget) || 0,
          labor_budget: parseFloat(data.labor_budget) || 0,
          external_services_budget: parseFloat(data.external_services_budget) || 0,
          total_spent: 0,
          parts_spent: 0,
          labor_spent: 0,
          external_services_spent: 0,
          status: 'active',
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-budgets'] });
      toast({ title: 'Budget created', description: 'New budget period has been created.' });
      setCreateDialogOpen(false);
      setFormData(initialFormData);
    },
    onError: (error) => {
      toast({ 
        title: 'Error creating budget', 
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleCreateBudget = () => {
    if (!formData.budget_name.trim()) {
      toast({ title: 'Error', description: 'Budget name is required', variant: 'destructive' });
      return;
    }
    if (!formData.total_budget || parseFloat(formData.total_budget) <= 0) {
      toast({ title: 'Error', description: 'Total budget must be greater than 0', variant: 'destructive' });
      return;
    }
    createBudgetMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof BudgetFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load budgets</p>
        </div>
      </div>
    );
  }

  // Get active budget (most recent)
  const activeBudget = budgets.find(b => b.status === 'active') || budgets[0];
  
  // Calculate percentages only if we have an active budget
  const totalPercentage = activeBudget && activeBudget.total_budget > 0 
    ? (activeBudget.total_spent / activeBudget.total_budget) * 100 
    : 0;
  const partsPercentage = activeBudget && activeBudget.parts_budget > 0 
    ? (activeBudget.parts_spent / activeBudget.parts_budget) * 100 
    : 0;
  const laborPercentage = activeBudget && activeBudget.labor_budget > 0 
    ? (activeBudget.labor_spent / activeBudget.labor_budget) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget Management</h2>
          <p className="text-muted-foreground">Track and manage maintenance budgets</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Empty State */}
      {!activeBudget ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Budgets Created</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Create your first maintenance budget to start tracking expenses and allocations.
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Budget Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${activeBudget.total_budget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ${activeBudget.total_spent.toLocaleString()} spent ({totalPercentage.toFixed(0)}%)
                </p>
                <Progress value={totalPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Parts Budget</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${activeBudget.parts_budget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ${activeBudget.parts_spent.toLocaleString()} spent ({partsPercentage.toFixed(0)}%)
                </p>
                <Progress value={partsPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Labor Budget</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${activeBudget.labor_budget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ${activeBudget.labor_spent.toLocaleString()} spent ({laborPercentage.toFixed(0)}%)
                </p>
                <Progress value={laborPercentage} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Budget Alerts */}
          {totalPercentage > 80 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Budget Alert</h4>
                    <p className="text-sm text-yellow-700">
                      You've used {totalPercentage.toFixed(0)}% of your total budget. Consider reviewing upcoming maintenance or adjusting budget allocations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget Details */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Breakdown - {activeBudget.budget_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Parts & Materials</h4>
                    <p className="text-sm text-muted-foreground">Inventory items and consumables</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${activeBudget.parts_spent.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">of ${activeBudget.parts_budget.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Labor Costs</h4>
                    <p className="text-sm text-muted-foreground">Technician hours and services</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${activeBudget.labor_spent.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">of ${activeBudget.labor_budget.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div>
                    <h4 className="font-medium">Remaining Budget</h4>
                    <p className="text-sm text-muted-foreground">Available for allocation</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">
                      ${(activeBudget.total_budget - activeBudget.total_spent).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(100 - totalPercentage).toFixed(0)}% remaining
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Budget Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Budget Period</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Budget Name</Label>
              <Input 
                placeholder="e.g., Q4 2025 Maintenance Budget" 
                value={formData.budget_name}
                onChange={(e) => handleInputChange('budget_name', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period</Label>
                <Select 
                  value={formData.budget_period}
                  onValueChange={(value) => handleInputChange('budget_period', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Total Budget ($)</Label>
                <Input 
                  type="number" 
                  placeholder="50000" 
                  value={formData.total_budget}
                  onChange={(e) => handleInputChange('total_budget', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parts Budget ($)</Label>
                <Input 
                  type="number" 
                  placeholder="30000" 
                  value={formData.parts_budget}
                  onChange={(e) => handleInputChange('parts_budget', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Labor Budget ($)</Label>
                <Input 
                  type="number" 
                  placeholder="20000" 
                  value={formData.labor_budget}
                  onChange={(e) => handleInputChange('labor_budget', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Budget notes and details..." 
                rows={3} 
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateBudget}
              disabled={createBudgetMutation.isPending}
            >
              {createBudgetMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
