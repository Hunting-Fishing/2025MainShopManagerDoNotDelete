
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SettingsPageHeader } from "./SettingsPageHeader";
import { SettingsLoadingState } from "./SettingsLoadingState";

interface SettingsPageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultTab?: string;
  isLoading?: boolean;
  loadingMessage?: string;
  showBackButton?: boolean;
  backPath?: string;
}

export const SettingsPageLayout: React.FC<SettingsPageLayoutProps> = ({ 
  title, 
  description, 
  children,
  defaultTab,
  isLoading = false,
  loadingMessage,
  showBackButton = true,
  backPath = "/settings"
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If there's a tab parameter in the URL, and we have a defaultTab, append it to the URL
    if (defaultTab && !location.search.includes('tab=')) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.set('tab', defaultTab);
      navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
    }
  }, [location, navigate, defaultTab]);

  return (
    <div className="w-full px-4 py-8 max-w-none">
      <SettingsPageHeader
        title={title}
        description={description}
        showBackButton={showBackButton}
        backPath={backPath}
      />

      <div className="mt-6">
        {isLoading ? (
          <SettingsLoadingState message={loadingMessage} />
        ) : (
          children
        )}
      </div>
    </div>
  );
};
