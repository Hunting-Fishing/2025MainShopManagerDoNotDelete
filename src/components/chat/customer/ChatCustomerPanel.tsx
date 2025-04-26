
import React from "react";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { Vehicle } from "@/types/vehicle"; // Changed import
import { WorkOrder } from "@/types/workOrder";
import { ChevronRight, Car, Clipboard, FileText, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { formatRelativeTime } from "@/utils/dateUtils";

interface ChatCustomerPanelProps {
  customer: Customer | null;
  vehicles?: Vehicle[];
  workOrders?: WorkOrder[];
}

export const ChatCustomerPanel: React.FC<ChatCustomerPanelProps> = ({
  customer,
  vehicles = [],
  workOrders = [],
}) => {
  if (!customer) return null;

  return (
    <div className="border-l border-slate-200 dark:border-slate-700 h-full w-80 flex-shrink-0 bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Customer Details</h3>
          <Link to={`/customers/${customer.id}`}>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <span className="mr-1">View</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="text-lg font-medium">{customer.first_name} {customer.last_name}</div>
        {customer.company && (
          <div className="text-sm text-slate-500 dark:text-slate-400">{customer.company}</div>
        )}
        
        <div className="mt-4 space-y-2">
          {customer.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-slate-500" />
              <a href={`tel:${customer.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {customer.phone}
              </a>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-slate-500" />
              <a href={`mailto:${customer.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                {customer.email}
              </a>
            </div>
          )}
          {customer.address && (
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {customer.address}
              {customer.city && `, ${customer.city}`}
              {customer.state && `, ${customer.state}`}
              {customer.postal_code && ` ${customer.postal_code}`}
            </div>
          )}
        </div>
      </div>
      
      {vehicles.length > 0 && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold mb-2 flex items-center">
            <Car className="h-4 w-4 mr-1 text-slate-500" />
            Vehicles
          </h4>
          <div className="space-y-2">
            {vehicles.slice(0, 3).map((vehicle) => (
              <Link 
                key={vehicle.id} 
                to={`/customers/${customer.id}?tab=vehicles&vehicle=${vehicle.id}`}
                className="block p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="font-medium text-sm">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </div>
                {vehicle.license_plate && (
                  <div className="text-xs text-slate-500">
                    Plate: {vehicle.license_plate}
                  </div>
                )}
              </Link>
            ))}
            {vehicles.length > 3 && (
              <Link to={`/customers/${customer.id}?tab=vehicles`} className="text-xs text-blue-600 dark:text-blue-400 block mt-1">
                View all {vehicles.length} vehicles
              </Link>
            )}
          </div>
        </div>
      )}
      
      {workOrders.length > 0 && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold mb-2 flex items-center">
            <Clipboard className="h-4 w-4 mr-1 text-slate-500" />
            Recent Work Orders
          </h4>
          <div className="space-y-2">
            {workOrders.slice(0, 3).map((workOrder) => (
              <Link 
                key={workOrder.id} 
                to={`/work-orders/${workOrder.id}`}
                className="block p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="font-medium text-sm">
                  {workOrder.description?.substring(0, 40) || "Work Order"}
                  {workOrder.description?.length > 40 ? "..." : ""}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    workOrder.status === "completed" ? "bg-green-100 text-green-800 border border-green-300" : 
                    workOrder.status === "in-progress" ? "bg-blue-100 text-blue-800 border border-blue-300" :
                    workOrder.status === "cancelled" ? "bg-red-100 text-red-800 border border-red-300" :
                    "bg-yellow-100 text-yellow-800 border border-yellow-300"
                  }`}>
                    {workOrder.status}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatRelativeTime(workOrder.date || '')}
                  </span>
                </div>
              </Link>
            ))}
            {workOrders.length > 3 && (
              <Link to={`/customers/${customer.id}?tab=work-orders`} className="text-xs text-blue-600 dark:text-blue-400 block mt-1">
                View all {workOrders.length} work orders
              </Link>
            )}
          </div>
        </div>
      )}
      
      <div className="p-4">
        <h4 className="font-semibold mb-2 flex items-center">
          <FileText className="h-4 w-4 mr-1 text-slate-500" />
          Communication History
        </h4>
        <Link 
          to={`/customers/${customer.id}?tab=communications`}
          className="w-full text-center block text-sm py-1.5 px-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          View Communication History
        </Link>
      </div>
    </div>
  );
};
