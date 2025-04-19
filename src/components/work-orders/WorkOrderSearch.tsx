import React, { useState } from 'react';
import { useWorkOrderSearch } from "@/hooks/workOrders/useWorkOrderSearch";
import { WorkOrderSearchParams } from "@/utils/workOrders/workOrderSearch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export const WorkOrderSearch: React.FC = () => {
  const { 
    workOrders, 
    total, 
    loading, 
    searchOrders, 
    page, 
    setPage 
  } = useWorkOrderSearch();

  const [searchParams, setSearchParams] = useState<WorkOrderSearchParams>({});

  const handleSearch = () => {
    searchOrders(searchParams);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input 
          placeholder="Search work orders" 
          onChange={(e) => setSearchParams({
            ...searchParams,
            query: e.target.value
          })}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      <div className="flex space-x-4">
        <div>
          <h4>Status</h4>
          {['pending', 'in-progress', 'completed', 'cancelled'].map(status => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox 
                onCheckedChange={(checked) => {
                  const currentStatuses = searchParams.status || [];
                  setSearchParams({
                    ...searchParams,
                    status: checked 
                      ? [...currentStatuses, status] 
                      : currentStatuses.filter(s => s !== status)
                  });
                }}
              />
              <span>{status}</span>
            </div>
          ))}
        </div>
        <div>
          <h4>Priority</h4>
          {['low', 'medium', 'high'].map(priority => (
            <div key={priority} className="flex items-center space-x-2">
              <Checkbox 
                onCheckedChange={(checked) => {
                  const currentPriorities = searchParams.priority || [];
                  setSearchParams({
                    ...searchParams,
                    priority: checked 
                      ? [...currentPriorities, priority] 
                      : currentPriorities.filter(p => p !== priority)
                  });
                }}
              />
              <span>{priority}</span>
            </div>
          ))}
        </div>
        <div>
          <h4>Date Range</h4>
          <div className="space-y-2">
            <div>
              <label className="text-sm">From</label>
              <Input 
                type="date" 
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  dateFrom: e.target.value
                })}
              />
            </div>
            <div>
              <label className="text-sm">To</label>
              <Input 
                type="date" 
                onChange={(e) => setSearchParams({
                  ...searchParams,
                  dateTo: e.target.value
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Work Order Results Table */}
      {workOrders.length > 0 && (
        <div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Priority</th>
                <th className="p-2 text-left">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map(order => (
                <tr key={order.id} className="border-t">
                  <td className="p-2">{order.id}</td>
                  <td className="p-2">{order.description}</td>
                  <td className="p-2">{order.customer}</td>
                  <td className="p-2">{order.status}</td>
                  <td className="p-2">{order.priority}</td>
                  <td className="p-2">{new Date(order.dueDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-between items-center">
            <p>Total Results: {total}</p>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                disabled={page === 1 || loading}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                disabled={page * 10 >= total || loading}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
