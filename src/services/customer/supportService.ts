import { supabase } from "@/integrations/supabase/client";

export interface SupportTicket {
  id: string;
  user_id: string;
  order_id?: string;
  ticket_number: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  category: 'order' | 'product' | 'payment' | 'shipping' | 'returns' | 'technical' | 'other';
  assigned_to?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  attachments: any[];
  created_at: string;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  category: SupportTicket['category'];
  priority?: SupportTicket['priority'];
  order_id?: string;
}

export interface CreateMessageRequest {
  ticket_id: string;
  message: string;
  attachments?: any[];
}

export const supportService = {
  // Get user tickets
  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single ticket
  async getTicket(ticketId: string): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create ticket
  async createTicket(userId: string, ticket: CreateTicketRequest): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        ...ticket,
        priority: ticket.priority || 'medium'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get ticket messages
  async getTicketMessages(ticketId: string): Promise<SupportTicketMessage[]> {
    const { data, error } = await supabase
      .from('support_ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Send message
  async sendMessage(userId: string, message: CreateMessageRequest): Promise<SupportTicketMessage> {
    const { data, error } = await supabase
      .from('support_ticket_messages')
      .insert({
        user_id: userId,
        ...message,
        attachments: message.attachments || []
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update ticket status
  async updateTicketStatus(ticketId: string, status: SupportTicket['status']): Promise<SupportTicket> {
    const updateData: any = { status };
    if (status === 'resolved' || status === 'closed') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('support_tickets')
      .update(updateData)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscribe to ticket updates
  subscribeToTicketUpdates(ticketId: string, callback: (data: any) => void) {
    return supabase
      .channel(`support_ticket_${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${ticketId}`
        },
        callback
      )
      .subscribe();
  },

  // Subscribe to ticket messages
  subscribeToTicketMessages(ticketId: string, callback: (message: SupportTicketMessage) => void) {
    return supabase
      .channel(`support_messages_${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_ticket_messages',
          filter: `ticket_id=eq.${ticketId}`
        },
        (payload) => {
          callback(payload.new as SupportTicketMessage);
        }
      )
      .subscribe();
  }
};