
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
    <div className={`space-y-6 ${className || ''}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <SettingsTabsList tabs={tabs} />
        <SettingsTabContent tabs={tabs} />
      </Tabs>
    </div>
  );
};
