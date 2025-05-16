
import { useNavigate } from "react-router-dom";
import { InventoryForm } from "@/components/inventory/form/InventoryForm";
import { InventoryHeader } from "@/components/inventory/InventoryHeader";
import { useInventoryCrud } from "@/hooks/inventory/useInventoryCrud";
import { InventoryItemExtended } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

export default function InventoryAdd() {
  const navigate = useNavigate();
  const { addItem, isLoading } = useInventoryCrud();

  const handleSubmit = async (formData: Omit<InventoryItemExtended, "id">) => {
    try {
      await addItem(formData);
      toast({
        variant: "success",
        title: "Success",
        description: `${formData.name} has been added to inventory`
      });
      navigate("/inventory");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add inventory item"
      });
      console.error("Error creating inventory item:", error);
    }
  };

  const handleCancel = () => {
    navigate("/inventory");
  };

  return (
    <div className="space-y-6">
      <InventoryHeader />
      <div className="container mx-auto">
        <InventoryForm 
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
