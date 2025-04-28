
import React from "react";
import { SettingsPageLayout } from "@/components/settings/SettingsPageLayout";
import { AccountTab } from "@/components/settings/AccountTab";

export const AccountSettings = () => {
  return (
    <SettingsPageLayout 
      title="Account Settings"
      description="Manage your profile and account preferences"
    >
      <AccountTab />
    </SettingsPageLayout>
  );
};

export default AccountSettings;
