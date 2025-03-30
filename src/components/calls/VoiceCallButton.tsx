
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { initiateVoiceCall, VoiceCallType } from '@/services/calls/callService';

interface VoiceCallButtonProps {
  phoneNumber: string;
  callType: VoiceCallType;
  customerId?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

export const VoiceCallButton = ({
  phoneNumber,
  callType,
  customerId,
  variant = 'outline',
  size = 'sm',
  className = '',
  disabled = false
}: VoiceCallButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInitiateCall = async () => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "No phone number provided",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await initiateVoiceCall({
        phone_number: phoneNumber,
        call_type: callType,
        customer_id: customerId
      });

      toast({
        title: "Call initiated",
        description: "The automated call has been initiated",
      });
    } catch (error) {
      console.error("Error initiating call:", error);
      toast({
        title: "Call failed",
        description: "Could not initiate the call. Please try again.",
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
      onClick={handleInitiateCall}
      disabled={disabled || isLoading}
    >
      <Phone className="h-4 w-4 mr-2" />
      {isLoading ? "Calling..." : "Call"}
    </Button>
  );
};
