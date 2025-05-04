
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CallHistory } from '@/components/calls/CallHistory';
import { Phone, MessageSquare } from 'lucide-react';
import { SendSmsButton } from '@/components/calls/SendSmsButton';
import { VoiceCallButton } from '@/components/calls/VoiceCallButton';
import { WorkOrder } from '@/types/workOrder';

interface CallLoggerProps {
  workOrder: WorkOrder;
}

export function CallLogger({ workOrder }: CallLoggerProps) {
  const phoneNumber = ""; // This would come from customer data in a real app
  const customerName = workOrder.customer;
  const customerId = ""; // This would be the actual customer ID in a real app
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">
          Customer Communications
        </CardTitle>
        <div className="flex items-center space-x-2">
          <SendSmsButton 
            phoneNumber={phoneNumber} 
            message={`Hello ${customerName}, regarding your work order ${workOrder.id}`} 
            customerId={customerId}
            variant="outline"
            size="sm"
          />
          <VoiceCallButton
            phoneNumber={phoneNumber}
            callType="appointment_reminder" 
            customerId={customerId}
            variant="outline"
            size="sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <CallHistory customerId={customerId || ""} />
      </CardContent>
    </Card>
  );
}
