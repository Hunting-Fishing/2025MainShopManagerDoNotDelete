
import React from "react";
import { ArrowDown, ArrowUp, DollarSign, Package } from "lucide-react";

interface InventoryStatsProps {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({
  totalItems,
  lowStockCount,
  outOfStockCount,
  totalValue,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white shadow-md rounded-xl border border-gray-100 p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Items</p>
            <h3 className="text-2xl font-bold">{totalItems}</h3>
          </div>
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <Package className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl border border-gray-100 p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Low Stock</p>
            <h3 className="text-2xl font-bold">{lowStockCount}</h3>
          </div>
          <div className="bg-orange-100 text-orange-600 p-2 rounded-full">
            <ArrowDown className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl border border-gray-100 p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Out of Stock</p>
            <h3 className="text-2xl font-bold">{outOfStockCount}</h3>
          </div>
          <div className="bg-red-100 text-red-600 p-2 rounded-full">
            <ArrowUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl border border-gray-100 p-4">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Value</p>
            <h3 className="text-2xl font-bold">{formatCurrency(totalValue)}</h3>
          </div>
          <div className="bg-green-100 text-green-600 p-2 rounded-full">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
