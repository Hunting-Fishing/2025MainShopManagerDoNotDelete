
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { RepairPlan } from "@/types/repairPlan";
import { RepairPlanHeader } from "@/components/repair-plan/RepairPlanHeader";
import { RepairPlanDetailsCard } from "@/components/repair-plan/detail/RepairPlanDetailsCard";
import { RepairPlanTasksCard } from "@/components/repair-plan/detail/RepairPlanTasksCard";
import { RepairPlanActivityCard } from "@/components/repair-plan/detail/RepairPlanActivityCard";
import { RepairPlanActionsCard } from "@/components/repair-plan/detail/RepairPlanActionsCard";
import { getStatusColor, getPriorityColor } from "@/utils/repairPlanUtils";
import { supabase } from "@/lib/supabase";

export default function RepairPlanDetails() {
  const { id } = useParams<{ id: string }>();
  const [repairPlan, setRepairPlan] = useState<RepairPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRepairPlan = async () => {
      setIsLoading(true);
      try {
        if (!id) {
          setError("No repair plan ID provided");
          return;
        }
        
        const { data, error } = await supabase
          .from('repair_plans')
          .select(`
            *,
            tasks:repair_plan_tasks(*)
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setRepairPlan(data as RepairPlan);
        } else {
          setError("Repair plan not found");
        }
      } catch (err: any) {
        console.error("Error fetching repair plan:", err);
        setError(err.message || "Failed to load repair plan details.");
        toast("Error", {
          description: "Failed to load repair plan details."
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
      // Update the task status in Supabase
      const { error } = await supabase
        .from('repair_plan_tasks')
        .update({ completed })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Update the local state
      const updatedTasks = repairPlan.tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      );
      
      // Update local state
      setRepairPlan({
        ...repairPlan,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      });
      
      toast("Task Updated", {
        description: `Task marked as ${completed ? 'completed' : 'not completed'}.`
      });
    } catch (error: any) {
      console.error("Error updating task:", error);
      toast("Error", {
        description: "Failed to update task status."
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
