
import { AlertCircle } from "lucide-react";
import { InventoryItemExtended } from "@/types/inventory";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function InventoryAlerts() {
  const { lowStockItems, outOfStockItems } = useInventoryManager();
  
  const totalAlerts = lowStockItems.length + outOfStockItems.length;
  
  if (totalAlerts === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center text-sm text-slate-800">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <AlertCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold">All inventory levels are good</h3>
            <p className="text-slate-500">No items require attention at this time</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h3 className="font-medium text-slate-900">Inventory Alerts</h3>
      </div>
      
      <div className="divide-y divide-slate-200">
        {outOfStockItems.length > 0 && (
          <div className="p-4 bg-red-50">
            <div className="flex items-start">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-900">{outOfStockItems.length} item(s) out of stock</h4>
                <p className="text-sm text-red-700 mb-2">These items need to be reordered immediately</p>
                <div className="flex flex-wrap gap-2">
                  {outOfStockItems.slice(0, 3).map(item => (
                    <Link 
                      key={item.id} 
                      to={`/inventory/${item.id}`}
                      className="bg-white border border-red-200 px-2 py-1 rounded text-xs text-red-800"
                    >
                      {item.name}
                    </Link>
                  ))}
                  {outOfStockItems.length > 3 && (
                    <span className="bg-white border border-red-200 px-2 py-1 rounded text-xs text-red-800">
                      +{outOfStockItems.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {lowStockItems.length > 0 && (
          <div className="p-4 bg-amber-50">
            <div className="flex items-start">
              <div className="bg-amber-100 p-2 rounded-full mr-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900">{lowStockItems.length} item(s) low on stock</h4>
                <p className="text-sm text-amber-700 mb-2">These items should be reordered soon</p>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.slice(0, 3).map(item => (
                    <Link 
                      key={item.id} 
                      to={`/inventory/${item.id}`}
                      className="bg-white border border-amber-200 px-2 py-1 rounded text-xs text-amber-800"
                    >
                      {item.name} ({item.quantity} left)
                    </Link>
                  ))}
                  {lowStockItems.length > 3 && (
                    <span className="bg-white border border-amber-200 px-2 py-1 rounded text-xs text-amber-800">
                      +{lowStockItems.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
