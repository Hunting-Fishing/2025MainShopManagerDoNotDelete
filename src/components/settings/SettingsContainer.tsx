
import React from 'react';
import { Tabs } from '@/components/ui/tabs';
import { SettingsGroupedTabsList } from './SettingsGroupedTabsList';
import { SettingsTabContent } from './SettingsTabContent';
import { SearchInput } from './SearchInput';
import { useSettingsNavigation } from '@/hooks/useSettingsNavigation';
import { useSettingsSearch } from '@/hooks/useSettingsSearch';

interface SettingsContainerProps {
  initialTab?: string;
  className?: string;
}

export const SettingsContainer: React.FC<SettingsContainerProps> = ({ 
  initialTab,
  className 
}) => {
  const { activeTab, setActiveTab, tabs, sections } = useSettingsNavigation(initialTab);
  const { 
    searchQuery, 
    setSearchQuery, 
    filteredSections, 
    isSearching,
    hasResults 
  } = useSettingsSearch(sections);

  return (
    <div className={`w-full ${className || ''}`}>
      <div className="mb-6">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search settings..."
          className="w-full max-w-md"
        />
        {isSearching && (
          <p className="text-sm text-muted-foreground mt-2">
            {hasResults 
              ? `Found ${filteredSections.reduce((acc, section) => acc + section.tabs.length, 0)} settings`
              : 'No settings found matching your search'
            }
          </p>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="border-b border-border pb-6">
          <SettingsGroupedTabsList 
            sections={isSearching ? filteredSections : sections}
            searchQuery={searchQuery}
          />
        </div>
        <div className="py-6">
          <SettingsTabContent tabs={tabs} />
        </div>
      </Tabs>
    </div>
  );
};
