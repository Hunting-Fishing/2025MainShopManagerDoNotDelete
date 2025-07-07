import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, FileText, Building, Calendar, AlertTriangle } from "lucide-react";

export function FinancialManagementTab() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$485,000</div>
            <p className="text-xs text-muted-foreground">FY {currentYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Expenses</CardTitle>
            <TrendingUp className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$324,150</div>
            <p className="text-xs text-muted-foreground">67% of budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grant Funds</CardTitle>
            <Building className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$145,000</div>
            <p className="text-xs text-muted-foreground">Active grants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Filings</CardTitle>
            <FileText className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground">Due this quarter</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Management */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Management</CardTitle>
          <CardDescription>
            Track and manage your organization's budget categories and spending
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Budget Categories */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">Program Operations</h4>
                  <p className="text-sm text-muted-foreground">
                    Direct program costs and operations
                  </p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>$180,000 budgeted</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>$124,500 spent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">69% utilized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>On track</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">Administrative Costs</h4>
                  <p className="text-sm text-muted-foreground">
                    Administrative and overhead expenses
                  </p>
                </div>
                <Badge variant="outline">Monitoring</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>$85,000 budgeted</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>$67,200 spent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">79% utilized</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>Watch closely</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">Fundraising & Development</h4>
                  <p className="text-sm text-muted-foreground">
                    Fundraising activities and donor development
                  </p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>$45,000 budgeted</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>$28,900 spent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">64% utilized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Under budget</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button>Add Budget Category</Button>
            <Button variant="outline">Import Transactions</Button>
            <Button variant="outline">Budget vs Actual Report</Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Reports & Compliance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tax Documents & Compliance</CardTitle>
            <CardDescription>
              Manage tax filings and compliance requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Form 990 - Annual Return</h4>
                  <p className="text-sm text-muted-foreground">Tax Year {currentYear - 1}</p>
                </div>
                <Badge>Filed</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">State Annual Report</h4>
                  <p className="text-sm text-muted-foreground">Due: March 15, {currentYear}</p>
                </div>
                <Badge variant="destructive">Overdue</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Form 990 - {currentYear}</h4>
                  <p className="text-sm text-muted-foreground">Due: May 15, {currentYear + 1}</p>
                </div>
                <Badge variant="outline">Draft</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm">Add Filing</Button>
              <Button size="sm" variant="outline">View Calendar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Tracking</CardTitle>
            <CardDescription>
              Monitor organization assets and depreciation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Asset Value</span>
                <span className="font-semibold">$234,500</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Equipment</span>
                <span>$125,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Vehicles</span>
                <span>$85,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Technology</span>
                <span>$24,500</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>2 assets need maintenance review</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm">Add Asset</Button>
              <Button size="sm" variant="outline">View All</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Reports</CardTitle>
          <CardDescription>
            Generate and manage financial reports for stakeholders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium mb-1">Cash Flow Statement</h4>
              <p className="text-sm text-muted-foreground mb-3">Monthly cash flow analysis</p>
              <Button size="sm" variant="outline">Generate</Button>
            </div>

            <div className="border rounded-lg p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium mb-1">Budget vs Actual</h4>
              <p className="text-sm text-muted-foreground mb-3">Performance comparison</p>
              <Button size="sm" variant="outline">Generate</Button>
            </div>

            <div className="border rounded-lg p-4 text-center">
              <Building className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium mb-1">Grant Utilization</h4>
              <p className="text-sm text-muted-foreground mb-3">Grant fund usage report</p>
              <Button size="sm" variant="outline">Generate</Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button>Custom Report Builder</Button>
            <Button variant="outline">Scheduled Reports</Button>
            <Button variant="outline">Export Options</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}