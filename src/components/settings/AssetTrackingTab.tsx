import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Wrench, AlertTriangle, TrendingUp, Plus, Search, Filter } from 'lucide-react';

export const AssetTrackingTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Asset Tracking</h2>
          <p className="text-muted-foreground">Track and manage organizational assets, equipment, and vehicles</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Assets
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Asset Search
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Asset Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold text-foreground">147</p>
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
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-foreground">$485K</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Wrench className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Need Maintenance</p>
                <p className="text-2xl font-bold text-foreground">8</p>
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
                <p className="text-sm text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-foreground">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Categories</CardTitle>
          <CardDescription>
            View assets organized by category and type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Wrench className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Tools & Equipment</h4>
                  <p className="text-sm text-muted-foreground">89 items • $187,500</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Automotive Tools</span>
                  <span className="font-medium">42</span>
                </div>
                <div className="flex justify-between">
                  <span>Shop Equipment</span>
                  <span className="font-medium">31</span>
                </div>
                <div className="flex justify-between">
                  <span>Safety Equipment</span>
                  <span className="font-medium">16</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Vehicles</h4>
                  <p className="text-sm text-muted-foreground">23 items • $245,000</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service Vehicles</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Project Vehicles</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Utility Vehicles</span>
                  <span className="font-medium">3</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MapPin className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Facility & Property</h4>
                  <p className="text-sm text-muted-foreground">35 items • $52,800</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Building Systems</span>
                  <span className="font-medium">18</span>
                </div>
                <div className="flex justify-between">
                  <span>Office Equipment</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Security Systems</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High-Value Assets */}
      <Card>
        <CardHeader>
          <CardTitle>High-Value Assets</CardTitle>
          <CardDescription>
            Monitor your most valuable assets and their condition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Professional Lift System - Bay 1</h4>
                  <p className="text-sm text-muted-foreground">Asset Tag: AST-001 • Purchase Date: Jan 2022</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">Location: Main Workshop</span>
                    <span className="text-xs text-muted-foreground">Value: $45,000</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Excellent</Badge>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Wrench className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Diagnostic Computer System</h4>
                  <p className="text-sm text-muted-foreground">Asset Tag: AST-024 • Purchase Date: Mar 2023</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">Location: Diagnostic Bay</span>
                    <span className="text-xs text-muted-foreground">Value: $28,500</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Good</Badge>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Welding Station - Professional</h4>
                  <p className="text-sm text-muted-foreground">Asset Tag: AST-012 • Purchase Date: Aug 2021</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground">Location: Fabrication Area</span>
                    <span className="text-xs text-muted-foreground">Value: $18,200</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">Needs Calibration</Badge>
                <Button size="sm" variant="outline">
                  Schedule Maintenance
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Depreciation & Lifecycle */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Lifecycle & Depreciation</CardTitle>
          <CardDescription>
            Track asset depreciation and replacement planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Depreciation Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Original Cost</span>
                  <span className="font-medium">$485,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Accumulated Depreciation</span>
                  <span className="font-medium text-red-600">-$147,200</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Current Book Value</span>
                  <span className="font-bold text-green-600">$337,800</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Replacement Planning</h4>
              <div className="space-y-3">
                <div className="p-3 border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Engine Hoist</span>
                    <span className="text-xs text-muted-foreground">2025</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Expected replacement cost: $8,500</p>
                </div>
                <div className="p-3 border border-border rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Air Compressor System</span>
                    <span className="text-xs text-muted-foreground">2026</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Expected replacement cost: $12,000</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grant-Funded Assets */}
      <Card>
        <CardHeader>
          <CardTitle>Grant-Funded Assets</CardTitle>
          <CardDescription>
            Assets purchased with grant funding and their compliance requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Youth Training Tool Set (15 sets)</h4>
                <p className="text-sm text-muted-foreground">Community Foundation Grant • Purchase Date: Sep 2023</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">Grant Value: $25,000</span>
                  <span className="text-xs text-muted-foreground">Restricted Use: Educational Programs</span>
                </div>
              </div>
              <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Compliant</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-foreground">Environmental Restoration Equipment</h4>
                <p className="text-sm text-muted-foreground">State Environmental Grant • Purchase Date: Nov 2023</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">Grant Value: $18,500</span>
                  <span className="text-xs text-muted-foreground">Restricted Use: Environmental Projects</span>
                </div>
              </div>
              <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};