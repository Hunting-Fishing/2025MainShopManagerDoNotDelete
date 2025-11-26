
import React from 'react';
import { SettingsGroupedTabsList } from './SettingsGroupedTabsList';
import { SearchInput } from './SearchInput';
import { SETTINGS_SECTIONS } from '@/config/settingsConfig';
import { useSettingsSearch } from '@/hooks/useSettingsSearch';

interface SettingsContainerProps {
  className?: string;
}

export const SettingsContainer: React.FC<SettingsContainerProps> = ({ 
  className 
}) => {
  const { 
    searchQuery, 
    setSearchQuery, 
    filteredSections, 
    isSearching,
    hasResults 
  } = useSettingsSearch(SETTINGS_SECTIONS);

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
          <p className="text-sm text-muted-foreground mt-2" role="status" aria-live="polite" aria-atomic="true">
            {hasResults 
              ? `Found ${filteredSections.reduce((acc, section) => acc + section.tabs.length, 0)} settings`
              : 'No settings found matching your search'
            }
          </p>
        )}
      </div>
      
      <SettingsGroupedTabsList 
        sections={isSearching ? filteredSections : SETTINGS_SECTIONS}
        searchQuery={searchQuery}
      />
    </div>
  );
};
