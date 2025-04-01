
import { useNavigate } from "react-router-dom";
import { InventoryForm } from "@/components/inventory/form/InventoryForm";
import { InventoryAddHeader } from "@/components/inventory/form/InventoryAddHeader";
import { useInventoryCrud } from "@/hooks/inventory/useInventoryCrud";
import { InventoryItemExtended } from "@/types/inventory";
import { toast } from "@/hooks/use-toast";

export default function InventoryAdd() {
  const navigate = useNavigate();
  const { createItem, loading } = useInventoryCrud();

  const handleSubmit = async (formData: Omit<InventoryItemExtended, "id">) => {
    try {
      await createItem(formData);
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
    <div className="container mx-auto py-6">
      <InventoryAddHeader onCancel={handleCancel} />
      <InventoryForm 
        onSubmit={handleSubmit}
        loading={loading}
        onCancel={handleCancel}
      />
    </div>
  );
}
