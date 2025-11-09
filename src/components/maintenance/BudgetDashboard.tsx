import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Budget {
  id: string;
  budget_name: string;
  budget_period: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  parts_budget: number;
  labor_budget: number;
  total_spent: number;
  parts_spent: number;
  labor_spent: number;
  status: string;
}

export function BudgetDashboard() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Mock data - in real app, fetch from database
  const budgets: Budget[] = [
    {
      id: '1',
      budget_name: 'Q1 2024 Maintenance',
      budget_period: 'quarterly',
      start_date: '2024-01-01',
      end_date: '2024-03-31',
      total_budget: 50000,
      parts_budget: 30000,
      labor_budget: 20000,
      total_spent: 32000,
      parts_spent: 18000,
      labor_spent: 14000,
      status: 'active',
    },
  ];

  const activeBudget = budgets[0];
  const totalPercentage = (activeBudget.total_spent / activeBudget.total_budget) * 100;
  const partsPercentage = (activeBudget.parts_spent / activeBudget.parts_budget) * 100;
  const laborPercentage = (activeBudget.labor_spent / activeBudget.labor_budget) * 100;

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
          <CardTitle>Budget Breakdown</CardTitle>
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

      {/* Create Budget Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Budget Period</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Budget Name</Label>
              <Input placeholder="e.g., Q2 2024 Maintenance Budget" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period</Label>
                <Select defaultValue="quarterly">
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
                <Input type="number" placeholder="50000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Parts Budget ($)</Label>
                <Input type="number" placeholder="30000" />
              </div>
              <div className="space-y-2">
                <Label>Labor Budget ($)</Label>
                <Input type="number" placeholder="20000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Budget notes and details..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({ title: 'Budget created', description: 'New budget period has been created.' });
              setCreateDialogOpen(false);
            }}>Create Budget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
