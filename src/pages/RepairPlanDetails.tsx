
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface RepairPlan {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: string;
  estimated_cost: number;
  actual_cost: number;
  created_at: string;
  updated_at: string;
  equipmentId: string;
  createdAt: string;
  updatedAt: string;
  estimatedDuration: number;
  tasks: RepairTask[];
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
        updated_at: new Date().toISOString(),
        equipmentId: 'mock-equipment-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDuration: 8,
        tasks: []
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-4">{repairPlan.title}</h1>
            <p className="text-gray-600 mb-4">{repairPlan.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Status:</span> {repairPlan.status}
              </div>
              <div>
                <span className="font-medium">Priority:</span> {repairPlan.priority}
              </div>
              <div>
                <span className="font-medium">Estimated Cost:</span> ${repairPlan.estimated_cost}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {repairPlan.estimatedDuration} hours
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Tasks</h2>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-gray-600 text-sm">{task.description}</p>
                  <div className="mt-2 flex justify-between text-sm">
                    <span>Status: {task.status}</span>
                    <span>Assigned to: {task.assigned_to}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>
            <p className="text-gray-600">No recent activity.</p>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
                Update Status
              </button>
              <button className="w-full border border-gray-300 py-2 px-4 rounded hover:bg-gray-50">
                Add Task
              </button>
              <button className="w-full border border-gray-300 py-2 px-4 rounded hover:bg-gray-50">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
