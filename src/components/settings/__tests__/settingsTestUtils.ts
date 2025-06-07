
import React from 'react';
import { SettingsTabConfig } from '@/types/settingsConfig';
import { Building2 } from 'lucide-react';

export const createMockSettingsTab = (overrides?: Partial<SettingsTabConfig>): SettingsTabConfig => ({
  id: 'test-tab',
  label: 'Test Tab',
  icon: Building2,
  component: () => React.createElement('div', null, 'Test Component'),
  description: 'Test description',
  ...overrides
});

export const createMockSettingsTabs = (count: number = 3): SettingsTabConfig[] => {
  return Array.from({ length: count }, (_, index) => 
    createMockSettingsTab({
      id: `test-tab-${index}`,
      label: `Test Tab ${index + 1}`
    })
  );
};
