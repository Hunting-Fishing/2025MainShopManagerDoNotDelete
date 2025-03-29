
import React from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddInventoryButtonProps {
  onShowDialog: () => void;
}

export const AddInventoryButton: React.FC<AddInventoryButtonProps> = ({ onShowDialog }) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-1"
      onClick={onShowDialog}
    >
      <Package className="h-4 w-4" />
      Add Inventory Item
    </Button>
  );
};
