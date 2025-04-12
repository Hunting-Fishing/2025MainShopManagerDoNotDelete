
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
  const { t } = useTranslation();
  
  return (
    <ResponsiveContainer maxWidth="2xl" className="py-6">
      <div className="flex flex-col items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('settings.title', 'Settings')}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('settings.subtitle', 'Manage your account preferences and application settings')}
          </p>
        </div>
      </div>

      <SettingsLayout />
    </ResponsiveContainer>
  );
};

export default SettingsPage;
