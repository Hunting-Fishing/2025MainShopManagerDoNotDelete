
import React from "react";
import { AddInventoryButton } from "./AddInventoryButton";

interface InventorySectionHeaderProps {
  onShowDialog: () => void;
}

export const InventorySectionHeader: React.FC<InventorySectionHeaderProps> = ({ 
  onShowDialog 
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-muted-foreground">
        Add parts and materials from inventory that will be used for this work order
      </div>
      
      <AddInventoryButton onShowDialog={onShowDialog} />
    </div>
  );
};
