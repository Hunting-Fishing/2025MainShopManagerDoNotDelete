
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Users, ShoppingBag, Clock, ClipboardList } from "lucide-react";

interface StatsCardsProps {
  stats: {
    revenue: number;
    activeOrders: number;
    customers: number;
    lowStockParts: number;
    activeWorkOrders: string;
    workOrderChange: string;
    teamMembers: string;
    teamChange: string;
    inventoryItems: string;
    inventoryChange: string;
    avgCompletionTime: string;
    completionTimeChange: string;
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Work Orders</p>
                <p className="text-2xl font-bold">{stats.activeWorkOrders}</p>
                <p className={`text-xs ${stats.workOrderChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.workOrderChange} from last month
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Team Members</p>
                <p className="text-2xl font-bold">{stats.teamMembers}</p>
                <p className={`text-xs ${stats.teamChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.teamChange} from last month
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Inventory Items</p>
                <p className="text-2xl font-bold">{stats.inventoryItems}</p>
                <p className={`text-xs ${stats.inventoryChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.inventoryChange} from last month
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">Avg. Completion Time</p>
                <p className="text-2xl font-bold">{stats.avgCompletionTime}</p>
                <p className={`text-xs ${stats.completionTimeChange.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.completionTimeChange} from last month
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
