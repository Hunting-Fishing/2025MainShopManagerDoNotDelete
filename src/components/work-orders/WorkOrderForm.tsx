import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/types/workOrder";
import { priorityMap, statusMap } from "@/utils/workOrders";

// Add "on-hold" to the list of valid statuses in the schema
const formSchema = z.object({
  status: z.enum(["pending", "in-progress", "on-hold", "completed", "cancelled"]),
});

export function WorkOrderForm() {
  const [data, setData] = useState<WorkOrder | null>(null);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "pending",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    setData(data);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3">
      <div className="space-y-4">
        <p>WorkOrderForm</p>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
