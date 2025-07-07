import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ticket, Trophy, Users, DollarSign, Calendar, Clock, Eye, Gift } from "lucide-react";

export function RaffleManagementTab() {
  return (
    <div className="space-y-6">
      {/* Raffle Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Raffles</CardTitle>
            <Ticket className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">3</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Users className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">1,247</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$18,705</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Winners</CardTitle>
            <Trophy className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">8</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Raffles List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Raffles</CardTitle>
          <CardDescription>
            Manage your vehicle raffles and track ticket sales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Sample Raffle Entries */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">1984 Ford F-150 Restoration</h4>
                  <p className="text-sm text-muted-foreground">
                    Fully restored classic pickup truck with new engine and paint
                  </p>
                </div>
                <Badge>Active</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <span>1,250 / 2,000 tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>$15 per ticket</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>$18,750 raised</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Draw: Dec 15</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>23 days left</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Page
                </Button>
                <Button size="sm" variant="outline">Edit Raffle</Button>
                <Button size="sm" variant="outline">Ticket Sales</Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">Youth Tool Kit Raffle</h4>
                  <p className="text-sm text-muted-foreground">
                    Complete mechanic tool kit for aspiring young technicians
                  </p>
                </div>
                <Badge>Active</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <span>345 / 500 tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>$5 per ticket</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span>$1,725 raised</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Draw: Nov 30</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>8 days left</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Page
                </Button>
                <Button size="sm" variant="outline">Edit Raffle</Button>
                <Button size="sm" variant="outline">Ticket Sales</Button>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h4 className="font-semibold">Workshop Access Prize</h4>
                  <p className="text-sm text-muted-foreground">
                    6-month workshop access and mentorship program
                  </p>
                </div>
                <Badge variant="outline">Draft</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <span>0 / 200 tickets</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>$25 per ticket</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>$0 raised</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Start: Jan 15</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Not started</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Launch Raffle</Button>
                <Button size="sm" variant="outline">Edit Draft</Button>
                <Button size="sm" variant="outline">Preview</Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button>
              <Gift className="h-4 w-4 mr-2" />
              Create New Raffle
            </Button>
            <Button variant="outline">Import Ticket Sales</Button>
            <Button variant="outline">Raffle Analytics</Button>
          </div>
        </CardContent>
      </Card>

      {/* Raffle Management Tools */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Management</CardTitle>
            <CardDescription>
              Track ticket sales and manage purchaser information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Tickets Sold</span>
                <span className="font-semibold">1,595</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Payments</span>
                <span className="text-amber-600">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Confirmed Sales</span>
                <span className="text-green-600">1,572</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Ticket Price</span>
                <span>$11.75</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm">View All Tickets</Button>
              <Button size="sm" variant="outline">Export Data</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Draw Management</CardTitle>
            <CardDescription>
              Manage raffle draws and winner selection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-1">Upcoming Draws</h4>
                <p className="text-sm text-muted-foreground">Ford F-150 - November 30, 2024</p>
                <p className="text-sm text-muted-foreground">Tool Kit - December 15, 2024</p>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-1">Recent Winners</h4>
                <p className="text-sm text-muted-foreground">Honda Civic - Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">Tool Set - Mike Peterson</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm">Conduct Draw</Button>
              <Button size="sm" variant="outline">Winner History</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Raffle Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Raffle Templates</CardTitle>
          <CardDescription>
            Quick start templates for common raffle types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4 text-center">
              <Gift className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium mb-1">Vehicle Raffle</h4>
              <p className="text-sm text-muted-foreground mb-3">For restored cars and trucks</p>
              <Button size="sm" variant="outline">Use Template</Button>
            </div>

            <div className="border rounded-lg p-4 text-center">
              <Ticket className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium mb-1">Tool Kit Raffle</h4>
              <p className="text-sm text-muted-foreground mb-3">For youth education programs</p>
              <Button size="sm" variant="outline">Use Template</Button>
            </div>

            <div className="border rounded-lg p-4 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium mb-1">Experience Raffle</h4>
              <p className="text-sm text-muted-foreground mb-3">Workshop access and training</p>
              <Button size="sm" variant="outline">Use Template</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}