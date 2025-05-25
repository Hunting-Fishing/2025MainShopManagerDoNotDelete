
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RepairPlanForm } from '@/components/repair-plan/RepairPlanForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { fetchEquipment } from '@/services/equipmentService';
import { toast } from '@/hooks/use-toast';
import type { EquipmentWithMaintenance } from '@/services/equipmentService';
import type { RepairPlanFormValues } from '@/types/repairPlan';

export default function CreateRepairPlan() {
  const navigate = useNavigate();
  const [equipmentList, setEquipmentList] = useState<EquipmentWithMaintenance[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock technicians data
  const technicians = [
    "John Smith",
    "Jane Doe", 
    "Mike Johnson",
    "Sarah Wilson"
  ];

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const equipment = await fetchEquipment();
        setEquipmentList(equipment);
      } catch (error) {
        console.error("Error loading equipment:", error);
        toast({
          title: "Error",
          description: "Failed to load equipment list",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadEquipment();
  }, []);

  const handleSubmit = async (values: RepairPlanFormValues) => {
    try {
      // Here you would typically save the repair plan to the database
      console.log("Repair plan data:", values);
      
      toast({
        title: "Success",
        description: "Repair plan created successfully",
      });
      
      // Navigate back to repair plans list
      navigate('/repair-plans');
    } catch (error) {
      console.error("Error creating repair plan:", error);
      toast({
        title: "Error", 
        description: "Failed to create repair plan",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create Repair Plan</h1>
      </div>
      
      <RepairPlanForm 
        equipmentList={equipmentList}
        technicians={technicians}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
