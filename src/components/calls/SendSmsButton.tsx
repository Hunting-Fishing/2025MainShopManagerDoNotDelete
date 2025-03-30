
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { sendSms } from '@/services/calls/callService';

interface SendSmsButtonProps {
  phoneNumber: string;
  message: string;
  customerId?: string;
  templateId?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

export const SendSmsButton = ({
  phoneNumber,
  message,
  customerId,
  templateId,
  variant = 'outline',
  size = 'sm',
  className = '',
  disabled = false
}: SendSmsButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendSms = async () => {
    if (!phoneNumber || !message) {
      toast({
        title: "Error",
        description: "Phone number and message are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendSms({
        phone_number: phoneNumber,
        message: message,
        customer_id: customerId,
        template_id: templateId
      });

      toast({
        title: "SMS sent",
        description: "The SMS message has been sent successfully",
      });
    } catch (error) {
      console.error("Error sending SMS:", error);
      toast({
        title: "SMS failed",
        description: "Could not send the SMS. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSendSms}
      disabled={disabled || isLoading}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      {isLoading ? "Sending..." : "Send SMS"}
    </Button>
  );
};
