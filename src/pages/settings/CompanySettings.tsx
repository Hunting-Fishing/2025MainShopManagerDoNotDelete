
import React from "react";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { CompanyTab } from "@/components/settings/CompanyTab";

export const CompanySettings = () => {
  return (
    <SettingsPageLayout 
      title="Company Information"
      description="Update your business details and address"
    >
      <CompanyTab />
    </SettingsPageLayout>
  );
};

export default CompanySettings;
