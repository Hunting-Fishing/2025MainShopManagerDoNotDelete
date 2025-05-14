
import React from "react";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { LabourRatesTab } from "@/components/settings/LabourRatesTab";

export const LabourSettings = () => {
  return (
    <SettingsPageLayout 
      title="Labour Rates"
      description="Configure hourly rates for different service types"
    >
      <LabourRatesTab />
    </SettingsPageLayout>
  );
};

export default LabourSettings;
