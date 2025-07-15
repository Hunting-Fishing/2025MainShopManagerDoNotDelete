import React from 'react';
import { TabsTrigger } from '@/components/ui/tabs';
import { SettingsSection } from '@/types/settingsConfig';

interface SettingsGroupedTabsListProps {
  sections: SettingsSection[];
  className?: string;
}

export const SettingsGroupedTabsList: React.FC<SettingsGroupedTabsListProps> = ({ 
  sections, 
  className 
}) => {
  return (
    <div className={`w-full space-y-6 ${className || ''}`}>
      {sections.map((section) => (
        <div key={section.id} className="space-y-3">
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
            {section.description && (
              <p className="text-xs text-muted-foreground">{section.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {section.tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center justify-center p-4 h-auto text-xs font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm gap-2 hover:bg-muted rounded-lg border border-border data-[state=active]:border-primary"
                  title={tab.description}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-center leading-tight">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};