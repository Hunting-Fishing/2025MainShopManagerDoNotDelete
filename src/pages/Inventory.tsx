
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { InventoryPageContainer } from '@/components/inventory/InventoryPageContainer';

export default function Inventory() {
  return (
    <>
      <Helmet>
        <title>Inventory Management | ServicePro</title>
        <meta name="description" content="Manage your inventory items with real-time data" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <InventoryPageContainer />
      </div>
    </>
  );
}
