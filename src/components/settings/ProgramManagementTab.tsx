import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Target, TrendingUp, Calendar, MapPin, DollarSign } from "lucide-react";

export function ProgramManagementTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Programs Overview Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Target className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">8</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        {/* Participants Served Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People Served</CardTitle>
            <Users className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,247</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        {/* Impact Metrics Card */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Metrics</CardTitle>
            <TrendingUp className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">24</div>
            <p className="text-xs text-muted-foreground">Tracked metrics</p>
          </CardContent>
        </Card>
      </div>

      {/* Programs List */}
      <Card>
        <CardHeader>
          <CardTitle>Program Management</CardTitle>
          <CardDescription>
            Manage your organization's programs and track their impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sample Program Entries */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">Youth Education Initiative</h4>
                  <p className="text-sm text-muted-foreground">
                    Providing educational support to underserved youth
                  </p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>185 participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>$45,000 budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Local</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Jan 2024 - Dec 2024</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">Community Health Outreach</h4>
                  <p className="text-sm text-muted-foreground">
                    Health education and screening services
                  </p>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>320 participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>$78,000 budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Regional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Ongoing</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">Environmental Conservation</h4>
                  <p className="text-sm text-muted-foreground">
                    Community-based environmental protection initiatives
                  </p>
                </div>
                <Badge variant="outline">Planning</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>50 participants (projected)</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>$25,000 budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Local</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Mar 2024 - Aug 2024</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button>Add New Program</Button>
            <Button variant="outline">View Impact Dashboard</Button>
            <Button variant="outline">Generate Report</Button>
          </div>
        </CardContent>
      </Card>

      {/* Impact Measurement Section */}
      <Card>
        <CardHeader>
          <CardTitle>Impact Measurement</CardTitle>
          <CardDescription>
            Track and measure the outcomes of your programs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Output Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>People served</span>
                  <span className="font-medium">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span>Services provided</span>
                  <span className="font-medium">3,456</span>
                </div>
                <div className="flex justify-between">
                  <span>Volunteer hours</span>
                  <span className="font-medium">2,890</span>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Outcome Metrics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Skills improved</span>
                  <span className="font-medium">89%</span>
                </div>
                <div className="flex justify-between">
                  <span>Goals achieved</span>
                  <span className="font-medium">76%</span>
                </div>
                <div className="flex justify-between">
                  <span>Satisfaction rate</span>
                  <span className="font-medium">94%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Add New Metric</Button>
            <Button variant="outline">View Trends</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}