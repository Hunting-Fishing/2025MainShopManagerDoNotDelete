
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkOrders() {
  return (
    <>
      <Helmet>
        <title>Work Orders | AutoShop Pro</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
            <p className="text-muted-foreground">
              Manage and track all work orders
            </p>
          </div>
          <Button asChild>
            <Link to="/work-orders/create">
              <Plus className="h-4 w-4 mr-2" />
              New Work Order
            </Link>
          </Button>
        </div>
        
        <div className="rounded-lg border p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Work Orders</h3>
          <p className="text-muted-foreground mb-4">
            Work orders functionality is being implemented
          </p>
          <Button asChild>
            <Link to="/work-orders/create">Create First Work Order</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
