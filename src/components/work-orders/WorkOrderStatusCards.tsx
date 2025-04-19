
import React, { useMemo } from 'react';
import { WorkOrder } from "@/types/workOrder";
import { statusConfig } from "@/utils/workOrders/statusManagement";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2
} from "lucide-react";

interface WorkOrderStatusCardsProps {
  workOrders: WorkOrder[];
  loading: boolean;
}

export function WorkOrderStatusCards({ workOrders, loading }: WorkOrderStatusCardsProps) {
  // Calculate counts
  const counts = useMemo(() => {
    const result = {
      pending: 0,
      'in-progress': 0,
      completed: 0,
      cancelled: 0,
      total: workOrders.length
    };
    
    workOrders.forEach(order => {
      if (result[order.status as keyof typeof result] !== undefined) {
        result[order.status as keyof typeof result]++;
      }
    });
    
    return result;
  }, [workOrders]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "In Queue",
      count: counts.pending,
      icon: <ClipboardList className="h-5 w-5" />,
      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
      iconColor: "text-yellow-500"
    },
    {
      title: "In Progress",
      count: counts["in-progress"],
      icon: <Clock className="h-5 w-5" />,
      color: "bg-blue-50 border-blue-200 text-blue-800",
      iconColor: "text-blue-500"
    },
    {
      title: "Completed",
      count: counts.completed,
      icon: <CheckCircle className="h-5 w-5" />,
      color: "bg-green-50 border-green-200 text-green-800",
      iconColor: "text-green-500"
    },
    {
      title: "Cancelled",
      count: counts.cancelled,
      icon: <XCircle className="h-5 w-5" />,
      color: "bg-red-50 border-red-200 text-red-800",
      iconColor: "text-red-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className={`rounded-xl border p-4 shadow-sm flex items-center justify-between ${card.color}`}
        >
          <div>
            <h3 className="text-sm font-medium">{card.title}</h3>
            <p className="text-2xl font-bold mt-1">{card.count}</p>
          </div>
          <div className={`p-3 rounded-full ${card.color.replace("bg-", "bg-opacity-30 ")} ${card.iconColor}`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
