
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
  const sentAt = new Date().toISOString();
  const { data: logEntry, error: logError } = await supabase
    .from('sms_logs')
    .insert({
      customer_id: customerId || null,
      phone_number: phoneNumber,
      message,
      template_id: templateId || null,
      status: 'queued',
      sent_at: sentAt
    })
    .select()
    .single();

  if (logError) {
    throw logError;
  }

  return {
    success: true,
    status: 'queued',
    logId: logEntry?.id,
    message: 'SMS queued'
  };
};
