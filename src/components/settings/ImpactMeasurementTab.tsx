import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Users, Wrench, Recycle, Heart, TrendingUp, Download, Calendar } from 'lucide-react';

export const ImpactMeasurementTab = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Impact Measurement</h2>
          <p className="text-muted-foreground">Track and measure your nonprofit's community impact</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Impact Dashboard
          </Button>
        </div>
      </div>

      {/* Impact Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">People Helped</p>
                <p className="text-2xl font-bold text-foreground">1,247</p>
                <p className="text-xs text-green-600">+12% this quarter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Recycle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicles Restored</p>
                <p className="text-2xl font-bold text-foreground">89</p>
                <p className="text-xs text-green-600">+8% this quarter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Wrench className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tool Kits Distributed</p>
                <p className="text-2xl font-bold text-foreground">342</p>
                <p className="text-xs text-green-600">+24% this quarter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Volunteer Hours</p>
                <p className="text-2xl font-bold text-foreground">4,892</p>
                <p className="text-xs text-green-600">+18% this quarter</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Impact Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Program Impact Tracking
          </CardTitle>
          <CardDescription>
            Monitor the effectiveness of your key programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Youth Apprenticeship Program */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Youth Apprenticeship Program</h4>
                <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">On Track</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Participants Enrolled</p>
                  <p className="font-semibold text-foreground">45 / 50</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Completion Rate</p>
                  <p className="font-semibold text-foreground">89%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Job Placement Rate</p>
                  <p className="font-semibold text-foreground">92%</p>
                </div>
              </div>
              <Progress value={90} className="h-2" />
            </div>

            {/* Vehicle Restoration Program */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Vehicle Restoration Program</h4>
                <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">Ahead of Goal</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Vehicles Completed</p>
                  <p className="font-semibold text-foreground">89 / 75</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Environmental Impact</p>
                  <p className="font-semibold text-foreground">2.3 tons CO2 saved</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Revenue Generated</p>
                  <p className="font-semibold text-foreground">$234,500</p>
                </div>
              </div>
              <Progress value={118} className="h-2" />
            </div>

            {/* Community Outreach */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Community Outreach</h4>
                <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">Needs Attention</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Events Hosted</p>
                  <p className="font-semibold text-foreground">8 / 12</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Community Members Reached</p>
                  <p className="font-semibold text-foreground">1,247</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Volunteer Recruitment</p>
                  <p className="font-semibold text-foreground">23 new volunteers</p>
                </div>
              </div>
              <Progress value={67} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Outcome Stories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Success Stories & Outcomes
          </CardTitle>
          <CardDescription>
            Document and share the real-world impact of your work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-foreground">Marcus Thompson - Apprentice Graduate</h4>
                <Badge variant="outline">Featured Story</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                "The Rust Revival Society gave me the skills and confidence to start my own automotive repair business. 
                I went from unemployed to employing three people in my community."
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Program: Youth Apprenticeship</span>
                <span>•</span>
                <span>Outcome: Business Owner</span>
                <span>•</span>
                <span>Added: March 2024</span>
              </div>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-foreground">Sarah Wilson - Single Mother</h4>
                <Badge variant="outline">Recent</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                "Thanks to the restored vehicle program, I now have reliable transportation to get to work and 
                take my children to school. This changed everything for our family."
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Program: Vehicle Restoration</span>
                <span>•</span>
                <span>Outcome: Employment Stability</span>
                <span>•</span>
                <span>Added: April 2024</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Recycle className="h-5 w-5" />
            Environmental Impact
          </CardTitle>
          <CardDescription>
            Track your organization's environmental contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">2.3 tons</div>
              <p className="text-sm text-muted-foreground">CO2 Emissions Saved</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">89</div>
              <p className="text-sm text-muted-foreground">Vehicles Kept from Landfill</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">4,200 lbs</div>
              <p className="text-sm text-muted-foreground">Metal Recycled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};