
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsTabConfig } from '@/types/settingsConfig';

interface SettingsTabsListProps {
  tabs: SettingsTabConfig[];
  className?: string;
}

export const SettingsTabsList: React.FC<SettingsTabsListProps> = ({ 
  tabs, 
  className 
}) => {
  return (
    <TabsList className={`grid w-full grid-cols-${tabs.length} ${className || ''}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex items-center gap-2"
            title={tab.description}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
};
