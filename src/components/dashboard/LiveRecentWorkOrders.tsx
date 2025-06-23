import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Wrench, RefreshCw, AlertCircle } from "lucide-react";
import { getRecentWorkOrders } from "@/services/dashboard/workOrderService";
import { RecentWorkOrder } from "@/types/dashboard";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeText = status.replace(/_/g, " ");
  badgeText = badgeText.replace(/-/g, " ");
  badgeText = badgeText.charAt(0).toUpperCase() + badgeText.slice(1);

  let badgeColor = "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "completed") {
    badgeColor = "bg-green-100 text-green-700 border-green-200";
  } else if (status === "pending") {
    badgeColor = "bg-orange-100 text-orange-700 border-orange-200";
  } else if (status === "in_progress" || status === "in-progress") {
    badgeColor = "bg-purple-100 text-purple-700 border-purple-200";
  } else if (status === "cancelled" || status === "canceled") {
    badgeColor = "bg-red-100 text-red-700 border-red-200";
  }

  return (
    <Badge variant="outline" className={`${badgeColor} text-xs font-medium`}>
      {badgeText}
    </Badge>
  );
};

interface PriorityIconProps {
    priority: string;
}

const PriorityIcon: React.FC<PriorityIconProps> = ({ priority }) => {
    let iconColor = "text-slate-500";
    if (priority === "high") {
        iconColor = "text-red-500";
    } else if (priority === "medium") {
        iconColor = "text-orange-500";
    } else if (priority === "low") {
        iconColor = "text-green-500";
    }

    return (
        <AlertCircle className={`h-4 w-4 ${iconColor}`} />
    );
};

export function LiveRecentWorkOrders() {
  const [workOrders, setWorkOrders] = useState<RecentWorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getRecentWorkOrders();
        setWorkOrders(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch work orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 w-16 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32 text-red-500">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-700">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3">
              Work Order
            </th>
            <th scope="col" className="px-4 py-3">
              Customer
            </th>
            <th scope="col" className="px-4 py-3">
              Service
            </th>
            <th scope="col" className="px-4 py-3">
              Date
            </th>
            <th scope="col" className="px-4 py-3">
              Status
            </th>
            <th scope="col" className="px-4 py-3">
              Priority
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((order) => (
            <tr key={order.id} className="bg-white border-b hover:bg-slate-50">
              <th scope="row" className="px-4 py-4 font-medium text-slate-900 whitespace-nowrap">
                {order.id.slice(0, 8)}
              </th>
              <td className="px-4 py-4">{order.customer}</td>
              <td className="px-4 py-4">{order.service}</td>
              <td className="px-4 py-4">{order.date}</td>
              <td className="px-4 py-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-4">
                <PriorityIcon priority={order.priority} />
              </td>
              <td className="px-4 py-4 text-right">
                <Button variant="secondary" size="sm">
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
