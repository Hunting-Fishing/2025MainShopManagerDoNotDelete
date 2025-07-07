import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, DollarSign, Target, CheckCircle, AlertTriangle, Plus } from "lucide-react";

interface HybridActivity {
  id: string;
  activity_name: string;
  activity_type: string;
  for_profit_percentage: number;
  non_profit_percentage: number;
  status: string;
  revenue_for_profit: number;
  revenue_non_profit: number;
}

interface ComplianceRequirement {
  id: string;
  requirement_name: string;
  applicable_to: string;
  completion_status: string;
  due_date: string;
  priority_level: string;
}

export function HybridModelTab() {
  const { toast } = useToast();
  const [activities, setActivities] = useState<HybridActivity[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRequirement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHybridData();
  }, []);

  const loadHybridData = async () => {
    try {
      const [activitiesResponse, complianceResponse] = await Promise.all([
        supabase.from("hybrid_activities").select("*").order("created_at", { ascending: false }),
        supabase.from("compliance_requirements").select("*").order("due_date", { ascending: true })
      ]);

      if (activitiesResponse.data) setActivities(activitiesResponse.data);
      if (complianceResponse.data) setCompliance(complianceResponse.data);
    } catch (error) {
      console.error("Error loading hybrid data:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'overdue': return 'text-red-600';
      case 'in_progress': return 'text-blue-600';
      default: return 'text-yellow-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Hybrid Model Management</h2>
        <p className="text-muted-foreground">
          Manage dual-purpose activities, separate accounting streams, and compliance tracking
        </p>
      </div>

      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="accounting" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Accounting
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Impact
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Hybrid Activities
                  </CardTitle>
                  <CardDescription>
                    Track activities with both for-profit and non-profit components
                  </CardDescription>
                </div>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Activity
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hybrid activities yet. Create your first activity to start tracking dual-purpose initiatives.
                  </div>
                ) : (
                  activities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{activity.activity_name}</h4>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">For-Profit Allocation</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={activity.for_profit_percentage} className="flex-1" />
                            <span className="text-sm font-medium">{activity.for_profit_percentage}%</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Revenue: ${activity.revenue_for_profit?.toLocaleString() || '0'}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-muted-foreground">Non-Profit Allocation</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={activity.non_profit_percentage} className="flex-1" />
                            <span className="text-sm font-medium">{activity.non_profit_percentage}%</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Revenue: ${activity.revenue_non_profit?.toLocaleString() || '0'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Separate Accounting Streams
              </CardTitle>
              <CardDescription>
                Manage segregated accounting for for-profit and non-profit activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Coming Soon</h4>
                <p className="text-sm text-muted-foreground">
                  Accounting stream management interface will be available in the next update. 
                  The database structure is now in place for:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Separate chart of accounts for each stream</li>
                  <li>Transaction allocation tracking</li>
                  <li>Automated percentage-based allocations</li>
                  <li>Compliance reporting by stream</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Impact Measurement
              </CardTitle>
              <CardDescription>
                Track and measure social, environmental, and economic impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Coming Soon</h4>
                <p className="text-sm text-muted-foreground">
                  Impact measurement interface will be available in the next update. 
                  The database structure is now in place for:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                  <li>Quantitative and qualitative impact metrics</li>
                  <li>Baseline and target tracking</li>
                  <li>Progress monitoring and reporting</li>
                  <li>Impact verification and validation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Compliance Tracking
                  </CardTitle>
                  <CardDescription>
                    Monitor regulatory requirements for hybrid structures
                  </CardDescription>
                </div>
                <Button size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Requirement
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {compliance.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No compliance requirements configured. Add requirements to track regulatory obligations.
                  </div>
                ) : (
                  compliance.map((req) => (
                    <div key={req.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(req.priority_level)}
                          <h4 className="font-medium">{req.requirement_name}</h4>
                        </div>
                        <Badge variant="outline" className={getComplianceColor(req.completion_status)}>
                          {req.completion_status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-muted-foreground">Applies To</Label>
                          <div className="font-medium">{req.applicable_to}</div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Due Date</Label>
                          <div className="font-medium">
                            {req.due_date ? new Date(req.due_date).toLocaleDateString() : 'No due date'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Priority</Label>
                          <div className="font-medium capitalize">{req.priority_level}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Mark Complete</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}