
import React from "react";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { BrandingTab } from "@/components/settings/BrandingTab";

export const BrandingSettings = () => {
  return (
    <SettingsPageLayout 
      title="Branding"
      description="Customize your shop's branding"
    >
      <BrandingTab />
    </SettingsPageLayout>
  );
};

export default BrandingSettings;
