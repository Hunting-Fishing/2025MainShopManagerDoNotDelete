
import { supabase } from "@/integrations/supabase/client";

interface CallParams {
  phone_number: string;
  call_type: 'appointment_reminder' | 'service_update' | 'satisfaction_survey';
  customer_id?: string;
  notes?: string;
}

interface SmsParams {
  phone_number: string;
  message: string;
  customer_id?: string;
  template_id?: string;
}

export const initiateVoiceCall = async (params: CallParams) => {
  try {
    const { data, error } = await supabase.functions.invoke('voice-call', {
      body: {
        action: 'initiate_call',
        phone_number: params.phone_number,
        call_type: params.call_type,
        customer_id: params.customer_id,
        notes: params.notes
      },
    });

    if (error) throw error;

    // Log the call to the database
    console.log('Voice call initiated:', data);
    
    return data;
  } catch (error) {
    console.error('Error initiating call:', error);
    throw error;
  }
};

export const sendSms = async (params: SmsParams) => {
  try {
    const { data, error } = await supabase.functions.invoke('voice-call', {
      body: {
        action: 'send_sms',
        phone_number: params.phone_number,
        message: params.message,
        customer_id: params.customer_id,
        template_id: params.template_id
      },
    });

    if (error) throw error;

    // Log the SMS to the database
    console.log('SMS sent:', data);
    
    return data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

export const getCallHistory = async (customerId: string) => {
  try {
    // This would be implemented to fetch call history from the database
    // For now, returning mock data
    return [
      {
        id: '1',
        customer_id: customerId,
        phone_number: '+15551234567',
        call_type: 'appointment_reminder',
        status: 'completed',
        duration: 45,
        created_at: new Date().toISOString(),
        notes: 'Customer confirmed appointment',
      },
      {
        id: '2',
        customer_id: customerId,
        phone_number: '+15551234567',
        call_type: 'service_update',
        status: 'completed',
        duration: 32,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        notes: 'Informed customer about completed service',
      },
    ];
  } catch (error) {
    console.error('Error fetching call history:', error);
    throw error;
  }
};

// Add a type for the VoiceCallType
export type VoiceCallType = 'appointment_reminder' | 'service_update' | 'satisfaction_survey';
