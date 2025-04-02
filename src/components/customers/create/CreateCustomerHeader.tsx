
import React from "react";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { ImportCustomersDialog } from "@/components/customers/form/import/ImportCustomersDialog";

interface CreateCustomerHeaderProps {
  onImportComplete: () => void;
}

export const CreateCustomerHeader: React.FC<CreateCustomerHeaderProps> = ({ 
  onImportComplete 
}) => {
  return (
    <div className="flex items-center justify-between">
      <WorkOrderFormHeader
        title="Add New Customer"
        description="Create a new customer record in the system"
      />
      <ImportCustomersDialog onImportComplete={onImportComplete} />
    </div>
  );
};
