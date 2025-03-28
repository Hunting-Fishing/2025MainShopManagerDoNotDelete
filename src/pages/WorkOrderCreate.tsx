
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";

// Mock data for technicians
const technicians = [
  "Michael Brown",
  "Sarah Johnson",
  "David Lee",
  "Emily Chen",
  "Unassigned",
];

export default function WorkOrderCreate() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <WorkOrderFormHeader 
        title="Create Work Order" 
        description="Create a new work order for your team to complete."
      />

      {/* Form */}
      <WorkOrderForm technicians={technicians} />
    </div>
  );
}
