import React from "react";
import { WorkOrderDetailsView } from "./WorkOrderDetailsView";

interface WorkOrderFormProps {
  onSubmit?: (values: any) => Promise<void>;
  initialValues?: any;
  prePopulatedCustomer?: {
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    title?: string;
    description?: string;
    priority?: string;
    equipmentName?: string;
    equipmentType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleLicensePlate?: string;
    vehicleVin?: string;
  };
}

// This component is now deprecated in favor of the comprehensive WorkOrderDetailsView
// Keeping it for backward compatibility but redirecting to the new interface
export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  onSubmit,
  initialValues = {},
  prePopulatedCustomer
}) => {
  console.warn('WorkOrderForm is deprecated. Use WorkOrderDetailsView instead.');
  
  return (
    <WorkOrderDetailsView 
      isCreateMode={true}
      prePopulatedData={prePopulatedCustomer}
      onCreateWorkOrder={onSubmit}
    />
  );
};
