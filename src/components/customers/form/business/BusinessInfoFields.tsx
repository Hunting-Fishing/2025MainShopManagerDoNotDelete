
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { 
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerFormValues } from "../schemas/customerSchema";
import { shops as defaultShops } from "../schemas/relationshipData";
import { requiredFields } from "../schemas/customerSchema";
import { EssentialBusinessDetails } from "./EssentialBusinessDetails";
import { PaymentBillingSection } from "./PaymentBillingSection";
import { FleetManagementSection } from "./FleetManagementSection";

interface BusinessInfoFieldsProps {
  form: UseFormReturn<CustomerFormValues>;
  availableShops?: Array<{id: string, name: string}>;
  singleShopMode?: boolean;
}

export const BusinessInfoFields: React.FC<BusinessInfoFieldsProps> = ({ 
  form,
  availableShops = defaultShops,
  singleShopMode = false
}) => {
  const [isEssentialInfoOpen, setIsEssentialInfoOpen] = React.useState(true);
  const [isPaymentBillingOpen, setIsPaymentBillingOpen] = React.useState(true);
  const [isFleetOpen, setIsFleetOpen] = React.useState(true);
  const isFleet = form.watch("is_fleet");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <CardTitle>Business Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Essential Business Details Section */}
        <EssentialBusinessDetails 
          form={form} 
          isOpen={isEssentialInfoOpen} 
          setIsOpen={setIsEssentialInfoOpen}
          availableShops={availableShops}
          singleShopMode={singleShopMode}
        />

        {/* Payment & Billing Section */}
        <PaymentBillingSection 
          form={form} 
          isOpen={isPaymentBillingOpen} 
          setIsOpen={setIsPaymentBillingOpen} 
        />

        {/* Fleet Management Section */}
        <FleetManagementSection 
          form={form} 
          isOpen={isFleetOpen} 
          setIsOpen={setIsFleetOpen}
          isFleet={isFleet}
        />
      </CardContent>
    </Card>
  );
};
