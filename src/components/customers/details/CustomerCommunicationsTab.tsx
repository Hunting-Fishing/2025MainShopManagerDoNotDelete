
import React from 'react';
import { Customer, CustomerCommunication } from '@/types/customer';
import { CommunicationHistory } from '../communications/CommunicationHistory';

interface CustomerCommunicationsTabProps {
  customer: Customer;
  communications: CustomerCommunication[];
  onCommunicationAdded?: () => void;
}

export function CustomerCommunicationsTab({ 
  customer, 
  communications, 
  onCommunicationAdded 
}: CustomerCommunicationsTabProps) {
  return (
    <div className="space-y-6">
      <CommunicationHistory 
        customer={customer} 
        communications={communications} 
        onCommunicationAdded={(communication) => {
          if (onCommunicationAdded) {
            onCommunicationAdded();
          }
        }} 
      />
    </div>
  );
}
