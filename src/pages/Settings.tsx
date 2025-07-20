
import React from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export default function Settings() {
  usePageTitle('Settings');

  return <SettingsLayout />;
}
