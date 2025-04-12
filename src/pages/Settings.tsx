
import { useState } from "react";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const SettingsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("account");
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and application settings
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6">
          <SettingsLayout />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
