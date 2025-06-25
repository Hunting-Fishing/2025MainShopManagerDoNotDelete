
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SettingsContainer } from '@/components/settings/SettingsContainer';

/**
 * IMPORTANT: This page uses full settings functionality
 * DO NOT replace with placeholder text - full functionality exists
 * Includes: company settings, team settings, notifications, branding, etc.
 */
export default function Settings() {
  return (
    <Routes>
      <Route path="/*" element={<SettingsContainer />} />
    </Routes>
  );
}
