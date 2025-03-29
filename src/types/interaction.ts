
import { TeamMember } from "./team";

export type InteractionType = 
  | 'work_order'
  | 'communication' 
  | 'parts' 
  | 'service' 
  | 'follow_up';

export type InteractionStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed' 
  | 'cancelled';

export interface CustomerInteraction {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  type: InteractionType;
  description: string;
  staffMemberId: string;
  staffMemberName: string;
  status: InteractionStatus;
  notes?: string;
  relatedWorkOrderId?: string;
  followUpDate?: string;
  followUpCompleted?: boolean;
}

export interface InteractionFilters {
  type?: InteractionType;
  staffMemberId?: string;
  status?: InteractionStatus;
  dateFrom?: Date;
  dateTo?: Date;
}
