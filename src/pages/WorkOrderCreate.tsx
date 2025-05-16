
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { WorkOrderCreateForm } from "@/components/work-orders/WorkOrderCreateForm";
import { useWorkOrderForm } from "@/hooks/useWorkOrderForm";

// Define the WorkOrderTemplate type to match the expected structure
interface WorkOrderTemplate {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  technician: string;
  notes: string;
  usage_count: number;
  last_used: string;
}

const WorkOrderCreate = () => {
  const navigate = useNavigate();
  const { form, isSubmitting, handleSubmit } = useWorkOrderForm();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Mock templates for demo purposes
  const workOrderTemplates: WorkOrderTemplate[] = [
    {
      id: "1",
      name: "Oil Change",
      description: "Standard oil change service",
      status: "pending",
      technician: "John Smith",
      notes: "Use synthetic oil as default",
      usage_count: 54,
      last_used: "2023-05-10",
    },
    {
      id: "2",
      name: "Brake Inspection",
      description: "Thorough brake system inspection",
      status: "pending",
      technician: "Jane Doe",
      notes: "Check brake fluid levels",
      usage_count: 32,
      last_used: "2023-05-15",
    },
    {
      id: "3",
      name: "Tire Rotation",
      description: "Standard tire rotation service",
      status: "pending",
      technician: "Mike Johnson",
      notes: "Check tire pressure",
      usage_count: 41,
      last_used: "2023-05-12",
    },
  ];

  const onSubmit = async (values: any) => {
    try {
      await handleSubmit(values);
      setSuccessMessage("Work order created successfully!");
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate("/work-orders");
      }, 2000);
    } catch (error) {
      console.error("Error creating work order:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <WorkOrderFormHeader 
        title="Create Work Order" 
        description="Create a new work order for a customer's vehicle service" 
      />

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      <WorkOrderCreateForm
        form={form}
        onSubmit={onSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default WorkOrderCreate;
