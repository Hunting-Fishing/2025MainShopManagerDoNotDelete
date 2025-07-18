import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsSection } from '@/types/settingsConfig';

interface SettingsGroupedTabsListProps {
  sections: SettingsSection[];
  className?: string;
  searchQuery?: string;
}

// Helper function to highlight search matches
const highlightMatch = (text: string, searchQuery?: string) => {
  if (!searchQuery || !text) return text;
  
  const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100">
        {part}
      </mark>
    ) : part
  );
};

export const SettingsGroupedTabsList: React.FC<SettingsGroupedTabsListProps> = ({ 
  sections, 
  className,
  searchQuery 
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
          
          <TabsList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 h-auto bg-transparent p-0">
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
                    <span className="text-center leading-tight">
                      {highlightMatch(tab.label, searchQuery)}
                    </span>
                    {searchQuery && tab.description && (
                      <span className="text-xs text-muted-foreground text-center leading-tight">
                        {highlightMatch(tab.description, searchQuery)}
                      </span>
                    )}
                  </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      ))}
    </div>
  );
};