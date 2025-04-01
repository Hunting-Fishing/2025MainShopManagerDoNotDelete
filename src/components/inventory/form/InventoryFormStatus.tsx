
import React from "react";

interface InventoryFormStatusProps {
  status: string;
}

export function InventoryFormStatus({ status }: InventoryFormStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "text-green-600";
      case "Low Stock":
        return "text-amber-600";
      case "Out of Stock":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="mt-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md">
      <div className="text-sm font-medium text-gray-700">
        Item Status:{" "}
        <span className={`font-semibold ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Status is automatically calculated based on quantity and reorder point
      </p>
    </div>
  );
}
