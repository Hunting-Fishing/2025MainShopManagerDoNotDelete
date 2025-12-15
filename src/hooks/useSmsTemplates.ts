
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SmsTemplate {
  id: string;
  name: string;
  content: string;
  category?: string;
  description?: string;
}

export const useSmsTemplates = (enabled = true) => {
  return useQuery({
    queryKey: ['smsTemplates'],
    queryFn: async (): Promise<SmsTemplate[]> => {
      const { data, error } = await supabase.from('sms_templates').select('*');
      if (error) throw error;
      return data || [];
    },
    enabled,
  });
};

// SMS sending - Coming Soon (requires Twilio integration)
export const sendSms = async (
  customerId: string, 
  phoneNumber: string, 
  message: string, 
  templateId?: string
) => {
  // Log the attempt to SMS logs table with pending status
  const { error } = await supabase.from('sms_logs').insert({
    customer_id: customerId,
    phone_number: phoneNumber,
    message: message,
    template_id: templateId || null,
    status: 'pending' // SMS sending coming soon - requires Twilio integration
  });
  
  if (error) throw error;
  
  // TODO: Implement edge function for Twilio integration
  // Coming Soon - SMS will be queued and sent when Twilio is configured
  return { success: true, message: 'SMS queued - sending coming soon' };
};
