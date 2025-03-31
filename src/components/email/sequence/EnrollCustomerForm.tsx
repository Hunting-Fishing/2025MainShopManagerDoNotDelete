
import React, { useState } from 'react';
import { useEmailSequences } from '@/hooks/email/useEmailSequences';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface EnrollCustomerFormProps {
  sequenceId: string;
  onClose: () => void;
}

export const EnrollCustomerForm: React.FC<EnrollCustomerFormProps> = ({ sequenceId, onClose }) => {
  const [customerId, setCustomerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enrollCustomer } = useEmailSequences();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a customer ID",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await enrollCustomer(sequenceId, customerId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Customer enrolled successfully",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error enrolling customer:", error);
      toast({
        title: "Error",
        description: "Failed to enroll customer",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customerId">Customer ID</Label>
        <Input
          id="customerId"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="Enter customer ID"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enrolling..." : "Enroll Customer"}
        </Button>
      </div>
    </form>
  );
};
