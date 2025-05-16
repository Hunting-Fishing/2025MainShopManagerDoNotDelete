
import React from "react";

interface InventoryErrorStateProps {
  error: string;
}

export function InventoryErrorState({ error }: InventoryErrorStateProps) {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700">Error loading inventory: {error}</p>
      </div>
    </div>
  );
}
