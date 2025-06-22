
import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function Dashboard() {
  return (
    <>
      <Helmet>
        <title>Dashboard | AutoShop Pro</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your shop management dashboard
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Work Orders</h3>
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Active this week</p>
          </div>
          
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Customers</h3>
            <p className="text-2xl font-bold">48</p>
            <p className="text-sm text-muted-foreground">Total customers</p>
          </div>
          
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Revenue</h3>
            <p className="text-2xl font-bold">$12,450</p>
            <p className="text-sm text-muted-foreground">This month</p>
          </div>
          
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">Inventory</h3>
            <p className="text-2xl font-bold">156</p>
            <p className="text-sm text-muted-foreground">Items in stock</p>
          </div>
        </div>
      </div>
    </>
  );
}
