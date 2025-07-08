
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { SettingsTabsList } from './SettingsTabsList';
import { SettingsTabContent } from './SettingsTabContent';
import { useSettingsNavigation } from '@/hooks/useSettingsNavigation';

interface SettingsContainerProps {
  initialTab?: string;
  className?: string;
}

export const SettingsContainer: React.FC<SettingsContainerProps> = ({ 
  initialTab,
  className 
}) => {
  const { activeTab, setActiveTab, tabs } = useSettingsNavigation(initialTab);

  return (
    <div className={`w-full ${className || ''}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="border-b border-border">
          <SettingsTabsList tabs={tabs} />
        </div>
        <div className="py-6">
          <SettingsTabContent tabs={tabs} />
        </div>
      </Tabs>
    </div>
  );
};
