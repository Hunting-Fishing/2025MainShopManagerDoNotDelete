
import React from 'react';
import { FlaggedActivitiesList } from '@/components/workOrders/FlaggedActivitiesList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FlaggedActivitiesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link to="/work-orders">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Flagged Activities</h1>
          <p className="text-slate-500">
            Review and resolve flagged work order activities that require attention
          </p>
        </div>
      </div>

      <FlaggedActivitiesList />
    </div>
  );
}
