
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { TabsContent } from "@/components/ui/tabs";
import { CustomerFormValues } from "./CustomerFormSchema";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { BusinessInfoFields } from "./BusinessInfoFields";
import { PreferencesFields } from "./PreferencesFields";
import { ReferralFields } from "./ReferralFields";
import { FleetFields } from "./FleetFields";
import { VehiclesFields } from "./VehiclesFields";
import { HouseholdFields } from "./HouseholdFields";
import { SegmentFields } from "./SegmentFields";

interface FormContentProps {
  form: UseFormReturn<CustomerFormValues>;
  currentTab: string;
}

export const FormContent: React.FC<FormContentProps> = ({ form, currentTab }) => {
  return (
    <>
      <TabsContent value="personal" className="mt-0">
        <div className="grid grid-cols-1 gap-6">
          <PersonalInfoFields form={form} />
        </div>
      </TabsContent>

      <TabsContent value="business" className="mt-0">
        <div className="grid grid-cols-1 gap-6">
          <BusinessInfoFields form={form} />
          <FleetFields form={form} />
        </div>
      </TabsContent>
      
      <TabsContent value="preferences" className="mt-0">
        <div className="grid grid-cols-1 gap-6">
          <PreferencesFields form={form} />
        </div>
      </TabsContent>
      
      <TabsContent value="referral" className="mt-0">
        <div className="grid grid-cols-1 gap-6">
          <ReferralFields form={form} />
        </div>
      </TabsContent>
      
      <TabsContent value="vehicles" className="mt-0">
        <div className="grid grid-cols-1 gap-6">
          <VehiclesFields form={form} />
        </div>
      </TabsContent>
      
      <TabsContent value="household" className="mt-0">
        <div className="grid grid-cols-1 gap-6">
          <HouseholdFields form={form} />
        </div>
      </TabsContent>
      
      <TabsContent value="segments" className="mt-0">
        <div className="grid grid-cols-1 gap-6">
          <SegmentFields form={form} />
        </div>
      </TabsContent>
    </>
  );
};
