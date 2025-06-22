
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Generic placeholder component
const PlaceholderPage = ({ 
  title, 
  description, 
  backPath = '/' 
}: { 
  title: string; 
  description: string; 
  backPath?: string; 
}) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Helmet>
        <title>{title} | AutoShop Pro</title>
      </Helmet>
      
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        
        <div className="rounded-lg border p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">
            This feature is currently under development
          </p>
          <Button asChild>
            <Link to={backPath}>Go Back</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

// Export all placeholder pages
export const WorkOrderDetails = () => <PlaceholderPage title="Work Order Details" description="View and manage work order details" backPath="/work-orders" />;
export const WorkOrderCreate = () => <PlaceholderPage title="Create Work Order" description="Create a new work order" backPath="/work-orders" />;
export const WorkOrderEdit = () => <PlaceholderPage title="Edit Work Order" description="Edit work order information" backPath="/work-orders" />;
export const CustomerDetails = () => <PlaceholderPage title="Customer Details" description="View customer information and history" backPath="/customers" />;
export const CustomerCreate = () => <PlaceholderPage title="Add Customer" description="Add a new customer to your database" backPath="/customers" />;
export const CustomerEdit = () => <PlaceholderPage title="Edit Customer" description="Edit customer information" backPath="/customers" />;
export const Inventory = () => <PlaceholderPage title="Inventory" description="Manage your parts and supplies inventory" />;
export const InventoryCreate = () => <PlaceholderPage title="Add Inventory Item" description="Add new items to your inventory" backPath="/inventory" />;
export const Invoices = () => <PlaceholderPage title="Invoices" description="Manage billing and invoices" />;
export const InvoiceDetails = () => <PlaceholderPage title="Invoice Details" description="View invoice details" backPath="/invoices" />;
export const InvoiceCreate = () => <PlaceholderPage title="Create Invoice" description="Create a new invoice" backPath="/invoices" />;
export const Calendar = () => <PlaceholderPage title="Calendar" description="Schedule and manage appointments" />;
export const Equipment = () => <PlaceholderPage title="Equipment" description="Manage shop equipment and tools" />;
export const EquipmentDetails = () => <PlaceholderPage title="Equipment Details" description="View equipment details and maintenance" backPath="/equipment" />;
export const Maintenance = () => <PlaceholderPage title="Maintenance" description="Equipment maintenance scheduling" />;
export const Reports = () => <PlaceholderPage title="Reports" description="Business analytics and reports" />;
export const Analytics = () => <PlaceholderPage title="Analytics" description="Business performance analytics" />;
export const Team = () => <PlaceholderPage title="Team" description="Manage team members and roles" />;
export const TeamMemberProfile = () => <PlaceholderPage title="Team Member" description="View team member profile" backPath="/team" />;
export const TeamCreate = () => <PlaceholderPage title="Add Team Member" description="Add a new team member" backPath="/team" />;
export const Notifications = () => <PlaceholderPage title="Notifications" description="Manage your notifications" />;
export const Forms = () => <PlaceholderPage title="Forms" description="Custom forms and templates" />;
export const Chat = () => <PlaceholderPage title="Chat" description="Team communication" />;
export const Feedback = () => <PlaceholderPage title="Feedback" description="Customer feedback and reviews" />;
