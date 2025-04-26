
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
      case "Special Order":
        return "text-purple-600";
      case "On Order":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBackground = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-50";
      case "Low Stock":
        return "bg-amber-50";
      case "Out of Stock":
        return "bg-red-50";
      case "Special Order":
        return "bg-purple-50";
      case "On Order":
        return "bg-blue-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className={`mt-4 px-4 py-3 ${getStatusBackground(status)} border border-gray-200 rounded-md`}>
      <div className="text-sm font-medium text-gray-700">
        Item Status:{" "}
        <span className={`font-semibold ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {status === "Special Order" 
          ? "This item is specially ordered for a specific job and not kept in inventory" 
          : status === "On Order" 
            ? "This item has been ordered and is awaiting delivery" 
            : "Status is automatically calculated based on quantity and reorder point"}
      </p>
    </div>
  );
}
