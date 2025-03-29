
import { SettingsLayout } from "@/components/settings/SettingsLayout";

const SettingsPage = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <SettingsLayout />
    </div>
  );
};

export default SettingsPage;
