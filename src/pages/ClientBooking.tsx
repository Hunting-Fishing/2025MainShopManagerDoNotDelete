
import React from 'react';
import { CustomerLoginRequiredWithImpersonation } from '@/components/customer-portal/CustomerLoginRequiredWithImpersonation';
import { CustomerPortalHeader } from '@/components/customer-portal/CustomerPortalHeader';
import { CustomerAppointmentBooking } from '@/components/customer-portal/CustomerAppointmentBooking';

export default function ClientBooking() {
  return (
    <CustomerLoginRequiredWithImpersonation>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <CustomerPortalHeader />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <CustomerAppointmentBooking />
          </div>
        </main>
      </div>
    </CustomerLoginRequiredWithImpersonation>
  );
}
