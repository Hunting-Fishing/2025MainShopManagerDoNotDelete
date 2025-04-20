
export interface WorkOrderNotification {
  id: string;
  workOrderId: string;
  notificationType: 'status_update' | 'completion' | 'cancellation' | 'assignment';
  title: string;
  message: string;
  recipientType: 'customer' | 'technician';
  recipientId: string;
  status: 'pending' | 'sent' | 'error';
  sentAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowRule {
  id: string;
  name: string;
  description?: string;
  triggerStatus: string;
  nextStatus: string;
  conditions: Record<string, any>;
  actions: Record<string, any>;
  isActive: boolean;
}
