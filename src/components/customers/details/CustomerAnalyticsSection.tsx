
import React from 'react';
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from '@/components/ui/card';
import { CustomerLifetimeValueCard } from '@/components/analytics/CustomerLifetimeValueCard';
import { CustomerRetentionRiskCard } from '@/components/analytics/CustomerRetentionRiskCard';
import { CustomerSegmentBadges } from '@/components/analytics/CustomerSegmentBadges';
import { Customer } from '@/types/customer';

interface CustomerAnalyticsSectionProps {
  customer: Customer;
}

export const CustomerAnalyticsSection: React.FC<CustomerAnalyticsSectionProps> = ({ customer }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Customer Segments</h3>
        <CustomerSegmentBadges customerId={customer.id} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomerLifetimeValueCard customerId={customer.id} />
        <CustomerRetentionRiskCard customerId={customer.id} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Analytics Insights</CardTitle>
          <CardDescription>
            Data-driven recommendations for this customer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-sm">Recommended Actions</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs font-medium mr-2 mt-0.5">Service</span>
                <span>Schedule a follow-up call to check on their recent service</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs font-medium mr-2 mt-0.5">Opportunity</span>
                <span>Offer a seasonal tune-up package based on service history</span>
              </li>
              <li className="flex items-start">
                <span className="bg-amber-100 text-amber-800 rounded-full px-2 py-0.5 text-xs font-medium mr-2 mt-0.5">Retention</span>
                <span>Send a loyalty program invitation to strengthen relationship</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-sm">Predicted Future Needs</h4>
            <ul className="mt-2 space-y-2 text-sm">
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-800 rounded-full px-2 py-0.5 text-xs font-medium mr-2 mt-0.5">90 Days</span>
                <span>Routine maintenance based on service interval</span>
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-800 rounded-full px-2 py-0.5 text-xs font-medium mr-2 mt-0.5">6 Months</span>
                <span>Seasonal system check before winter months</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
