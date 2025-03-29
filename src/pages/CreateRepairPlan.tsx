
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RepairPlanForm } from "@/components/repair-plan/RepairPlanForm";
import { RepairPlanFormValues } from "@/types/repairPlan";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Wrench } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Mock data for equipment and technicians (replace with real data in production)
const mockEquipmentList = [
  {
    id: "equipment-1",
    name: "HVAC System",
    model: "Model XYZ-123",
    serialNumber: "SN12345",
    manufacturer: "CoolAir",
    category: "HVAC",
    status: "operational" as const,
    customer: "Acme Inc.",
    location: "Main Building",
    nextMaintenanceDate: "2023-12-15",
    maintenanceFrequency: "quarterly" as const,
    lastMaintenanceDate: "2023-09-15",
    warrantyExpiryDate: "2024-08-20",
    warrantyStatus: "active" as const,
    purchaseDate: "2022-08-20",
    installDate: "2022-09-01",
  },
  {
    id: "equipment-2",
    name: "Generator",
    model: "PowerGen 5000",
    serialNumber: "PG5K-789",
    manufacturer: "PowerSystems",
    category: "Power Generator",
    status: "maintenance-required" as const,
    customer: "City Hospital",
    location: "Emergency Wing",
    nextMaintenanceDate: "2023-11-10",
    maintenanceFrequency: "monthly" as const,
    lastMaintenanceDate: "2023-10-10",
    warrantyExpiryDate: "2025-05-15",
    warrantyStatus: "active" as const,
    purchaseDate: "2023-05-15",
    installDate: "2023-05-25",
  },
];

// Mock technicians data
const mockTechnicians = [
  "Michael Brown",
  "Sarah Johnson",
  "David Lee",
  "Emily Chen",
];

export default function CreateRepairPlan() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleCreateRepairPlan = async (values: RepairPlanFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, you would save this to your backend/database
      console.log("Creating repair plan:", values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new repair plan object
      const newRepairPlan = {
        ...values,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Success notification
      toast({
        title: "Repair Plan Created",
        description: "The repair plan has been created successfully.",
      });
      
      // Navigate to the equipment details page or repair plans list
      navigate(`/equipment/${values.equipmentId}`);
    } catch (error) {
      console.error("Error creating repair plan:", error);
      toast({
        title: "Error",
        description: "Failed to create repair plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
          <h1 className="text-2xl font-bold">Create Repair Plan</h1>
        </div>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-lg flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            New Repair Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-4">
            Create a detailed repair plan for equipment that needs maintenance or repairs.
            Add tasks, assign technicians, and estimate costs.
          </p>
        </CardContent>
      </Card>
      
      <RepairPlanForm 
        equipmentList={mockEquipmentList}
        technicians={mockTechnicians}
        onSubmit={handleCreateRepairPlan}
      />
    </div>
  );
}
