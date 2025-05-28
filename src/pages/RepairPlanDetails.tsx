
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RepairPlanDetailsCard } from '@/components/repair-plan/detail/RepairPlanDetailsCard';
import { RepairPlanTasksCard } from '@/components/repair-plan/detail/RepairPlanTasksCard';
import { RepairPlanActionsCard } from '@/components/repair-plan/detail/RepairPlanActionsCard';
import { RepairPlanActivityCard } from '@/components/repair-plan/detail/RepairPlanActivityCard';
import { useToast } from '@/hooks/use-toast';

interface RepairPlan {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimated_cost: number;
  actual_cost: number;
  created_at: string;
  updated_at: string;
}

interface RepairTask {
  id: string;
  repair_plan_id: string;
  title: string;
  description: string;
  status: string;
  estimated_hours: number;
  actual_hours: number;
  assigned_to: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export default function RepairPlanDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [repairPlan, setRepairPlan] = useState<RepairPlan | null>(null);
  const [tasks, setTasks] = useState<RepairTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRepairPlanData();
    }
  }, [id]);

  const fetchRepairPlanData = async () => {
    try {
      setLoading(true);
      
      // Mock data since repair_plans table doesn't exist in current schema
      const mockRepairPlan: RepairPlan = {
        id: id!,
        title: 'Engine Repair Plan',
        description: 'Complete engine overhaul and maintenance',
        status: 'in_progress',
        priority: 'high',
        estimated_cost: 2500,
        actual_cost: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockTasks: RepairTask[] = [
        {
          id: '1',
          repair_plan_id: id!,
          title: 'Replace engine oil',
          description: 'Change engine oil and filter',
          status: 'completed',
          estimated_hours: 2,
          actual_hours: 1.5,
          assigned_to: 'John Doe',
          completed: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          repair_plan_id: id!,
          title: 'Check spark plugs',
          description: 'Inspect and replace spark plugs if needed',
          status: 'in_progress',
          estimated_hours: 1,
          actual_hours: 0,
          assigned_to: 'Jane Smith',
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setRepairPlan(mockRepairPlan);
      setTasks(mockTasks);

    } catch (error: any) {
      console.error('Error fetching repair plan data:', error);
      toast({
        title: "Error",
        description: "Failed to load repair plan details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<RepairTask>) => {
    try {
      // Mock update - in real implementation, this would update the database
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));

      toast({
        title: "Task updated",
        description: "Task has been updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading repair plan...</div>
      </div>
    );
  }

  if (!repairPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Repair plan not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <RepairPlanDetailsCard repairPlan={repairPlan} />
          <RepairPlanTasksCard 
            tasks={tasks} 
            onTaskUpdate={handleTaskUpdate}
          />
          <RepairPlanActivityCard repairPlanId={repairPlan.id} />
        </div>
        
        <div className="lg:col-span-1">
          <RepairPlanActionsCard 
            repairPlan={repairPlan}
            onUpdate={fetchRepairPlanData}
          />
        </div>
      </div>
    </div>
  );
}
