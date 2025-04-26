
import React from "react";
import { Button } from "@/components/ui/button";

interface InventoryFormActionsProps {
  loading: boolean;
  onCancel: () => void;
  isEditing: boolean;
}

export function InventoryFormActions({ loading, onCancel, isEditing }: InventoryFormActionsProps) {
  return (
    <div className="flex justify-end gap-4">
      <Button 
        type="button" 
        variant="outline"
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={loading}
      >
        {loading ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
      </Button>
    </div>
  );
}
