import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkOrder } from "@/types/workOrder";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getWorkOrderById,
} from "@/services/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";
import { WorkOrderPart } from "@/types/workOrderPart";
import { TimeEntry } from "@/types/workOrder";
import { Customer } from "@/types/customer";
// FIX: Corrected import for getCustomerById
import { getCustomerById } from "@/services/customer";
import { getWorkOrderJobLines } from "@/services/workOrder/jobLinesService";
import { getWorkOrderParts } from "@/services/workOrder/workOrderPartsService";

interface WorkOrderDetailsViewProps {
  isEditMode: boolean;
}

export function WorkOrderDetailsView({ isEditMode }: WorkOrderDetailsViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Work Order ID is required.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch Work Order
        const wo = await getWorkOrderById(id);
        if (!wo) {
          setError("Work Order not found.");
          return;
        }
        setWorkOrder(wo);

        // Fetch Job Lines
        const lines = await getWorkOrderJobLines(id);
        setJobLines(lines);

        // Fetch Parts
        const parts = await getWorkOrderParts(id);
        setAllParts(parts);

        // Fetch Customer
        if (wo.customer_id) {
          const cust = await getCustomerById(wo.customer_id);
          setCustomer(cust);
        }

        // TODO: Fetch Time Entries - to be implemented later
        setTimeEntries([]);
      } catch (err: any) {
        setError(err.message || "Failed to load Work Order details.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleJobLinesChange = (updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  };

  const handleTimeEntriesChange = (updatedEntries: TimeEntry[]) => {
    setTimeEntries(updatedEntries);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Error: {error}</div>
          <button onClick={() => navigate(-1)} className="text-blue-500 mt-2">
            Go Back
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!workOrder) {
    return (
      <Card>
        <CardContent className="p-6">
          <div>Work Order not found.</div>
          <button onClick={() => navigate(-1)} className="text-blue-500 mt-2">
            Go Back
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <WorkOrderDetailsTabs
      workOrder={workOrder}
      jobLines={jobLines}
      allParts={allParts}
      timeEntries={timeEntries}
      customer={customer}
      onJobLinesChange={handleJobLinesChange}
      onTimeEntriesChange={handleTimeEntriesChange}
      isEditMode={isEditMode}
    />
  );
}
