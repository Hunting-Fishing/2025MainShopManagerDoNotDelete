
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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization settings and preferences
          </p>
        </div>
        
        <Routes>
          <Route path="/*" element={<SettingsContainer />} />
        </Routes>
      </div>
    </div>
  );
}
