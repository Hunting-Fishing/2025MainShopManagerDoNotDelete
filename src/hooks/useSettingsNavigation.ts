
import { useState, useCallback } from 'react';
import { SETTINGS_TABS, DEFAULT_SETTINGS_TAB } from '@/config/settingsConfig';

export interface UseSettingsNavigationResult {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: typeof SETTINGS_TABS;
  currentTab: typeof SETTINGS_TABS[0] | undefined;
  isValidTab: (tab: string) => boolean;
}

export const useSettingsNavigation = (initialTab?: string): UseSettingsNavigationResult => {
  const [activeTab, setActiveTabState] = useState(
    initialTab || DEFAULT_SETTINGS_TAB
  );

  const isValidTab = useCallback((tab: string): boolean => {
    return SETTINGS_TABS.some(t => t.id === tab);
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    if (isValidTab(tab)) {
      setActiveTabState(tab);
    }
  }, [isValidTab]);

  const currentTab = SETTINGS_TABS.find(tab => tab.id === activeTab);

  return {
    activeTab,
    setActiveTab,
    tabs: SETTINGS_TABS,
    currentTab,
    isValidTab
  };
};
