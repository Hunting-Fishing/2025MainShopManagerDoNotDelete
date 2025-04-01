
import React from "react";
import { Button } from "@/components/ui/button";

interface InventoryFormActionsProps {
  loading: boolean;
  onCancel: () => void;
  submitLabel?: string;
}

export function InventoryFormActions({
  loading,
  onCancel,
  submitLabel = "Add Item"
}: InventoryFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : submitLabel}
      </Button>
    </div>
  );
}
