import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, FileText, Plus, Search, Calendar } from 'lucide-react';

export const ComplianceTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Compliance Requirements</h2>
          <p className="text-muted-foreground">Track and manage regulatory compliance requirements</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Requirements
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Requirement
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliant</p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Soon</p>
                <p className="text-2xl font-bold text-foreground">6</p>
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
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requirements</p>
                <p className="text-2xl font-bold text-foreground">32</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Compliance Status</CardTitle>
          <CardDescription>
            Track your organization's compliance across all requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Compliance Rate</span>
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
            <Progress value={75} className="h-2" />
            <p className="text-xs text-muted-foreground">
              24 of 32 requirements are up to date. 6 require attention within the next 30 days.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Critical Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Critical Requirements
          </CardTitle>
          <CardDescription>
            Requirements that need immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Annual Tax Filing - Form 990</h4>
                <p className="text-sm text-muted-foreground">IRS requirement for nonprofit organizations</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-red-500/10 text-red-700 hover:bg-red-500/20">Overdue</Badge>
                  <span className="text-xs text-muted-foreground">Due: April 15, 2024</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="destructive">
                  File Now
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Workers' Compensation Insurance</h4>
                <p className="text-sm text-muted-foreground">State-required insurance coverage</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">Due in 10 days</Badge>
                  <span className="text-xs text-muted-foreground">Due: May 25, 2024</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  Review Policy
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance by Category</CardTitle>
          <CardDescription>
            View compliance status across different regulatory areas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Tax Compliance */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Tax Compliance</h4>
                <span className="text-sm text-muted-foreground">5 of 6 requirements</span>
              </div>
              <Progress value={83} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Quarterly payroll taxes</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-red-600" />
                  <span>Annual Form 990</span>
                </div>
              </div>
            </div>

            {/* Employment Law */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Employment Law</h4>
                <span className="text-sm text-muted-foreground">8 of 9 requirements</span>
              </div>
              <Progress value={89} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>I-9 forms updated</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-yellow-600" />
                  <span>Safety training due</span>
                </div>
              </div>
            </div>

            {/* Insurance & Licensing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Insurance & Licensing</h4>
                <span className="text-sm text-muted-foreground">4 of 5 requirements</span>
              </div>
              <Progress value={80} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>General liability</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-yellow-600" />
                  <span>Workers' comp renewal</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>
            Stay ahead of important compliance deadlines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Safety Training Certification</h4>
                <p className="text-sm text-muted-foreground">OSHA-required safety training for all employees</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Due in 15 days</span>
                <Button size="sm" variant="outline">
                  Schedule Training
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Monthly Financial Report</h4>
                <p className="text-sm text-muted-foreground">Board-required monthly financial summary</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Due in 20 days</span>
                <Button size="sm" variant="outline">
                  Generate Report
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Charitable Solicitation Permit</h4>
                <p className="text-sm text-muted-foreground">State permit for fundraising activities</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Due in 45 days</span>
                <Button size="sm" variant="outline">
                  Renew Permit
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};