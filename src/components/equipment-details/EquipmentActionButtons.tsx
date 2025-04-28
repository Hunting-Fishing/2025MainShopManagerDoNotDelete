
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Wrench } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';
import { Equipment } from '@/types';
import { toast } from "@/hooks/use-toast";
import { WorkOrderStatusType, WorkOrderPriorityType, WorkOrder } from '@/types/workOrder';

interface EquipmentActionButtonsProps {
  equipment: Equipment;
}

export function EquipmentActionButtons({ equipment }: EquipmentActionButtonsProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const createWorkOrder = async () => {
    try {
      setLoading(true);
      
      // Create work order object with required properties
      const newWorkOrder: Partial<WorkOrder> = {
        customer: equipment.customer,
        customerId: "", // Add required property
        description: `Service for ${equipment.name} (${equipment.model})`,
        status: "pending" as WorkOrderStatusType,
        priority: "medium" as WorkOrderPriorityType,
        technician: "", // Default empty technician
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        notes: `Equipment details:\nManufacturer: ${equipment.manufacturer}\nSerial Number: ${equipment.serialNumber}\nCategory: ${equipment.category}\n\nMaintenance History: ${equipment.maintenanceHistory ? JSON.stringify(equipment.maintenanceHistory, null, 2) : 'None'}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        location: equipment.location
      };

      // Call createWorkOrder function - this was causing an error since we were passing an argument
      // but the import and function definition was missing
      await createWorkOrderInSystem(newWorkOrder);

      toast({
        title: "Work Order Created",
        description: `Successfully created a work order for ${equipment.name}.`,
        variant: "success",
      });

      navigate('/work-orders');
    } catch (error) {
      console.error("Error creating work order:", error);
      toast({
        title: "Error",
        description: "Failed to create work order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add this helper function to handle the work order creation
  const createWorkOrderInSystem = async (workOrder: Partial<WorkOrder>) => {
    // This would normally call an API endpoint or service to create the work order
    // For now, we'll simulate it with a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("Creating work order:", workOrder);
    // In a real implementation, this would call a service to create the work order
    return { ...workOrder, id: `WO-${Math.floor(Math.random() * 10000)}` };
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={createWorkOrder} disabled={loading}>
          <Wrench className="h-4 w-4 mr-2" />
          Create Work Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
