
export interface WorkOrder {
  id: string;
  customerId: string;
  vehicleId?: string;
  advisorId?: string;
  technicianId?: string;
  estimatedHours?: number;
  totalCost?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  startTime?: string;
  endTime?: string;
  serviceCategoryId?: string;
  invoicedAt?: string;
  status: string;
  description?: string;
  serviceType?: string;
  invoiceId?: string;
}
