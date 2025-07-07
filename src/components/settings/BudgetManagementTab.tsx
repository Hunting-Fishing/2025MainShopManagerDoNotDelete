import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Calendar, Target, Plus, Download } from 'lucide-react';

export const BudgetManagementTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Budget Management</h2>
          <p className="text-muted-foreground">Track budgets, expenses, and financial performance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Budget
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Budget
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold text-foreground">$485K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-2xl font-bold text-foreground">$342K</p>
                <p className="text-xs text-green-600">70% utilized</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Target className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold text-foreground">$143K</p>
                <p className="text-xs text-yellow-600">30% available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Over Budget</p>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-xs text-red-600">categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress by Category</CardTitle>
          <CardDescription>
            Track spending across different budget categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Program Operations */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Program Operations</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">$185K / $200K</span>
                  <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">On Track</Badge>
                </div>
              </div>
              <Progress value={92.5} className="h-2" />
              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <span>Vehicle restoration: $95K</span>
                <span>Youth programs: $65K</span>
                <span>Community outreach: $25K</span>
              </div>
            </div>

            {/* Personnel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Personnel</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">$125K / $150K</span>
                  <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">Watch</Badge>
                </div>
              </div>
              <Progress value={83.3} className="h-2" />
              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <span>Salaries: $85K</span>
                <span>Benefits: $25K</span>
                <span>Training: $15K</span>
              </div>
            </div>

            {/* Facilities & Equipment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Facilities & Equipment</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">$82K / $75K</span>
                  <Badge className="bg-red-500/10 text-red-700 hover:bg-red-500/20">Over Budget</Badge>
                </div>
              </div>
              <Progress value={109.3} className="h-2" />
              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <span>Rent: $36K</span>
                <span>Equipment: $28K</span>
                <span>Maintenance: $18K</span>
              </div>
            </div>

            {/* Administrative */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Administrative</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">$28K / $40K</span>
                  <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Under Budget</Badge>
                </div>
              </div>
              <Progress value={70} className="h-2" />
              <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                <span>Insurance: $12K</span>
                <span>Legal/Professional: $8K</span>
                <span>Office supplies: $8K</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Budget Performance</CardTitle>
          <CardDescription>
            Compare actual vs. planned spending by quarter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Q1 2024 Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Budgeted</span>
                  <span className="font-medium">$121,250</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Actual</span>
                  <span className="font-medium">$118,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Variance</span>
                  <span className="font-medium text-green-600">-$2,800 (2.3%)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Year-to-Date</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Budgeted</span>
                  <span className="font-medium">$363,750</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Actual</span>
                  <span className="font-medium">$342,180</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Variance</span>
                  <span className="font-medium text-green-600">-$21,570 (5.9%)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grant-Specific Budgets */}
      <Card>
        <CardHeader>
          <CardTitle>Grant-Specific Budgets</CardTitle>
          <CardDescription>
            Track restricted funding and compliance with grant requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Community Foundation Youth Grant</h4>
                <p className="text-sm text-muted-foreground">Youth apprenticeship program funding</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">Grant Period: Jan - Dec 2024</span>
                  <span className="text-xs text-muted-foreground">Total Award: $75,000</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">$52,500 spent</div>
                <div className="text-xs text-green-600">70% utilized</div>
                <Progress value={70} className="h-1 w-20 mt-1" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">State Environmental Restoration</h4>
                <p className="text-sm text-muted-foreground">Vehicle restoration and environmental programs</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">Grant Period: Mar 2024 - Feb 2025</span>
                  <span className="text-xs text-muted-foreground">Total Award: $45,000</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">$18,900 spent</div>
                <div className="text-xs text-blue-600">42% utilized</div>
                <Progress value={42} className="h-1 w-20 mt-1" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Workforce Development Grant</h4>
                <p className="text-sm text-muted-foreground">Skills training and job placement programs</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">Grant Period: Jun 2024 - May 2025</span>
                  <span className="text-xs text-muted-foreground">Total Award: $60,000</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">$58,200 spent</div>
                <div className="text-xs text-yellow-600">97% utilized</div>
                <Progress value={97} className="h-1 w-20 mt-1" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Budget Alerts & Recommendations
          </CardTitle>
          <CardDescription>
            Important budget notifications and suggested actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Facilities Budget Exceeded</h4>
                  <p className="text-sm text-muted-foreground">You're 9.3% over budget in the Facilities & Equipment category</p>
                </div>
                <Button size="sm" variant="outline">
                  Review Expenses
                </Button>
              </div>
            </div>

            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Grant Deadline Approaching</h4>
                  <p className="text-sm text-muted-foreground">Workforce Development Grant funds must be spent by May 31, 2025</p>
                </div>
                <Button size="sm" variant="outline">
                  Plan Spending
                </Button>
              </div>
            </div>

            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-foreground">Administrative Savings</h4>
                  <p className="text-sm text-muted-foreground">You have $12K remaining in administrative budget - consider reallocating</p>
                </div>
                <Button size="sm" variant="outline">
                  Reallocate Funds
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};