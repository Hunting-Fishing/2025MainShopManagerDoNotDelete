
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export default function Settings() {
  return (
    <>
      <Helmet>
        <title>Settings | AutoShop Pro</title>
      </Helmet>
      
      <SettingsLayout />
    </>
  );
}
