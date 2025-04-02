
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

export const sendSms = async (
  customerId: string, 
  phoneNumber: string, 
  message: string, 
  templateId?: string
) => {
  // In a real implementation, this would call a Supabase Edge Function
  // that connects to Twilio or another SMS provider
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  
  // Log to SMS logs table
  const { error } = await supabase.from('sms_logs').insert({
    customer_id: customerId,
    phone_number: phoneNumber,
    message: message,
    template_id: templateId || null,
    status: 'sent' // In a real implementation, this would be set by the response
  });
  
  if (error) throw error;
  
  return { success: true };
};
