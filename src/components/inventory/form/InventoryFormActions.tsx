
import React from "react";
import { Button } from "@/components/ui/button";

interface InventoryFormActionsProps {
  loading: boolean;
  onCancel: () => void;
  submitLabel?: string;
  showSpecialOrderButton?: boolean;
  onSpecialOrder?: () => void;
}

export function InventoryFormActions({
  loading,
  onCancel,
  submitLabel = "Add Item",
  showSpecialOrderButton = false,
  onSpecialOrder
}: InventoryFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      {showSpecialOrderButton && onSpecialOrder && (
        <Button type="button" variant="outline" onClick={onSpecialOrder}>
          Create Special Order
        </Button>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : submitLabel}
      </Button>
    </div>
  );
}
