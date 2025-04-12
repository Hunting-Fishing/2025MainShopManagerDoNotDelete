
import { useState } from "react";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

const SettingsPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('settings.title', 'Settings')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('settings.subtitle', 'Manage your account preferences and application settings')}
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <SettingsLayout />
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
