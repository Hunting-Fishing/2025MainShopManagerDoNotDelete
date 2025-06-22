
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <>
      <Helmet>
        <title>{title} | AutoShop Pro</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        <div className="rounded-lg border p-8 text-center">
          <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            The {title.toLowerCase()} feature is currently under development.
          </p>
        </div>
      </div>
    </>
  );
}

export const Team = () => (
  <PlaceholderPage 
    title="Team Management" 
    description="Manage your team members and their roles"
  />
);

export const Chat = () => (
  <PlaceholderPage 
    title="Chat" 
    description="Communicate with your team and customers"
  />
);

export const Forms = () => (
  <PlaceholderPage 
    title="Forms" 
    description="Create and manage custom forms"
  />
);

export const Calendar = () => (
  <PlaceholderPage 
    title="Calendar" 
    description="Schedule appointments and manage your time"
  />
);

export const Reports = () => (
  <PlaceholderPage 
    title="Reports" 
    description="View detailed reports and analytics"
  />
);

export const Invoices = () => (
  <PlaceholderPage 
    title="Invoices" 
    description="Create and manage customer invoices"
  />
);

export const Equipment = () => (
  <PlaceholderPage 
    title="Equipment" 
    description="Track and manage your shop equipment"
  />
);

export const Feedback = () => (
  <PlaceholderPage 
    title="Feedback" 
    description="Collect and manage customer feedback"
  />
);

export const Analytics = () => (
  <PlaceholderPage 
    title="Analytics" 
    description="View advanced analytics and insights"
  />
);

export const Inventory = () => (
  <PlaceholderPage 
    title="Inventory" 
    description="Manage your parts and inventory"
  />
);

export const TeamCreate = () => (
  <PlaceholderPage 
    title="Add Team Member" 
    description="Add a new team member to your organization"
  />
);
