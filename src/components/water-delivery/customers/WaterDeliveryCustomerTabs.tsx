import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  MapPin, 
  Container, 
  ClipboardList, 
  FileText, 
  Receipt, 
  StickyNote 
} from 'lucide-react';
import { CustomerOverviewTab } from './tabs/CustomerOverviewTab';
import { CustomerLocationsTab } from './tabs/CustomerLocationsTab';
import { CustomerTanksTab } from './tabs/CustomerTanksTab';
import { CustomerOrdersTab } from './tabs/CustomerOrdersTab';
import { CustomerQuotesTab } from './tabs/CustomerQuotesTab';
import { CustomerInvoicesTab } from './tabs/CustomerInvoicesTab';
import { CustomerNotesTab } from './tabs/CustomerNotesTab';

interface WaterDeliveryCustomerTabsProps {
  customerId: string;
}

export function WaterDeliveryCustomerTabs({ customerId }: WaterDeliveryCustomerTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <LayoutDashboard className="h-4 w-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="locations" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Locations</span>
        </TabsTrigger>
        <TabsTrigger value="tanks" className="flex items-center gap-2">
          <Container className="h-4 w-4" />
          <span className="hidden sm:inline">Tanks</span>
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          <span className="hidden sm:inline">Orders</span>
        </TabsTrigger>
        <TabsTrigger value="quotes" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Quotes</span>
        </TabsTrigger>
        <TabsTrigger value="invoices" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Invoices</span>
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          <span className="hidden sm:inline">Notes</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        <CustomerOverviewTab customerId={customerId} />
      </TabsContent>

      <TabsContent value="locations" className="mt-6">
        <CustomerLocationsTab customerId={customerId} />
      </TabsContent>

      <TabsContent value="tanks" className="mt-6">
        <CustomerTanksTab customerId={customerId} />
      </TabsContent>

      <TabsContent value="orders" className="mt-6">
        <CustomerOrdersTab customerId={customerId} />
      </TabsContent>

      <TabsContent value="quotes" className="mt-6">
        <CustomerQuotesTab customerId={customerId} />
      </TabsContent>

      <TabsContent value="invoices" className="mt-6">
        <CustomerInvoicesTab customerId={customerId} />
      </TabsContent>

      <TabsContent value="notes" className="mt-6">
        <CustomerNotesTab customerId={customerId} />
      </TabsContent>
    </Tabs>
  );
}
