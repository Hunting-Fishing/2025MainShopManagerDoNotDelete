
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { RepairPlan } from "@/types/repairPlan";
import { RepairPlanHeader } from "@/components/repair-plan/RepairPlanHeader";
import { RepairPlanDetailsCard } from "@/components/repair-plan/detail/RepairPlanDetailsCard";
import { RepairPlanTasksCard } from "@/components/repair-plan/detail/RepairPlanTasksCard";
import { RepairPlanActivityCard } from "@/components/repair-plan/detail/RepairPlanActivityCard";
import { RepairPlanActionsCard } from "@/components/repair-plan/detail/RepairPlanActionsCard";
import { getStatusColor, getPriorityColor } from "@/utils/repairPlanUtils";

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
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <RepairPlanHeader repairPlan={repairPlan} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <RepairPlanDetailsCard 
            repairPlan={repairPlan} 
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
          />
          
          <RepairPlanTasksCard
            repairPlan={repairPlan}
            onTaskStatusChange={handleTaskStatusChange}
          />
        </div>
        
        <div className="space-y-6">
          <RepairPlanActivityCard repairPlan={repairPlan} />
          <RepairPlanActionsCard />
        </div>
      </div>
    </div>
  );
}
