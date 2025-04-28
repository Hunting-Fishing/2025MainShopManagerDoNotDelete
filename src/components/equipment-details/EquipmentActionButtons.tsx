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
import { createWorkOrder } from '@/utils/workOrders';
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
      const newWorkOrder: Omit<WorkOrder, "date" | "id"> = {
        customer: equipment.customer,
        customerId: "", // Add required property
        description: `Service for ${equipment.name} (${equipment.model})`,
        status: "pending" as WorkOrderStatusType,
        priority: "medium" as WorkOrderPriorityType,
        technician: "", // Default empty technician
        date: new Date().toISOString(), // Required even though Omit
        location: equipment.location,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        notes: `Equipment details:\nManufacturer: ${equipment.manufacturer}\nSerial Number: ${equipment.serial_number}\nCategory: ${equipment.category}\n\nMaintenance History: ${equipment.maintenance_history ? JSON.stringify(equipment.maintenance_history, null, 2) : 'None'}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Call createWorkOrder function
      await createWorkOrder(newWorkOrder);

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
