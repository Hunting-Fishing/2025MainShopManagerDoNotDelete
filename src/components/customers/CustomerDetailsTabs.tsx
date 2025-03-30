
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerServiceTab } from "./CustomerServiceTab";
import { CustomerInteractionsTab } from "./CustomerInteractionsTab";
import { CustomerInfoCard } from "./CustomerInfoCard";
import { CustomerSummaryCard } from "./CustomerSummaryCard";
import { CustomerLoyaltyCard } from "./loyalty/CustomerLoyaltyCard";
import { Customer } from "@/types/customer";

interface CustomerDetailsTabsProps {
  customer: Customer;
  onEdit?: () => void;
}

export const CustomerDetailsTabs = ({ customer, onEdit }: CustomerDetailsTabsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Tabs defaultValue="service">
          <TabsList className="mb-4">
            <TabsTrigger value="service">Service History</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
          </TabsList>
          <TabsContent value="service">
            <CustomerServiceTab customerId={customer.id} vehicles={customer.vehicles || []} />
          </TabsContent>
          <TabsContent value="interactions">
            <CustomerInteractionsTab customerId={customer.id} />
          </TabsContent>
        </Tabs>
      </div>
      <div className="space-y-6">
        <CustomerInfoCard customer={customer} onEdit={onEdit} />
        <CustomerSummaryCard customer={customer} />
        <CustomerLoyaltyCard customerId={customer.id} />
      </div>
    </div>
  );
};
