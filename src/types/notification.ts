
export interface WorkOrderNotification {
  id: string;
  work_order_id: string;
  notification_type: string;
  title: string;
  message: string;
  recipient_type: string;
  recipient_id: string;
  status: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}
