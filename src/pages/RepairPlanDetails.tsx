
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Check, Clock, Edit, Tag, Wrench, Trash, X, Settings } from "lucide-react";
import { RepairPlan, RepairTask } from "@/types/repairPlan";
import { formatDate } from "@/utils/workOrderUtils";

// Mock data for a repair plan (replace with real data in production)
const mockRepairPlan: RepairPlan = {
  id: "repair-1",
  equipmentId: "equipment-1",
  title: "HVAC System Overhaul",
  description: "Complete overhaul of the HVAC system including compressor replacement and ductwork inspection.",
  status: "scheduled",
  priority: "high",
  createdAt: "2023-11-01T10:00:00Z",
  updatedAt: "2023-11-02T14:30:00Z",
  scheduledDate: "2023-11-15",
  estimatedDuration: 8,
  assignedTechnician: "Michael Brown",
  costEstimate: 1250.00,
  customerApproved: true,
  notes: "Customer requested the work to be done before the holiday season.",
  tasks: [
    {
      id: "task-1",
      description: "Remove old compressor",
      estimatedHours: 1.5,
      completed: false,
      assignedTo: "Michael Brown",
    },
    {
      id: "task-2",
      description: "Install new compressor",
      estimatedHours: 2,
      completed: false,
      assignedTo: "Michael Brown",
    },
    {
      id: "task-3",
      description: "Inspect ductwork",
      estimatedHours: 2.5,
      completed: false,
      assignedTo: "Sarah Johnson",
    },
    {
      id: "task-4",
      description: "Clean air handler",
      estimatedHours: 1,
      completed: false,
      assignedTo: "David Lee",
    },
  ],
};

export default function RepairPlanDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [repairPlan, setRepairPlan] = useState<RepairPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, fetch the repair plan from your API
    const fetchRepairPlan = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For demo purposes, we're using mock data
        if (id) {
          setRepairPlan(mockRepairPlan);
        }
      } catch (error) {
        console.error("Error fetching repair plan:", error);
        toast({
          title: "Error",
          description: "Failed to load repair plan details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRepairPlan();
  }, [id]);
  
  const handleTaskStatusChange = async (taskId: string, completed: boolean) => {
    if (!repairPlan) return;
    
    try {
      // Update the task status in the local state
      const updatedTasks = repairPlan.tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      );
      
      // In a real app, you would save this update to your backend
      console.log(`Updating task ${taskId} to ${completed ? 'completed' : 'not completed'}`);
      
      // Update local state
      setRepairPlan({
        ...repairPlan,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      });
      
      toast({
        title: "Task Updated",
        description: `Task marked as ${completed ? 'completed' : 'not completed'}.`,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status.",
        variant: "destructive",
      });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-200 text-slate-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="text-lg text-slate-500">Loading repair plan details...</div>
      </div>
    );
  }
  
  if (!repairPlan) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <div className="text-lg text-slate-500 mb-4">Repair plan not found</div>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }
  
  const tasksCompleted = repairPlan.tasks.filter(task => task.completed).length;
  const totalTasks = repairPlan.tasks.length;
  const progress = totalTasks ? Math.round((tasksCompleted / totalTasks) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{repairPlan.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate(`/repair-plans/${repairPlan.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Plan
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="mr-2 h-5 w-5" />
                Plan Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">Description</h3>
                  <p className="mt-1 text-muted-foreground">{repairPlan.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Equipment</h3>
                  <p className="mt-1 text-muted-foreground">
                    {/* In a real app, fetch equipment details */}
                    HVAC System - Model XYZ-123
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <Badge className={`mt-1 ${getStatusColor(repairPlan.status)}`}>
                      {repairPlan.status.charAt(0).toUpperCase() + repairPlan.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Priority</h3>
                    <Badge className={`mt-1 ${getPriorityColor(repairPlan.priority)}`}>
                      {repairPlan.priority.charAt(0).toUpperCase() + repairPlan.priority.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Scheduled Date</h3>
                    <p className="mt-1 flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {repairPlan.scheduledDate ? formatDate(repairPlan.scheduledDate) : 'Not scheduled'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Estimated Duration</h3>
                    <p className="mt-1 flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {repairPlan.estimatedDuration} hours
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium">Assigned Technician</h3>
                    <p className="mt-1 text-muted-foreground">
                      {repairPlan.assignedTechnician || 'Unassigned'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Cost Estimate</h3>
                    <p className="mt-1 text-muted-foreground">
                      ${repairPlan.costEstimate?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Customer Approval</h3>
                  <p className="mt-1 flex items-center">
                    {repairPlan.customerApproved ? (
                      <Badge className="bg-green-100 text-green-800 flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        Not Approved
                      </Badge>
                    )}
                  </p>
                </div>
                
                {repairPlan.notes && (
                  <div>
                    <h3 className="font-medium">Notes</h3>
                    <p className="mt-1 text-muted-foreground">{repairPlan.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Repair Tasks ({tasksCompleted}/{totalTasks})
                </div>
                <Badge className={progress === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {progress}% Complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {repairPlan.tasks.length === 0 ? (
                  <div className="text-center p-6 border border-dashed rounded-md text-muted-foreground">
                    No tasks added to this repair plan.
                  </div>
                ) : (
                  repairPlan.tasks.map((task, index) => (
                    <div key={task.id} className="border rounded-md p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className="mt-1 mr-2">
                            <Checkbox 
                              checked={task.completed} 
                              onCheckedChange={(checked) => {
                                handleTaskStatusChange(task.id, !!checked);
                              }}
                            />
                          </div>
                          <div>
                            <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.description}
                            </h4>
                            <div className="flex flex-wrap items-center mt-1 gap-2">
                              <Badge variant="outline" className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {task.estimatedHours} hours
                              </Badge>
                              {task.assignedTo && (
                                <Badge variant="outline" className="flex items-center">
                                  Assigned to: {task.assignedTo}
                                </Badge>
                              )}
                            </div>
                            {task.notes && (
                              <p className="mt-2 text-sm text-muted-foreground">{task.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-muted pl-4">
                  <h4 className="font-medium">Created</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(repairPlan.createdAt)}
                  </p>
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <h4 className="font-medium">Last Updated</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(repairPlan.updatedAt)}
                  </p>
                </div>
                {repairPlan.scheduledDate && (
                  <div className="border-l-2 border-muted pl-4">
                    <h4 className="font-medium">Scheduled</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(repairPlan.scheduledDate)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full" variant="default">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Repair
                </Button>
                <Button className="w-full" variant="outline">
                  <Tag className="mr-2 h-4 w-4" />
                  Create Work Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
