
import React from "react";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { ImportCustomersDialog } from "@/components/customers/form/import/ImportCustomersDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface CreateCustomerHeaderProps {
  onImportComplete: () => void;
  isSubmitting: boolean;
}

export const CreateCustomerHeader: React.FC<CreateCustomerHeaderProps> = ({ 
  onImportComplete,
  isSubmitting
}) => {
  return (
    <div className="flex items-center justify-between">
      <WorkOrderFormHeader
        title="Add New Customer"
        description="Create a new customer record in the system"
      />
      <div className="flex items-center gap-3">
        <ImportCustomersDialog onImportComplete={onImportComplete} />
      </div>
    </div>
  );
};
